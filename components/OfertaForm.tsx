"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Loader2, MapPin, Briefcase } from "lucide-react";
import { CiudadSelector } from "./CiudadSelector";
import { SkillsPicker } from "./SkillsPicker";

type Props = {
  salonId: string;
  onClose: () => void;
  onSaved: () => void;
};

const TIPOS_EMPLEO = [
  { value: "relacion_dependencia", label: "Relacion dependencia" },
  { value: "autonomo",             label: "Autonomo / freelance" },
  { value: "porcentaje",           label: "Porcentaje (comision)" },
  { value: "alquiler_silla",       label: "Alquiler de silla" },
  { value: "mixto",                label: "Mixto (sueldo + comision)" },
];

export function OfertaForm({ salonId, onClose, onSaved }: Props) {
  const [titulo, setTitulo]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ciudad, setCiudad]           = useState("bernal");
  const [tipoEmpleo, setTipoEmpleo]   = useState("relacion_dependencia");
  const [skills, setSkills]           = useState<string[]>([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) { setError("Ingresa un titulo."); return; }
    if (titulo.trim().length < 5) { setError("El titulo es muy corto."); return; }

    setSaving(true);

    const { error: insertErr } = await supabase.from("ofertas").insert({
      salon_id: salonId,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      ciudad,
      tipo_empleo: tipoEmpleo,
      skills: skills.length > 0 ? skills : null,
      activa: true,
    });

    if (insertErr) {
      setError("No se pudo crear la oferta: " + insertErr.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#2a2a2a] px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <Briefcase size={18} /> Nueva oferta de trabajo
          </h2>
          <button onClick={onClose} className="text-[#888] hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Titulo de la busqueda</label>
            <input type="text" autoFocus value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Barbero para sucursal Zapiola" required maxLength={120}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Descripcion (opcional)</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Detalles del puesto: dias, horarios, condiciones, que buscamos..." rows={4} maxLength={1000}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760] resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Tipo de empleo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TIPOS_EMPLEO.map(t => (
                <button type="button" key={t.value} onClick={() => setTipoEmpleo(t.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm text-left transition ${
                    tipoEmpleo === t.value ? "bg-[#0a1a0a] border-[#1ed760] text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa] hover:border-[#3a3a3a]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">
              <MapPin size={11} className="inline mr-1" /> Ciudad
            </label>
            <CiudadSelector value={ciudad} onChange={setCiudad} />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Skills requeridos (opcional)</label>
            <p className="text-[#666] text-xs mb-3">Los barberos que tengan estos skills van a ver la oferta primero.</p>
            <SkillsPicker selected={skills} onChange={setSkills} />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-[#aaa] font-semibold hover:bg-[#1a1a1a]">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#1ed760] text-black font-bold hover:bg-[#1ed760]/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Publicando..." : "Publicar oferta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}