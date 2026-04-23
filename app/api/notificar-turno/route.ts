import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enviarEmail,
  getTurnoCompleto,
  getEmailDeUsuario,
  formatearTurnoParaEmail,
} from "@/lib/email";
import {
  templateReservaCliente,
  templatePendienteBarbero,
  templateConfirmado,
  templateRechazado,
  templateRecordatorio,
  type DatosMail,
} from "@/lib/email-templates";

type TipoNotificacion =
  | "reserva_cliente"
  | "pendiente_barbero"
  | "confirmado"
  | "rechazado"
  | "recordatorio";

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
    const { turno_id, tipo } = body as { turno_id: string; tipo: TipoNotificacion };

    if (!turno_id || !tipo) {
      return NextResponse.json({ error: "Faltan turno_id y/o tipo" }, { status: 400 });
    }

    const tiposValidos: TipoNotificacion[] = [
      "reserva_cliente",
      "pendiente_barbero",
      "confirmado",
      "rechazado",
      "recordatorio",
    ];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    // Traer turno con todo
    const turno = await getTurnoCompleto(admin, turno_id);
    if (!turno) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    if (!turno.barbero || !turno.cliente) {
      return NextResponse.json({ error: "Turno sin barbero o cliente" }, { status: 404 });
    }

    // Decidir destinatario segun tipo
    const destinatarioId =
      tipo === "pendiente_barbero" ? turno.barbero.id : turno.cliente.id;

    const destinatarioEmail = await getEmailDeUsuario(admin, destinatarioId);
    if (!destinatarioEmail) {
      return NextResponse.json({ error: "Destinatario sin email" }, { status: 404 });
    }

    // Armar datos comunes
    const { fechaBonita, horaBonita } = formatearTurnoParaEmail(turno);
    const datos: DatosMail = {
      nombreBarbero: turno.barbero.nombre,
      nombreCliente: turno.cliente.nombre,
      fechaBonita,
      horaBonita,
      servicioNombre: turno.servicio?.nombre ?? null,
      servicioPrecio: turno.servicio?.precio ?? null,
      sucursalNombre: turno.sucursal?.nombre ?? null,
      mensajeCliente: turno.mensaje ?? null,
    };

    // Elegir template + subject segun tipo
    let html = "";
    let subject = "";
    switch (tipo) {
      case "reserva_cliente":
        html = templateReservaCliente(datos);
        subject = `Reserva recibida: ${turno.barbero.nombre} el ${fechaBonita} a las ${horaBonita}`;
        break;
      case "pendiente_barbero":
        html = templatePendienteBarbero(datos);
        subject = `Nuevo turno: ${turno.cliente.nombre} el ${fechaBonita} a las ${horaBonita}`;
        break;
      case "confirmado":
        html = templateConfirmado(datos);
        subject = `Tu turno con ${turno.barbero.nombre} fue confirmado`;
        break;
      case "rechazado":
        html = templateRechazado(datos);
        subject = `Tu turno con ${turno.barbero.nombre} no pudo confirmarse`;
        break;
      case "recordatorio":
        html = templateRecordatorio(datos);
        subject = `Recordatorio: manana tenes turno con ${turno.barbero.nombre}`;
        break;
    }

    const result = await enviarEmail({ to: destinatarioEmail, subject, html });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, email_id: result.id, tipo });
  } catch (err: any) {
    console.error("[notificar-turno] Exception:", err);
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}