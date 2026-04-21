import { supabase } from "./supabase";

type TrackParams = {
  targetUserId: string;
  context?: "profile" | "oferta" | "search" | "sucursal";
  ofertaId?: string;
};

/**
 * Registra un click en WhatsApp para metricas de Hebra.
 * No bloquea la UI: fire-and-forget.
 * Si falla, no rompe nada (solo console.warn).
 */
export async function trackWhatsAppClick(params: TrackParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : null;

    const { error } = await supabase.from("whatsapp_clicks").insert({
      target_user_id: params.targetUserId,
      clicker_user_id: user?.id ?? null,
      context: params.context ?? "profile",
      oferta_id: params.ofertaId ?? null,
      user_agent: userAgent,
    });

    if (error) {
      console.warn("[trackWhatsAppClick] insert failed:", error.message);
    }
  } catch (err) {
    console.warn("[trackWhatsAppClick] unexpected error:", err);
  }
}