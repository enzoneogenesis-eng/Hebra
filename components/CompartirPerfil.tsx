"use client";
import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export function CompartirPerfil({ nombre, id }: { nombre: string; id: string }) {
  const [copiado, setCopiado] = useState(false);
  const url = `https://hebra-fqbhksgce-enzo17.vercel.app/profile/${id}`;

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${nombre} en Hebra`,
          text: `Mirá el perfil de ${nombre} en Hebra 💈`,
          url,
        });
        return;
      } catch {}
    }
    // Fallback: copiar al portapapeles
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <button onClick={compartir}
      className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border transition-all active:scale-95 ${
        copiado
          ? "bg-[#0a1a0a] border-[#22c55e] text-[#22c55e]"
          : "bg-transparent border-[#1e1e1e] text-[#666] hover:border-[#444] hover:text-white"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}>
      {copiado ? <Check size={13} /> : <Share2 size={13} />}
      {copiado ? "¡Link copiado!" : "Compartir perfil"}
    </button>
  );
}
