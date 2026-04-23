import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Servidor no configurado" }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();
    const { turno_id } = body;

    if (!turno_id) {
      return NextResponse.json({ error: "Falta turno_id" }, { status: 400 });
    }

    // Traer turno con datos del barbero, cliente, servicio y sucursal
    const { data: turno, error: turnoErr } = await admin
      .from("turnos")
      .select(`
        id, fecha, hora, mensaje, estado,
        barbero:profiles!turnos_barbero_id_fkey(id, nombre),
        cliente:profiles!turnos_cliente_id_fkey(id, nombre),
        servicio:servicios(nombre, precio),
        sucursal:sucursales(nombre, direccion)
      `)
      .eq("id", turno_id)
      .single();

    if (turnoErr || !turno) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    if (turno.estado !== "pendiente") {
      return NextResponse.json({ ok: true, skipped: "no_pendiente" });
    }

    const barbero = turno.barbero as any;
    const cliente = turno.cliente as any;
    const servicio = turno.servicio as any;
    const sucursal = turno.sucursal as any;

    // Traer email del barbero desde auth.users
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(barbero.id);
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Barbero sin email" }, { status: 404 });
    }

    const barberoEmail = userData.user.email;
    const [y, m, d] = turno.fecha.split("-");
    const fechaBonita = `${d}/${m}/${y}`;
    const horaBonita = turno.hora.substring(0, 5);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
        <h2 style="margin: 0 0 12px;">Nuevo turno pendiente</h2>
        <p style="margin: 0 0 20px; color: #444;">Hola ${barbero.nombre}, <b>${cliente?.nombre ?? "un cliente"}</b> te reservó un turno.</p>

        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 20px;">
          <p style="margin: 0 0 6px;"><b>📅 Fecha:</b> ${fechaBonita}</p>
          <p style="margin: 0 0 6px;"><b>🕐 Hora:</b> ${horaBonita}</p>
          ${servicio ? `<p style="margin: 0 0 6px;"><b>✂️ Servicio:</b> ${servicio.nombre}</p>` : ""}
          ${sucursal ? `<p style="margin: 0 0 6px;"><b>📍 Sucursal:</b> ${sucursal.nombre}</p>` : ""}
          ${turno.mensaje ? `<p style="margin: 0;"><b>💬 Mensaje:</b> ${turno.mensaje}</p>` : ""}
        </div>

        <a href="https://hebrabarbers.app/dashboard" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ver y confirmar</a>

        <p style="margin: 28px 0 0; font-size: 12px; color: #888;">Este mail fue enviado automáticamente por Hebra.</p>
      </div>
    `;

    const result = await enviarEmail({
      to: barberoEmail,
      subject: `Nuevo turno: ${cliente?.nombre ?? "cliente"} el ${fechaBonita} a las ${horaBonita}`,
      html,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, email_id: result.id });
  } catch (err: any) {
    console.error("[notificar-turno-pendiente] Exception:", err);
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}