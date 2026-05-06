import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Endpoint publico para reservar turnos sin login (guest checkout).
// Crea (o reutiliza) un usuario en auth.users + profile con is_guest=true,
// inserta el turno y dispara los mails (triggers 0 y 1).

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function whatsappValido(w: string): boolean {
  const digits = w.replace(/\D/g, "");
  return digits.length >= 8;
}

type GuestInput = { nombre: string; email: string; whatsapp: string };

type ResolverGuestResult =
  | { ok: true; guestId: string; esNuevo: boolean }
  | { ok: false; error: string; status: number };

// Resuelve el guest: si ya existe como guest reutiliza, si no lo crea via auth.admin.createUser.
async function resolverGuest(
  admin: SupabaseClient,
  guest: GuestInput
): Promise<ResolverGuestResult> {
  const emailNormalizado = guest.email.trim().toLowerCase();

  // 1. Intentar match en profiles.email
  const { data: existente } = await admin
    .from("profiles")
    .select("id, is_guest")
    .eq("email", emailNormalizado)
    .maybeSingle();

  if (existente) {
    if (existente.is_guest === true) {
      // Guest recurrente: reusamos.
      return { ok: true, guestId: existente.id, esNuevo: false };
    } else {
      // Email pertenece a un usuario real (con cuenta). No reservamos como guest.
      return {
        ok: false,
        error: "Este email ya tiene cuenta. Inicia sesion para reservar.",
        status: 409,
      };
    }
  }

  // 2. No esta en profiles. Crear en auth.users (el trigger handle_new_user crea el profile basico).
  const { data: authData, error: errAuth } = await admin.auth.admin.createUser({
    email: emailNormalizado,
    email_confirm: true, // skip mail de confirmacion
    user_metadata: {
      tipo: "cliente",
      nombre: guest.nombre.trim(),
    },
  });

  if (errAuth || !authData?.user) {
    // Caso borde: el email ya existe en auth.users pero no estaba en profiles.email
    // (usuario real viejo que nunca llenamos profiles.email).
    const msg = errAuth?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered")) {
      return {
        ok: false,
        error: "Este email ya tiene cuenta. Inicia sesion para reservar.",
        status: 409,
      };
    }
    console.error("[reservar-publico] Error creando auth user:", errAuth);
    return { ok: false, error: "No se pudo crear el perfil", status: 500 };
  }

  return { ok: true, guestId: authData.user.id, esNuevo: true };
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Servidor no configurado" }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const {
      barbero_id,
      sucursal_id,
      servicio_id,
      fecha,
      hora,
      mensaje,
      guest,
    } = body as {
      barbero_id?: string;
      sucursal_id?: string;
      servicio_id?: string;
      fecha?: string;
      hora?: string;
      mensaje?: string | null;
      guest?: GuestInput;
    };

    // === Validaciones ===
    if (!barbero_id || !sucursal_id || !servicio_id || !fecha || !hora) {
      return NextResponse.json({ error: "Faltan datos del turno" }, { status: 400 });
    }
    if (!guest || !guest.nombre || !guest.email || !guest.whatsapp) {
      return NextResponse.json({ error: "Faltan datos del cliente" }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(guest.email)) {
      return NextResponse.json({ error: "Email invalido" }, { status: 400 });
    }
    if (!whatsappValido(guest.whatsapp)) {
      return NextResponse.json({ error: "WhatsApp invalido" }, { status: 400 });
    }
    if (guest.nombre.trim().length < 2) {
      return NextResponse.json({ error: "Nombre demasiado corto" }, { status: 400 });
    }

    // === Resolver guest (crear o reusar) ===
    const resolucion = await resolverGuest(admin, guest);
    if (resolucion.ok === false) {
      return NextResponse.json({ error: resolucion.error }, { status: resolucion.status });
    }
    const guestId = resolucion.guestId;
    const esNuevo = resolucion.esNuevo;

    // === Upsert profile con campos extra (whatsapp, is_guest, email, etc) ===
    // Patron consistente con app/register/page.tsx que tambien usa upsert.
    const { error: errUpsert } = await admin
      .from("profiles")
      .upsert({
        id: guestId,
        tipo: "cliente",
        nombre: guest.nombre.trim(),
        email: guest.email.trim().toLowerCase(),
        whatsapp: guest.whatsapp.trim(),
        is_guest: true,
        is_cliente: true,
      });

    if (errUpsert) {
      console.error("[reservar-publico] Error upsert profile:", errUpsert);
      // Rollback solo si era nuevo (no borrar guest recurrente):
      if (esNuevo) {
        await admin.auth.admin.deleteUser(guestId);
      }
      return NextResponse.json({ error: "No se pudo guardar el perfil" }, { status: 500 });
    }

    // === Insertar turno ===
    const { data: turno, error: errTurno } = await admin
      .from("turnos")
      .insert({
        barbero_id,
        cliente_id: guestId,
        sucursal_id,
        servicio_id,
        fecha,
        hora,
        mensaje: mensaje ?? null,
        estado: "pendiente",
      })
      .select("id")
      .single();

    if (errTurno) {
      // Rollback solo si era nuevo:
      if (esNuevo) {
        await admin.auth.admin.deleteUser(guestId);
      }

      // 23505 = unique violation (idx_turnos_slot_unico)
      if (errTurno.code === "23505") {
        return NextResponse.json(
          { error: "Ese horario acaba de ser reservado. Por favor elegi otro." },
          { status: 409 }
        );
      }
      console.error("[reservar-publico] Error insertando turno:", errTurno);
      return NextResponse.json({ error: "No se pudo crear el turno" }, { status: 500 });
    }

    // === Disparar mails (fire-and-forget, mismo patron que ReservarTurnoModal) ===
    const baseUrl = req.nextUrl.origin;
    fetch(`${baseUrl}/api/notificar-turno`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turno_id: turno.id, tipo: "reserva_cliente" }),
    }).catch(err => console.error("[reservar-publico] notif reserva_cliente fallo:", err));

    fetch(`${baseUrl}/api/notificar-turno`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turno_id: turno.id, tipo: "pendiente_barbero" }),
    }).catch(err => console.error("[reservar-publico] notif pendiente_barbero fallo:", err));

    return NextResponse.json({
      ok: true,
      turno_id: turno.id,
      guest_profile_id: guestId,
    });
  } catch (err: any) {
    console.error("[reservar-publico] Exception:", err);
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}
