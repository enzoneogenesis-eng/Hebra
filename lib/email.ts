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