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

    // Detectar iOS (iPhone/iPad/iPod) — Safari en iOS no dispara beforeinstallprompt
    const ua = window.navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/i.test(ua)
      || (ua.includes("Mac") && "ontouchend" in document);

    if (iOS) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    // Android/Chrome: esperar el evento beforeinstallprompt
    function onBIP(e: Event) {
      e.preventDefault();
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
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center flex-shrink-0">
            <Download size={20} className="text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight mb-1">
              Instala Hebra en tu celular
            </p>
            {isIOS ? (
              <p className="text-xs text-[#888] leading-snug">
                Toca <Share size={12} className="inline mx-0.5 -mt-0.5" /> abajo y despues &quot;Agregar a pantalla de inicio&quot;
              </p>
            ) : (
              <p className="text-xs text-[#888] leading-snug mb-3">
                Accedela como una app nativa, sin pasar por la Play Store
              </p>
            )}
            {!isIOS && (
              <button
                onClick={onInstall}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black text-sm font-bold py-2.5 rounded-xl transition active:scale-95"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Instalar ahora
              </button>
            )}
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
      </div>
    </div>
  );
}