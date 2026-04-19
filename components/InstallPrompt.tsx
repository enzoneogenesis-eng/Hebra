"use client";
import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "hebra-install-dismissed";
const DISMISS_DAYS = 7;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Si ya esta instalada (standalone), no mostrar
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    // Si el usuario lo cerro hace menos de N dias, no mostrar
    try {
      const dismissedAt = localStorage.getItem(DISMISSED_KEY);
      if (dismissedAt) {
        const diff = Date.now() - Number(dismissedAt);
        if (diff < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch {}

    // Estrategia: esperamos beforeinstallprompt. Si llega (Android/Chrome), mostramos boton.
    // Si NO llega en 2 segundos, asumimos que no hay instalacion nativa disponible
    // (iOS Safari, Firefox, etc.) y mostramos las instrucciones manuales.
    const fallbackTimer = setTimeout(() => {
      setIsIOS(true);
      setVisible(true);
    }, 2000);

    // Android/Chrome: si beforeinstallprompt llega, cancelamos el fallback y mostramos boton
    function onBIP(e: Event) {
      e.preventDefault();
      clearTimeout(fallbackTimer);
      setIsIOS(false);
      setDeferredPrompt(e as BIPEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBIP);

    // Si la app ya se instalo mientras el usuario esta en la pagina
    function onInstalled() {
      setInstalled(true);
      setVisible(false);
    }
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function onInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setVisible(false);
    } else {
      dismiss();
    }
    setDeferredPrompt(null);
  }

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch {}
    setVisible(false);
  }

  if (!visible || installed) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[60] md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }}
    >
      <div className="bg-[#0a0a0a] border border-[#22c55e]/40 rounded-2xl p-4 shadow-2xl"
        style={{ boxShadow: "0 10px 40px rgba(34,197,94,0.2)" }}>

        {isIOS ? (
          <>
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm font-bold text-white leading-tight">
                Como instalar Hebra en tu iPhone
              </p>
              <button
                onClick={dismiss}
                aria-label="Cerrar"
                className="text-[#666] hover:text-white p-1 -mt-1 -mr-1 transition flex-shrink-0"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <X size={18} />
              </button>
            </div>
            <ol className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-xs text-[#aaa]">
                <span className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-bold text-[#22c55e] flex items-center justify-center flex-shrink-0">1</span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Toca el boton
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md">
                    <Share size={13} className="text-[#22c55e]" />
                  </span>
                  de Safari (abajo)
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[#aaa]">
                <span className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-bold text-[#22c55e] flex items-center justify-center flex-shrink-0">2</span>
                <span>Busca <b className="text-white font-semibold">Agregar a pantalla de inicio</b></span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-[#aaa]">
                <span className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-bold text-[#22c55e] flex items-center justify-center flex-shrink-0">3</span>
                <span>Toca <b className="text-white font-semibold">Agregar</b> y listo</span>
              </li>
            </ol>
          </>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center flex-shrink-0">
              <Download size={20} className="text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight mb-1">
                Instala Hebra en tu celular
              </p>
              <p className="text-xs text-[#888] leading-snug mb-3">
                Accedela como una app nativa, sin pasar por la Play Store
              </p>
              <button
                onClick={onInstall}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black text-sm font-bold py-2.5 rounded-xl transition active:scale-95"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Instalar ahora
              </button>
            </div>
            <button
              onClick={dismiss}
              aria-label="Cerrar"
              className="text-[#666] hover:text-white p-1 -mt-1 -mr-1 transition flex-shrink-0"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}