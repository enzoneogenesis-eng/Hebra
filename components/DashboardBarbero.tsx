"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { EditProfileForm } from "./EditProfileForm";
import { SubirTrabajo } from "./SubirTrabajo";
import { TrabajoCard } from "./TrabajoCard";
import { Briefcase, MapPin, Send, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Profile, Trabajo, Oferta, Postulacion } from "@/types";

const TIPO_LABEL: Record<string, string> = {
  relacion_dependencia: "Relación de dependencia",
  autonomo: "Autónomo",
  porcentaje: "Por porcentaje",
  alquiler_silla: "Alquiler de silla",
};

export function DashboardBarbero({ profile }: { profile: Profile }) {
  const [trabajos, setTrabajos]           = useState<Trabajo[]>([]);
  const [ofertas, setOfertas]             = useState<Oferta[]>([]);
  const [misPostulaciones, setMisPost]    = useState<Postulacion[]>([]);
  const [tab, setTab]                     = useState<"portfolio"|"ofertas">("portfolio");
  const [loading, setLoading]             = useState(true);
  const [postulando, setPostulando]       = useState<string | null>(null);
  const [mensaje, setMensaje]             = useState("");
  const [expandida, setExpandida]         = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: t }, { data: o }, { data: mp }] = await Promise.all([
      supabase.from("trabajos").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("ofertas").select("*, profiles(id, nombre, foto_url, ubicacion, telefono)").eq("activa", true).order("created_at", { ascending: false }),
      supabase.from("postulaciones").select("*, ofertas(titulo, profiles(nombre))").eq("barbero_id", profile.id),
    ]);
    setTrabajos(t ?? []);
    setOfertas((o as any) ?? []);
    setMisPost((mp as any) ?? []);
    setLoading(false);
  }

  async function postularse(ofertaId: string) {
    setPostulando(ofertaId);
  }

  async function confirmarPostulacion(ofertaId: string) {
    const { error } = await supabase.from("postulaciones").insert({
      oferta_id: ofertaId, barbero_id: profile.id,
      mensaje: mensaje.trim() || null,
    });
    if (!error) {
      setMisPost(p => [...p, { id: Date.now().toString(), oferta_id: ofertaId, barbero_id: profile.id,
        mensaje: mensaje.trim() || null, estado: "pendiente", created_at: new Date().toISOString() }]);
    }
    setPostulando(null); setMensaje("");
  }

  async function retirarPostulacion(ofertaId: string) {
    await supabase.from("postulaciones").delete().eq("oferta_id", ofertaId).eq("barbero_id", profile.id);
    setMisPost(p => p.filter(x => x.oferta_id !== ofertaId));
  }

  const yaPostulado = (ofertaId: string) => misPostulaciones.some(p => p.oferta_id === ofertaId);
  const estadoPost  = (ofertaId: string) => misPostulaciones.find(p => p.oferta_id === ofertaId)?.estado;

  const ESTADO_COLOR: Record<string, string> = {
    pendiente: "#f59e0b", vista: "#3b82f6", aceptada: "#22c55e", rechazada: "#ef4444"
  };
  const ESTADO_LABEL: Record<string, string> = {
    pendiente: "Pendiente", vista: "Vista", aceptada: "¡Aceptada!", rechazada: "Rechazada"
  };

  // Filtrar ofertas que matcheen las skills del barbero
  const ofertasMatch = ofertas.filter(o => {
    if (!profile.skills || !o.skills) return true;
    return o.skills.some(s => profile.skills!.includes(s));
  });
  const ofertasOtras = ofertas.filter(o => !ofertasMatch.includes(o));

  return (
    <div>
      <EditProfileForm profile={profile} />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#f0f0ee] p-1 rounded-2xl">
        {[
          { id: "portfolio", label: `Portfolio (${trabajos.length})` },
          { id: "ofertas",   label: `Búsquedas (${ofertas.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              tab === t.id ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#999]"
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#f4f4f2] rounded-3xl" />)}
        </div>
      ) : (
        <>
          {/* TAB PORTFOLIO */}
          {tab === "portfolio" && (
            <div>
              <SubirTrabajo userId={profile.id} onSubido={t => setTrabajos(prev => [t, ...prev])} />
              {trabajos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {trabajos.map(t => <TrabajoCard key={t.id} trabajo={t} />)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-[#ccc]">Todavía no subiste fotos</p>
                  <p className="text-xs text-[#ddd] mt-1">Subí tu primer trabajo arriba</p>
                </div>
              )}
            </div>
          )}

          {/* TAB OFERTAS */}
          {tab === "ofertas" && (
            <div className="space-y-4">
              {/* Mis postulaciones */}
              {misPostulaciones.length > 0 && (
                <div className="bg-white border border-[#ebebeb] rounded-3xl p-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-3">Mis postulaciones ({misPostulaciones.length})</p>
                  <div className="space-y-2">
                    {misPostulaciones.map(p => {
                      const estado = p.estado;
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#f8f8f8] last:border-0">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0a0a0a] truncate">
                              {(p.ofertas as any)?.titulo ?? "Oferta"}
                            </p>
                            <p className="text-[11px] text-[#aaa]">
                              {(p.ofertas as any)?.profiles?.nombre ?? "Salón"}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                            style={{ background: (ESTADO_COLOR[estado] ?? "#999") + "20", color: ESTADO_COLOR[estado] ?? "#999" }}>
                            {ESTADO_LABEL[estado] ?? estado}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ofertas que matchean skills */}
              {ofertasMatch.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#0a0a0a] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Coinciden con tus skills
                  </p>
                  {ofertasMatch.map(o => (
                    <OfertaBarberoCard key={o.id} oferta={o} yaPost={yaPostulado(o.id)} estado={estadoPost(o.id)}
                      postulando={postulando === o.id} mensaje={mensaje} setMensaje={setMensaje}
                      onPostular={() => postularse(o.id)}
                      onConfirmar={() => confirmarPostulacion(o.id)}
                      onCancelarForm={() => { setPostulando(null); setMensaje(""); }}
                      onRetirar={() => retirarPostulacion(o.id)}
                      expandida={expandida === o.id}
                      onToggle={() => setExpandida(expandida === o.id ? null : o.id)}
                      TIPO_LABEL={TIPO_LABEL} />
                  ))}
                </div>
              )}

              {/* Otras ofertas */}
              {ofertasOtras.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-2">Otras búsquedas</p>
                  {ofertasOtras.map(o => (
                    <OfertaBarberoCard key={o.id} oferta={o} yaPost={yaPostulado(o.id)} estado={estadoPost(o.id)}
                      postulando={postulando === o.id} mensaje={mensaje} setMensaje={setMensaje}
                      onPostular={() => postularse(o.id)}
                      onConfirmar={() => confirmarPostulacion(o.id)}
                      onCancelarForm={() => { setPostulando(null); setMensaje(""); }}
                      onRetirar={() => retirarPostulacion(o.id)}
                      expandida={expandida === o.id}
                      onToggle={() => setExpandida(expandida === o.id ? null : o.id)}
                      TIPO_LABEL={TIPO_LABEL} />
                  ))}
                </div>
              )}

              {ofertas.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase size={32} className="text-[#e8e8e6] mx-auto mb-3" />
                  <p className="text-sm text-[#ccc]">No hay búsquedas activas por ahora</p>
                  <p className="text-xs text-[#ddd] mt-1">Volvé a revisar pronto</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OfertaBarberoCard({ oferta, yaPost, estado, postulando, mensaje, setMensaje,
  onPostular, onConfirmar, onCancelarForm, onRetirar, expandida, onToggle, TIPO_LABEL }: {
  oferta: Oferta; yaPost: boolean; estado?: string; postulando: boolean;
  mensaje: string; setMensaje: (s: string) => void;
  onPostular: () => void; onConfirmar: () => void; onCancelarForm: () => void;
  onRetirar: () => void; expandida: boolean; onToggle: () => void;
  TIPO_LABEL: Record<string,string>;
}) {
  const salon = (oferta as any).profiles as Profile | undefined;
  const ESTADO_COLOR: Record<string, string> = { pendiente: "#f59e0b", vista: "#3b82f6", aceptada: "#22c55e", rechazada: "#ef4444" };
  const ESTADO_LABEL: Record<string, string> = { pendiente: "Postulado", vista: "Vista", aceptada: "¡Aceptada!", rechazada: "Rechazada" };

  return (
    <div className={`bg-white border rounded-3xl overflow-hidden mb-3 transition-all ${yaPost && estado === "aceptada" ? "border-green-200" : "border-[#ebebeb]"}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="p-4">
        {/* Header del salón */}
        {salon && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#f4f4f2] relative flex-shrink-0">
              {salon.foto_url
                ? <Image src={salon.foto_url} alt={salon.nombre} fill className="object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-[#0a0a0a] text-white">{salon.nombre[0]}</div>
              }
            </div>
            <div className="min-w-0">
              <Link href={`/profile/${salon.id}`} className="text-xs font-semibold text-[#0a0a0a] hover:underline truncate block">
                {salon.nombre}
              </Link>
              {salon.ubicacion && (
                <p className="text-[10px] text-[#aaa] flex items-center gap-0.5">
                  <MapPin size={9} />{salon.ubicacion}
                </p>
              )}
            </div>
            <button onClick={onToggle} className="ml-auto text-[#bbb] p-1" style={{ WebkitTapHighlightColor: "transparent" }}>
              {expandida ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        )}

        {/* Título */}
        <h3 className="font-semibold text-[#0a0a0a] text-sm mb-1">{oferta.titulo}</h3>
        <div className="flex flex-wrap gap-2 text-[11px] text-[#aaa] mb-2">
          {oferta.ciudad && <span className="flex items-center gap-0.5"><MapPin size={10} />{oferta.ciudad}</span>}
          {oferta.tipo_empleo && <span>· {TIPO_LABEL[oferta.tipo_empleo] ?? oferta.tipo_empleo}</span>}
        </div>

        {/* Skills */}
        {oferta.skills && oferta.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {oferta.skills.map(s => (
              <span key={s} className="text-[10px] bg-[#f4f4f2] text-[#666] px-2 py-0.5 rounded-full border border-[#ebebeb]">{s}</span>
            ))}
          </div>
        )}

        {/* Descripción expandible */}
        {expandida && oferta.descripcion && (
          <p className="text-xs text-[#666] leading-relaxed mb-3 p-3 bg-[#f9f9f7] rounded-2xl">{oferta.descripcion}</p>
        )}

        {/* CTA */}
        {!yaPost ? (
          postulando ? (
            <div className="space-y-2">
              <textarea className="textarea text-sm py-2.5" rows={2} value={mensaje} onChange={e => setMensaje(e.target.value)}
                placeholder="Mensaje opcional para el salón… (podés dejarlo vacío)" />
              <div className="flex gap-2">
                <button onClick={onConfirmar} className="btn-primary flex-1 text-xs py-2.5 gap-1.5"
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  <Send size={13} /> Enviar postulación
                </button>
                <button onClick={onCancelarForm} className="btn-secondary text-xs py-2.5 px-4"
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={onPostular} className="btn-primary w-full text-sm gap-2"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <Send size={14} /> Postularme a esta búsqueda
            </button>
          )
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-1.5"
              style={{ background: (ESTADO_COLOR[estado ?? "pendiente"]) + "15", color: ESTADO_COLOR[estado ?? "pendiente"] }}>
              <Check size={12} /> {ESTADO_LABEL[estado ?? "pendiente"]}
            </span>
            {estado === "pendiente" && (
              <button onClick={onRetirar}
                className="text-xs text-[#bbb] hover:text-red-400 transition flex items-center gap-1"
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <X size={12} /> Retirar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
