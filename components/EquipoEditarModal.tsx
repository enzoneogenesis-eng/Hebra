"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Loader2, Percent } from "lucide-react";

type Props = {
  asignacionId: string;
  barberoNombre: string;
  sucursalNombre: string;
  porcentajeActual: number;
  onClose: () => void;
  onSaved: () => void;
};

export function EquipoEditarModal({ asignacionId, barberoNombre, sucursalNombre, porcentajeActual, onClose, onSaved }: Props) {
  const [porcentaje, setPorcentaje] = useState(String(porcentajeActual));
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
    setError(null);
    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError("Porcentaje invalido (0-100).");
      return;
    }
    if (pct === porcentajeActual) {
      onClose();
      return;
    }

    setSaving(true);
    const { error: updErr } = await supabase
      .from("sucursales_barberos")
      .update({ porcentaje_barbero: pct })
      .eq("id", asignacionId);

    if (updErr) {
      setError("No se pudo actualizar: " + updErr.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="border-b border-[#2a2a2a] px-5 py-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">Editar porcentaje</h2>
          <button onClick={onClose} className="text-[#888] hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3">
            <p className="text-white text-sm font-semibold">{barberoNombre}</p>
            <p className="text-[#666] text-xs mt-0.5">{sucursalNombre}</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Porcentaje para el barbero</label>
            <div className="relative">
              <input type="number" min="0" max="100" step="1" autoFocus value={porcentaje}
                onChange={e => setPorcentaje(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-4 pr-10 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#1ed760]"
              />
              <Percent size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]" />
            </div>
            <p className="text-[#666] text-xs mt-1.5">
              El barbero se lleva {porcentaje || 0}%, tu te quedas con {100 - Number(porcentaje || 0)}%.
            </p>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-[#aaa] font-semibold hover:bg-[#1a1a1a]">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#1ed760] text-black font-bold hover:bg-[#1ed760]/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}