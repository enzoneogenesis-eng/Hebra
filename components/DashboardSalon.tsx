"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { EditProfileForm } from "./EditProfileForm";
import { PublicarOferta } from "./PublicarOferta";
import { CIUDADES } from "@/lib/ciudades";
import { Briefcase, Users, Eye, Check, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { Profile, Oferta, Postulacion } from "@/types";

export function DashboardSalon({ profile }: { profile: Profile }) {
  const [ofertas, setOfertas]             = useState<Oferta[]>([]);
  const [postulaciones, setPostulaciones] = useState<Record<string, Postulacion[]>>({});
  const [expandida, setExpandida]         = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { loadOfertas(); }, []);

  async function loadOfertas() {
    setLoading(true);
    const { data } = await supabase
      .from("ofertas")
      .select("*")
      .eq("salon_id", profile.id)
      .order("created_at", { ascending: false });
    setOfertas((data as Oferta[]) ?? []);
    setLoading(false);
  }

  async function loadPostulaciones(ofertaId: string) {
    if (postulaciones[ofertaId]) return; // ya cargadas
    const { data } = await supabase
      .from("postulaciones")
      .select("*, profiles(*)")
      .eq("oferta_id", ofertaId)
      .order("created_at", { ascending: false });
    setPostulaciones(p => ({ ...p, [ofertaId]: (data as Postulacion[]) ?? [] }));
  }

  async function toggleExpandir(ofertaId: string) {
    if (expandida === ofertaId) { setExpandida(null); return; }
    setExpandida(ofertaId);
    await loadPostulaciones(ofertaId);
  }

  async function cambiarEstado(postulacionId: string, ofertaId: string, estado: string) {
    await supabase.from("postulaciones").update({ estado }).eq("id", postulacionId);
    setPostulaciones(p => ({
      ...p,
      [ofertaId]: p[ofertaId].map(x => x.id === postulacionId ? { ...x, estado: estado as any } : x)
    }));
  }

  async function desactivarOferta(ofertaId: string) {
    await supabase.from("ofertas").update({ activa: false }).eq("id", ofertaId);
    setOfertas(o => o.map(x => x.id === ofertaId ? { ...x, activa: false } : x));
  }

  async function eliminarOferta(ofertaId: string) {
    await supabase.from("ofertas").delete().eq("id", ofertaId);
    setOfertas(o => o.filter(x => x.id !== ofertaId));
  }

  const TIPO_LABEL: Record<string, string> = {
    relacion_dependencia: "Relación de dependencia",
    autonomo: "Autónomo",
    porcentaje: "Por porcentaje",
    alquiler_silla: "Alquiler de silla",
  };

  const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    pendiente: { label: "Pendiente",  color: "#f59e0b" },
    vista:     { label: "Vista",      color: "#3b82f6" },
    aceptada:  { label: "Aceptada",   color: "#22c55e" },
    rechazada: { label: "Rechazada",  color: "#ef4444" },
  };

  const ofertasActivas   = ofertas.filter(o => o.activa);
  const ofertasInactivas = ofertas.filter(o => !o.activa);

  return (
    <div>
      <EditProfileForm profile={profile} />

      {/* Publicar nueva búsqueda */}
      <div className="mb-6">
        <PublicarOferta salon={profile} onCreated={o => setOfertas(prev => [o, ...prev])} />
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Búsquedas activas", value: ofertasActivas.length, icon: <Briefcase size={16} /> },
          { label: "Total postulantes", value: Object.values(postulaciones).flat().length, icon: <Users size={16} /> },
          { label: "Búsquedas totales", value: ofertas.length, icon: <Eye size={16} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#ebebeb] rounded-2xl p-3 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="text-[#aaa] flex justify-center mb-1">{s.icon}</div>
            <p className="font-['Bebas_Neue'] text-2xl text-[#0a0a0a]">{s.value}</p>
            <p className="text-[10px] text-[#bbb] leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de ofertas */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-[#f4f4f2] rounded-3xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {ofertas.length === 0 && (
            <div className="text-center py-12">
              <Briefcase size={32} className="text-[#e8e8e6] mx-auto mb-3" />
              <p className="text-sm text-[#ccc]">No publicaste ninguna búsqueda todavía</p>
            </div>
          )}

          {ofertasActivas.map(oferta => (
            <OfertaCard key={oferta.id} oferta={oferta} expandida={expandida === oferta.id}
              postulaciones={postulaciones[oferta.id] ?? null}
              onToggle={() => toggleExpandir(oferta.id)}
              onCambiarEstado={(pid, estado) => cambiarEstado(pid, oferta.id, estado)}
              onDesactivar={() => desactivarOferta(oferta.id)}
              onEliminar={() => eliminarOferta(oferta.id)}
              TIPO_LABEL={TIPO_LABEL} ESTADO_CONFIG={ESTADO_CONFIG} />
          ))}

          {ofertasInactivas.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-2">Búsquedas cerradas</p>
              {ofertasInactivas.map(oferta => (
                <OfertaCard key={oferta.id} oferta={oferta} expandida={false}
                  postulaciones={postulaciones[oferta.id] ?? null}
                  onToggle={() => {}}
                  onCambiarEstado={() => {}}
                  onDesactivar={() => {}}
                  onEliminar={() => eliminarOferta(oferta.id)}
                  TIPO_LABEL={TIPO_LABEL} ESTADO_CONFIG={ESTADO_CONFIG} inactiva />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OfertaCard({ oferta, expandida, postulaciones, onToggle, onCambiarEstado, onDesactivar, onEliminar, TIPO_LABEL, ESTADO_CONFIG, inactiva }: {
  oferta: Oferta; expandida: boolean; postulaciones: Postulacion[] | null;
  onToggle: () => void; onCambiarEstado: (id: string, estado: string) => void;
  onDesactivar: () => void; onEliminar: () => void;
  TIPO_LABEL: Record<string,string>; ESTADO_CONFIG: Record<string,{label:string;color:string}>;
  inactiva?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-3xl overflow-hidden transition-all ${inactiva ? "opacity-60 border-[#f0f0f0]" : "border-[#ebebeb]"}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-[#0a0a0a] text-sm">{oferta.titulo}</h3>
              {oferta.activa && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Activa</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-[#aaa]">
              {oferta.ciudad && <span>{oferta.ciudad}</span>}
              {oferta.tipo_empleo && <span>· {TIPO_LABEL[oferta.tipo_empleo] ?? oferta.tipo_empleo}</span>}
            </div>
            {oferta.skills && oferta.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {oferta.skills.map(s => (
                  <span key={s} className="text-[10px] bg-[#f4f4f2] text-[#666] px-2 py-0.5 rounded-full border border-[#ebebeb]">{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!inactiva && (
              <>
                <button onClick={onToggle}
                  className="flex items-center gap-1 text-xs font-medium text-[#666] bg-[#f4f4f2] px-3 py-2 rounded-full active:scale-95 transition"
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  <Users size={13} />
                  {postulaciones ? postulaciones.length : "·"}
                  {expandida ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </>
            )}
            <button onClick={onEliminar}
              className="text-[#ddd] hover:text-red-400 transition p-2 active:scale-90"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {oferta.descripcion && (
          <p className="text-xs text-[#888] mt-2 leading-relaxed line-clamp-2">{oferta.descripcion}</p>
        )}
      </div>

      {/* Postulaciones expandidas */}
      {expandida && (
        <div className="border-t border-[#f0f0f0]">
          {postulaciones === null ? (
            <div className="p-4 text-center text-xs text-[#bbb] animate-pulse">Cargando…</div>
          ) : postulaciones.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-sm text-[#ccc]">Sin postulantes todavía</p>
              <p className="text-xs text-[#ddd] mt-1">Cuando un barbero se postule, aparece acá</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f8f8f8]">
              {postulaciones.map(p => {
                const barbero = p.profiles!;
                const estado  = ESTADO_CONFIG[p.estado] ?? ESTADO_CONFIG.pendiente;
                return (
                  <div key={p.id} className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#f4f4f2] flex-shrink-0 relative">
                      {barbero.foto_url
                        ? <Image src={barbero.foto_url} alt={barbero.nombre} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-[#0a0a0a] text-white">{barbero.nombre[0]}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-[#0a0a0a] truncate">{barbero.nombre}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: estado.color + "20", color: estado.color }}>
                          {estado.label}
                        </span>
                      </div>
                      {barbero.ubicacion && <p className="text-[11px] text-[#aaa]">{barbero.ubicacion}</p>}
                      {barbero.skills && <p className="text-[11px] text-[#bbb] mt-0.5">{barbero.skills.slice(0,3).join(" · ")}</p>}
                      {p.mensaje && <p className="text-xs text-[#666] mt-1 italic">"{p.mensaje}"</p>}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Link href={`/profile/${barbero.id}`}
                          className="text-[11px] font-semibold bg-[#0a0a0a] text-white px-3 py-1.5 rounded-full active:scale-95 transition"
                          style={{ WebkitTapHighlightColor: "transparent" }}>
                          Ver perfil
                        </Link>
                        {barbero.telefono && (
                          <a href={`https://wa.me/${barbero.telefono.replace(/\D/g,"")}?text=Hola%20${encodeURIComponent(barbero.nombre)}%2C%20vi%20tu%20postulaci%C3%B3n%20en%20Hebra`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-full active:scale-95 transition text-white"
                            style={{ background: "#25d366", WebkitTapHighlightColor: "transparent" }}>
                            WhatsApp
                          </a>
                        )}
                        {p.estado === "pendiente" && (
                          <>
                            <button onClick={() => onCambiarEstado(p.id, "aceptada")}
                              className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full active:scale-95 transition"
                              style={{ WebkitTapHighlightColor: "transparent" }}>
                              <Check size={11} className="inline mr-0.5" /> Aceptar
                            </button>
                            <button onClick={() => onCambiarEstado(p.id, "rechazada")}
                              className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full active:scale-95 transition"
                              style={{ WebkitTapHighlightColor: "transparent" }}>
                              <X size={11} className="inline mr-0.5" /> Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!inactiva && (
            <div className="px-4 pb-3">
              <button onClick={onDesactivar}
                className="text-xs text-[#bbb] hover:text-[#666] transition"
                style={{ WebkitTapHighlightColor: "transparent" }}>
                Cerrar esta búsqueda
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
