import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Hebra <turnos@hebrabarbers.app>";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function enviarEmail({ to, subject, html }: EmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY no configurada, skip envío");
    return { ok: false, error: "no_api_key" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }

    console.log("[email] Enviado:", data?.id, "→", to);
    return { ok: true, id: data?.id };
  } catch (err: any) {
    console.error("[email] Exception:", err);
    return { ok: false, error: err.message ?? "unknown" };
  }
}
import type { SupabaseClient } from "@supabase/supabase-js";

export type TurnoCompleto = {
  id: string;
  fecha: string;
  hora: string;
  mensaje: string | null;
  estado: string;
  barbero: { id: string; nombre: string } | null;
  cliente: { id: string; nombre: string } | null;
  servicio: { nombre: string; precio: number | null; duracion_min: number | null } | null;
  sucursal: { nombre: string; direccion: string | null } | null;
};

export async function getTurnoCompleto(admin: SupabaseClient, turnoId: string): Promise<TurnoCompleto | null> {
  const { data, error } = await admin
    .from("turnos")
    .select(`
      id, fecha, hora, mensaje, estado,
      barbero:profiles!turnos_barbero_id_fkey(id, nombre),
      cliente:profiles!turnos_cliente_id_fkey(id, nombre),
      servicio:servicios(nombre, precio, duracion_min),
      sucursal:sucursales(nombre, direccion)
    `)
    .eq("id", turnoId)
    .single();
  if (error || !data) return null;
  return data as unknown as TurnoCompleto;
}

export async function getEmailDeUsuario(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

export function formatearTurnoParaEmail(turno: { fecha: string; hora: string }) {
  const [y, m, d] = turno.fecha.split("-");
  const fechaBonita = `${d}/${m}/${y}`;
  const horaBonita = turno.hora.substring(0, 5);
  return { fechaBonita, horaBonita };
}