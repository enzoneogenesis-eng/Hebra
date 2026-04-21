"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProfileCard } from "@/components/ProfileCard";
import { CiudadSelector } from "@/components/CiudadSelector";
import { CIUDADES, normalizar } from "@/lib/ciudades";
import { Search, SlidersHorizontal, X, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Profile, Oferta } from "@/types";

const TIPO_EMPLEO_LABEL: Record<string, string> = {
  relacion_dependencia: "Relación de dependencia",
  autonomo: "Autónomo",
  porcentaje: "Por porcentaje",
  alquiler_silla: "Alquiler de silla",
};

export default function SearchPage() {
  const [tab, setTab]           = useState<"barberos"|"salones"|"empleos">("barberos");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [ofertas, setOfertas]   = useState<Oferta[]>([]);
  const [loading, setLoading]   = useState(false);
  const [q, setQ]               = useState("");
  const [ciudad, setCiudad]     = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function loadProfiles(rolField: "is_barbero" | "is_dueno") {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq(rolField, true).order("created_at", { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  }

  async function loadOfertas() {
    setLoading(true);
    const { data } = await supabase.from("ofertas").select("*, profiles(id, nombre, foto_url, ubicacion, telefono)").eq("activa", true).order("created_at", { ascending: false });
    setOfertas((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === "barberos") loadProfiles("is_barbero");
    else if (tab === "salones") loadProfiles("is_dueno");
    else loadOfertas();
  }, [tab]);

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

  const ofertasFiltradas = ofertas.filter(o => {
    if (q && !normalizar((o as any).profiles?.nombre ?? "").includes(normalizar(q)) && !normalizar(o.titulo).includes(normalizar(q))) return false;
    if (ciudad) {
      const obj = CIUDADES.find(c => c.value === ciudad);
      const aliases = obj ? [normalizar(obj.value), ...obj.aliases] : [normalizar(ciudad)];
      const oc = normalizar(o.ciudad ?? "");
      if (oc && !aliases.some(a => oc.includes(a) || a.includes(oc))) return false;
    }
    return true;
  });

  const hasFilters = q || ciudad;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6" style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <div className="mb-5">
        <h1 className="font-['Bebas_Neue'] text-4xl md:text-5xl text-white tracking-wide">EXPLORAR</h1>
        <p className="text-xs text-[#444] mt-0.5">Barberos, salones y empleos en Argentina</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#111] border border-[#1e1e1e] p-1 rounded-2xl">
        {[
          { id: "barberos", label: "Barberos" },
          { id: "salones",  label: "Salones"  },
          { id: "empleos",  label: "Empleos"  },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as any); setQ(""); setCiudad(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              tab === t.id ? "bg-[#22c55e] text-black" : "text-[#444] hover:text-white"
            }`} style={{ WebkitTapHighlightColor: "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      {tab !== "empleos" && (
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
            <input className="input pl-10 py-3" value={q} onChange={e => setQ(e.target.value)}
              placeholder={tab === "barberos" ? "Buscar barbero…" : "Buscar salón…"} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition flex-shrink-0 ${
              showFilters || ciudad ? "bg-[#22c55e] border-[#22c55e] text-black" : "bg-[#111] border-[#1e1e1e] text-[#666]"
            }`} style={{ WebkitTapHighlightColor: "transparent" }}>
            <SlidersHorizontal size={18} />
          </button>
        </div>
      )}

      {showFilters && tab !== "empleos" && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 mb-4">
          <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Ciudad</label>
          <CiudadSelector value={ciudad} onChange={setCiudad} placeholder="Todas las ciudades" className="py-2.5 text-sm" />
          {hasFilters && (
            <button onClick={() => { setQ(""); setCiudad(""); }} className="flex items-center gap-1.5 text-xs text-[#444] hover:text-white transition mt-3">
              <X size={13} /> Limpiar
            </button>
          )}
        </div>
      )}

      {/* Chips filtros activos */}
      {hasFilters && !showFilters && tab !== "empleos" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {ciudad && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0a1a0a] text-[#22c55e] border border-[#1a3a1a] px-3 py-1.5 rounded-full">{CIUDADES.find(c => c.value === ciudad)?.label ?? ciudad}<button onClick={() => setCiudad("")}><X size={11} /></button></span>}
        </div>
      )}

      {/* ===== BARBEROS / SALONES ===== */}
      {tab !== "empleos" && (
        loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-[#111] border border-[#1e1e1e] animate-pulse overflow-hidden"><div className="aspect-square bg-[#1a1a1a]" /><div className="p-3 space-y-2"><div className="h-3 w-24 bg-[#1e1e1e] rounded-full" /></div></div>)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-xs text-[#333] mb-3">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map(p => <ProfileCard key={p.id} profile={p} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-['Bebas_Neue'] text-xl text-[#222] tracking-wide">SIN RESULTADOS</p>
            <p className="text-xs text-[#333] mt-1">Probá con otros filtros</p>
          </div>
        )
      )}

      {/* ===== EMPLEOS ===== */}
      {tab === "empleos" && (
        <div>
          {/* Filtro ciudad para empleos */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
              <input className="input pl-10 py-3" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por título o salón…" />
            </div>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <CiudadSelector value={ciudad} onChange={setCiudad} placeholder="Todas las ciudades" className="py-2 text-xs min-w-[180px]" />
            {(q || ciudad) && <button onClick={() => { setQ(""); setCiudad(""); }} className="flex-shrink-0 text-xs text-[#444] hover:text-white flex items-center gap-1"><X size={13} /> Limpiar</button>}
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#111] rounded-3xl animate-pulse" />)}</div>
          ) : ofertasFiltradas.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={32} className="text-[#222] mx-auto mb-3" />
              <p className="font-['Bebas_Neue'] text-xl text-[#222] tracking-wide">SIN BÚSQUEDAS ACTIVAS</p>
              <p className="text-xs text-[#333] mt-1">Los salones publican búsquedas desde su dashboard</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#333] mb-3">{ofertasFiltradas.length} búsqueda{ofertasFiltradas.length !== 1 ? "s" : ""} activa{ofertasFiltradas.length !== 1 ? "s" : ""}</p>
              {ofertasFiltradas.map(o => {
                const salon = (o as any).profiles as Profile | undefined;
                return (
                  <div key={o.id} className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-4 hover:border-[#333] transition">
                    {/* Salón */}
                    {salon && (
                      <Link href={`/profile/${salon.id}`} className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1a1a1a] relative flex-shrink-0">
                          {salon.foto_url
                            ? <Image src={salon.foto_url} alt={salon.nombre} fill className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#22c55e]">{salon.nombre[0]}</div>
                          }
                        </div>
                        <span className="text-xs font-semibold text-[#666] hover:text-white transition">{salon.nombre}</span>
                      </Link>
                    )}

                    <h3 className="font-semibold text-white text-sm mb-1">{o.titulo}</h3>

                    <div className="flex flex-wrap gap-2 text-[11px] text-[#444] mb-2">
                      {o.ciudad && <span className="flex items-center gap-1"><MapPin size={10} />{o.ciudad}</span>}
                      {(o as any).tipo_empleo && <span>· {TIPO_EMPLEO_LABEL[(o as any).tipo_empleo] ?? (o as any).tipo_empleo}</span>}
                    </div>

                    {(o as any).skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(o as any).skills.map((s: string) => (
                          <span key={s} className="text-[10px] bg-[#0a1a0a] text-[#22c55e] border border-[#1a3a1a] px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}

                    {o.descripcion && <p className="text-xs text-[#555] leading-relaxed mb-3">{o.descripcion}</p>}

                    <div className="flex gap-2">
                      <Link href={`/profile/${salon?.id}`}
                        className="text-xs font-semibold text-white bg-[#1a1a1a] border border-[#222] px-4 py-2 rounded-full hover:border-[#444] transition">
                        Ver salón
                      </Link>
                      {salon?.telefono && (
                        <a href={`https://wa.me/${salon.telefono.replace(/\D/g,"")}?text=Hola%2C%20vi%20la%20oferta%20%22${encodeURIComponent(o.titulo)}%22%20en%20Hebra`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold text-black px-4 py-2 rounded-full flex items-center gap-1.5 transition active:scale-95"
                          style={{ background: "#22c55e" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                          Postularme
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
