"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CiudadSelector } from "./CiudadSelector";
import { SkillsPicker } from "./SkillsPicker";
import { Plus, X } from "lucide-react";
import type { Oferta, Profile } from "@/types";

const TIPO_EMPLEO = [
  { value: "relacion_dependencia", label: "Relación de dependencia" },
  { value: "autonomo",             label: "Autónomo / freelance" },
  { value: "porcentaje",           label: "Por porcentaje" },
  { value: "alquiler_silla",       label: "Alquiler de silla" },
];

interface Props {
  salon: Profile;
  onCreated: (oferta: Oferta) => void;
}

export function PublicarOferta({ salon, onCreated }: Props) {
  const [open, setOpen]       = useState(false);
  const [titulo, setTitulo]   = useState("");
  const [desc, setDesc]       = useState("");
  const [ciudad, setCiudad]   = useState(salon.ubicacion ?? "");
  const [skills, setSkills]   = useState<string[]>([]);
  const [tipo, setTipo]       = useState("relacion_dependencia");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase.from("ofertas").insert({
      salon_id:    salon.id,
      titulo:      titulo.trim(),
      descripcion: desc.trim() || null,
      ciudad:      ciudad || null,
      skills:      skills.length > 0 ? skills : null,
      tipo_empleo: tipo,
      activa:      true,
    }).select("*").single();

    if (error) { setError("Error al publicar."); setSaving(false); return; }
    onCreated(data as Oferta);
    setTitulo(""); setDesc(""); setSkills([]); setOpen(false);
    setSaving(false);
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="btn-primary flex items-center gap-2 w-full"
      style={{ WebkitTapHighlightColor: "transparent" }}>
      <Plus size={16} /> Publicar búsqueda de barbero
    </button>
  );

  return (
    <div className="bg-white border border-[#ebebeb] rounded-3xl p-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Bebas_Neue'] text-xl text-[#0a0a0a] tracking-wide">NUEVA BÚSQUEDA</h3>
        <button onClick={() => setOpen(false)} className="text-[#bbb] hover:text-[#0a0a0a] transition p-1"
          style={{ WebkitTapHighlightColor: "transparent" }}>
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Título del puesto *</label>
          <input className="input" value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Ej: Buscamos barbero con experiencia en degradé" required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Descripción</label>
          <textarea className="textarea" rows={3} value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Describí el puesto, horarios, beneficios, requisitos…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Ciudad</label>
            <CiudadSelector value={ciudad} onChange={setCiudad} placeholder="Misma ciudad" className="py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Tipo de empleo</label>
            <select className="input py-2.5 text-sm" value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPO_EMPLEO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-3">Skills requeridas</label>
          <SkillsPicker selected={skills} onChange={setSkills} />
        </div>
        {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-2xl">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? "Publicando…" : "Publicar búsqueda →"}
        </button>
      </form>
    </div>
  );
}
