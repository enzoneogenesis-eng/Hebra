"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProfileCard } from "@/components/ProfileCard";
import { CiudadSelector } from "@/components/CiudadSelector";
import { CIUDADES, normalizar } from "@/lib/ciudades";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Profile } from "@/types";

export default function SearchPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading]   = useState(false);
  const [q, setQ]               = useState("");
  const [tipo, setTipo]         = useState("");
  const [ciudad, setCiudad]     = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function loadAll() {
    setLoading(true);
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (tipo) query = query.eq("tipo", tipo);
    const { data } = await query;
    setProfiles(data ?? []);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, [tipo]);
  useEffect(() => {
    let result = profiles;
    if (q) { const qn = normalizar(q); result = result.filter(p => normalizar(p.nombre).includes(qn)); }
    if (ciudad) {
      const obj = CIUDADES.find(c => c.value === ciudad);
      const aliases = obj ? [normalizar(obj.value), ...obj.aliases] : [normalizar(ciudad)];
      result = result.filter(p => { if (!p.ubicacion) return false; const un = normalizar(p.ubicacion); return aliases.some(a => un.includes(a) || a.includes(un)); });
    }
    setFiltered(result);
  }, [profiles, q, ciudad]);

  const hasFilters = q || tipo || ciudad;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6" style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <div className="mb-5">
        <h1 className="font-['Bebas_Neue'] text-4xl md:text-5xl text-white tracking-wide">EXPLORAR</h1>
        <p className="text-xs text-[#444] mt-0.5">Barberos y salones en Argentina</p>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
          <input className="input pl-10 py-3" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar barbero o salón…" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition flex-shrink-0 ${
            showFilters || tipo || ciudad ? "bg-[#22c55e] border-[#22c55e] text-black" : "bg-[#111] border-[#1e1e1e] text-[#666]"
          }`} style={{ WebkitTapHighlightColor: "transparent" }}>
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Tipo</label>
              <select className="input py-2.5 text-sm" value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="barbero">Barberos</option>
                <option value="salon">Salones</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Ciudad</label>
              <CiudadSelector value={ciudad} onChange={setCiudad} placeholder="Todas" className="py-2.5 text-sm" />
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => { setQ(""); setTipo(""); setCiudad(""); }} className="flex items-center gap-1.5 text-xs text-[#444] hover:text-white transition" style={{ WebkitTapHighlightColor: "transparent" }}>
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {hasFilters && !showFilters && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tipo && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0a1a0a] text-[#22c55e] border border-[#1a3a1a] px-3 py-1.5 rounded-full">{tipo === "barbero" ? "Barberos" : "Salones"}<button onClick={() => setTipo("")}><X size={11} /></button></span>}
          {ciudad && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0a1a0a] text-[#22c55e] border border-[#1a3a1a] px-3 py-1.5 rounded-full">{CIUDADES.find(c => c.value === ciudad)?.label ?? ciudad}<button onClick={() => setCiudad("")}><X size={11} /></button></span>}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-[#111] border border-[#1e1e1e] animate-pulse overflow-hidden"><div className="aspect-square bg-[#1a1a1a]" /><div className="p-3 space-y-2"><div className="h-3 w-24 bg-[#1e1e1e] rounded-full" /><div className="h-3 w-16 bg-[#1e1e1e] rounded-full" /></div></div>)}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-xs text-[#333] mb-3 font-medium">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(p => <ProfileCard key={p.id} profile={p} />)}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="font-['Bebas_Neue'] text-xl text-[#222] tracking-wide">SIN RESULTADOS</p>
          <p className="text-xs text-[#333] mt-1">Probá con otros filtros</p>
        </div>
      )}
    </div>
  );
}
