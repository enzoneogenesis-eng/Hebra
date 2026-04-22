import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // Cliente admin con service_role (solo en server, inicializado por request)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Servidor no configurado (falta SUPABASE_SERVICE_ROLE_KEY)" }, { status: 500 });
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { email, nombre, sucursal_id, porcentaje, owner_id } = body;

    // Validaciones basicas
    if (!email || !nombre || !sucursal_id || porcentaje == null || !owner_id) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (porcentaje < 0 || porcentaje > 100) {
      return NextResponse.json({ error: "Porcentaje invalido" }, { status: 400 });
    }

    // 1) Verificar que el owner_id realmente es dueno de esa sucursal
    const { data: sucCheck, error: sucErr } = await admin
      .from("sucursales")
      .select("id, marca_id, marcas!inner(owner_id)")
      .eq("id", sucursal_id)
      .single();

    if (sucErr || !sucCheck) {
      return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    }

    const marcaOwner = (sucCheck.marcas as any)?.owner_id;
    if (marcaOwner !== owner_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 2) Invitar por email (crea usuario en auth.users y manda email)
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || "https://hebrabarbers.app"}/reset-password`;
    const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });

    if (inviteErr) {
      // Si ya existe, intentamos buscarlo
      if (inviteErr.message.includes("already") || inviteErr.message.includes("exist")) {
        const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
        if (existing) {
          return NextResponse.json({
            error: "Este email ya tiene cuenta en Hebra. Usa la opcion Buscar existente.",
            existing_id: existing.id,
          }, { status: 409 });
        }
      }
      return NextResponse.json({ error: inviteErr.message }, { status: 500 });
    }

    const newUserId = inviteData.user?.id;
    if (!newUserId) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
    }

    // 3) Crear profile con el nombre y flag de barbero
    const { error: profileErr } = await admin.from("profiles").insert({
      id: newUserId,
      email,
      nombre,
      is_barbero: true,
      is_cliente: false,
      is_dueno: false,
      tipo: "barbero",
    });

    if (profileErr) {
      // Si ya existe (por trigger), lo actualizamos
      await admin.from("profiles").update({
        nombre,
        is_barbero: true,
        tipo: "barbero",
      }).eq("id", newUserId);
    }

    // 4) Crear la asignacion en sucursales_barberos
    const { error: asigErr } = await admin.from("sucursales_barberos").insert({
      sucursal_id,
      barbero_id: newUserId,
      porcentaje_barbero: porcentaje,
      desde: new Date().toISOString().slice(0, 10),
      activo: true,
    });

    if (asigErr) {
      return NextResponse.json({ error: "Invitacion enviada pero no se pudo asignar: " + asigErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user_id: newUserId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}