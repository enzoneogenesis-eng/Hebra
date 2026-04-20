"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { EditProfileForm } from "./EditProfileForm";
import { SubirTrabajo } from "./SubirTrabajo";
import { TrabajoCard } from "./TrabajoCard";
import { Onboarding } from "./Onboarding";
import { DashboardFinanzas } from "./DashboardFinanzas"
import { ResenasDashboard } from "./ResenasDashboard"
import { AgendaBarbero } from "./AgendaBarbero";
import { TurnosBarbero } from "./TurnosBarbero";
import { EstadisticasBarbero } from "./EstadisticasBarbero";
import { BadgeVerificado } from "./BadgeVerificado";
import { Briefcase, MapPin, Send, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Profile, Trabajo, Oferta, Postulacion } from "@/types";

const TIPO_LABEL: Record<string, string> = {
  relacion_dependencia: "Relación de dependencia",
  autonomo: "Autónomo",
  porcentaje: "Por porcentaje",
  alquiler_silla: "Alquiler de silla",
};

export function DashboardBarbero({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile]         = useState(initialProfile);
  const [trabajos, setTrabajos]       = useState<Trabajo[]>([]);
  const [ofertas, setOfertas]         = useState<Oferta[]>([]);
  const [misPostulaciones, setMisPost] = useState<Postulacion[]>([]);
  const [tab, setTab]                 = useState<"portfolio"|"ofertas"|"agenda"|"turnos"|"finanzas"|"resenas"|"perfil">("portfolio");
  const [loading, setLoading]         = useState(true);
  const [postulando, setPostulando]   = useState<string | null>(null);
  const [mensaje, setMensaje]         = useState("");
  const [expandida, setExpandida]     = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: t }, { data: o }, { data: mp }, { data: p }] = await Promise.all([
      supabase.from("trabajos").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("ofertas").select("*, profiles(id, nombre, foto_url, ubicacion, telefono)").eq("activa", true).order("created_at", { ascending: false }),
      supabase.from("postulaciones").select("*, ofertas(titulo, profiles(nombre))").eq("barbero_id", profile.id),
      supabase.from("profiles").select("*").eq("id", profile.id).single(),
    ]);
    setTrabajos(t ?? []);
    setOfertas((o as any) ?? []);
    setMisPost((mp as any) ?? []);
    if (p) {
      setProfile(p as Profile);
      const onbDone = (p as any).onboarding_done;
      const tienesFoto = !!p.foto_url;
      const tieneSkills = !!(p as any).skills?.length;
      const tieneCiudad = !!p.ubicacion;
      if (!onbDone && (!tienesFoto || !tieneSkills || !tieneCiudad)) {
        setShowOnboarding(true);
      }
    }
    setLoading(false);
  }

  async function postularse(ofertaId: string) { setPostulando(ofertaId); }

  async function confirmarPostulacion(ofertaId: string) {
    const { error } = await supabase.from("postulaciones").insert({
      oferta_id: ofertaId, barbero_id: profile.id,
      mensaje: mensaje.trim() || null,
    });
    if (!error) setMisPost(p => [...p, { id: Date.now().toString(), oferta_id: ofertaId, barbero_id: profile.id, mensaje: mensaje.trim() || null, estado: "pendiente", created_at: new Date().toISOString() }]);
    setPostulando(null); setMensaje("");
  }

  async function retirarPostulacion(ofertaId: string) {
    await supabase.from("postulaciones").delete().eq("oferta_id", ofertaId).eq("barbero_id", profile.id);
    setMisPost(p => p.filter(x => x.oferta_id !== ofertaId));
  }

  const yaPostulado = (id: string) => misPostulaciones.some(p => p.oferta_id === id);
  const estadoPost  = (id: string) => misPostulaciones.find(p => p.oferta_id === id)?.estado;

  const ESTADO_COLOR: Record<string, string> = { pendiente: "#f59e0b", vista: "#3b82f6", aceptada: "#22c55e", rechazada: "#ef4444" };
  const ESTADO_LABEL: Record<string, string> = { pendiente: "Pendiente", vista: "Vista", aceptada: "Â¡Aceptada!", rechazada: "Rechazada" };

  const ofertasMatch = ofertas.filter(o => !profile.skills || !(o as any).skills || (o as any).skills?.some((s: string) => profile.skills!.includes(s)));
  const ofertasOtras = ofertas.filter(o => !ofertasMatch.includes(o));

  return (
    <div>
      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding profile={profile} onDone={() => setShowOnboarding(false)} />
      )}

      {/* Badge verificado */}
      {(profile as any).verificado && (
        <div className="mb-4 flex items-center gap-2">
          <BadgeVerificado size="md" />
          <span className="text-xs text-[#444]">Tu perfil está verificado por Hebra</span>
        </div>
      )}

      {/* Estadísticas */}
      <EstadisticasBarbero barberoId={profile.id} />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#111] border border-[#1e1e1e] p-1 rounded-2xl">
        {[
          { id: "portfolio", label: `Portfolio (${trabajos.length})` },
          { id: "ofertas",   label: `Búsquedas (${ofertas.length})` },
          { id: "agenda",    label: `Agenda` },
          { id: "turnos",    label: `Turnos` },
          { id: "finanzas",  label: `Finanzas` },
          { id: "resenas",   label: `Reseñas` },
          { id: "perfil",    label: `Perfil` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              tab === t.id ? "bg-[#0a0a0a] text-white" : "text-[#444]"
            }`} style={{ WebkitTapHighlightColor: "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#111] rounded-3xl" />)}</div>
      ) : (
        <>
          {tab === "portfolio" && (
            <div>
              <SubirTrabajo userId={profile.id} onSubido={t => setTrabajos(prev => [t, ...prev])} />
              {trabajos.length > 0
                ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">{trabajos.map(t => <TrabajoCard key={t.id} trabajo={t} />)}</div>
                : <div className="text-center py-12"><p className="text-sm text-[#333]">Todavía no subiste fotos</p></div>
              }
            </div>
          )}

          {tab === "ofertas" && (
            <div className="space-y-4">
              {misPostulaciones.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-4">
                  <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Mis postulaciones</p>
                  <div className="space-y-2">
                    {misPostulaciones.map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{(p.ofertas as any)?.titulo ?? "Oferta"}</p>
                          <p className="text-[11px] text-[#444]">{(p.ofertas as any)?.profiles?.nombre ?? "Salón"}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                          style={{ background: (ESTADO_COLOR[p.estado] ?? "#999") + "20", color: ESTADO_COLOR[p.estado] ?? "#999" }}>
                          {ESTADO_LABEL[p.estado] ?? p.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ofertasMatch.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" /> Coinciden con tus skills
                  </p>
                  {ofertasMatch.map(o => <OfertaCard key={o.id} oferta={o} yaPost={yaPostulado(o.id)} estado={estadoPost(o.id)} postulando={postulando === o.id} mensaje={mensaje} setMensaje={setMensaje} onPostular={() => postularse(o.id)} onConfirmar={() => confirmarPostulacion(o.id)} onCancelar={() => { setPostulando(null); setMensaje(""); }} onRetirar={() => retirarPostulacion(o.id)} expandida={expandida === o.id} onToggle={() => setExpandida(expandida === o.id ? null : o.id)} TIPO_LABEL={TIPO_LABEL} ESTADO_COLOR={ESTADO_COLOR} ESTADO_LABEL={ESTADO_LABEL} />)}
                </div>
              )}

              {ofertasOtras.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-2">Otras búsquedas</p>
                  {ofertasOtras.map(o => <OfertaCard key={o.id} oferta={o} yaPost={yaPostulado(o.id)} estado={estadoPost(o.id)} postulando={postulando === o.id} mensaje={mensaje} setMensaje={setMensaje} onPostular={() => postularse(o.id)} onConfirmar={() => confirmarPostulacion(o.id)} onCancelar={() => { setPostulando(null); setMensaje(""); }} onRetirar={() => retirarPostulacion(o.id)} expandida={expandida === o.id} onToggle={() => setExpandida(expandida === o.id ? null : o.id)} TIPO_LABEL={TIPO_LABEL} ESTADO_COLOR={ESTADO_COLOR} ESTADO_LABEL={ESTADO_LABEL} />)}
                </div>
              )}

              {ofertas.length === 0 && (
                <div className="text-center py-12"><Briefcase size={28} className="text-[#222] mx-auto mb-3" /><p className="text-sm text-[#333]">No hay búsquedas activas</p></div>
              )}
            </div>
          )}

          {tab === "finanzas" && (
            <DashboardFinanzas />
          )}

          {tab === "resenas" && (
            <ResenasDashboard barberoId={profile.id} barberoNombre={profile.nombre ?? "Barbero"} />
          )}

          {tab === "agenda" && (
            <AgendaBarbero profile={profile} />
          )}

          {tab === "turnos" && (
            <TurnosBarbero profile={profile} />
          )}

          {tab === "perfil" && (
            <EditProfileForm profile={profile} onUpdate={() => loadAll()} />
          )}

        </>
      )}
    </div>
  );
}

function OfertaCard({ oferta, yaPost, estado, postulando, mensaje, setMensaje, onPostular, onConfirmar, onCancelar, onRetirar, expandida, onToggle, TIPO_LABEL, ESTADO_COLOR, ESTADO_LABEL }: any) {
  const salon = (oferta as any).profiles as Profile | undefined;
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-3xl overflow-hidden mb-3">
      <div className="p-4">
        {salon && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1a1a1a] relative flex-shrink-0">
              {salon.foto_url ? <Image src={salon.foto_url} alt={salon.nombre} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-[#22c55e] text-black">{salon.nombre[0]}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${salon.id}`} className="text-xs font-semibold text-white hover:text-[#22c55e] transition truncate block">{salon.nombre}</Link>
              {salon.ubicacion && <p className="text-[10px] text-[#444]">{salon.ubicacion}</p>}
            </div>
            <button onClick={onToggle} className="text-[#333] p-1" style={{ WebkitTapHighlightColor: "transparent" }}>
              {expandida ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        )}
        <h3 className="font-semibold text-white text-sm mb-1">{oferta.titulo}</h3>
        <p className="text-[11px] text-[#444]">{oferta.ciudad} {oferta.tipo_empleo && `Â· ${TIPO_LABEL[oferta.tipo_empleo]}`}</p>
        {oferta.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {oferta.skills.map((s: string) => <span key={s} className="text-[10px] bg-[#0a1a0a] text-[#22c55e] border border-[#1a3a1a] px-2 py-0.5 rounded-full">{s}</span>)}
          </div>
        )}
        {expandida && oferta.descripcion && <p className="text-xs text-[#555] leading-relaxed mt-3 p-3 bg-[#0d0d0d] rounded-2xl">{oferta.descripcion}</p>}
        <div className="mt-3">
          {!yaPost ? (
            postulando ? (
              <div className="space-y-2">
                <textarea className="textarea text-sm py-2.5" rows={2} value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Mensaje opcionalâ€¦" />
                <div className="flex gap-2">
                  <button onClick={onConfirmar} className="btn-primary flex-1 text-xs py-2.5 gap-1.5" style={{ WebkitTapHighlightColor: "transparent" }}><Send size={13} /> Enviar</button>
                  <button onClick={onCancelar} className="btn-secondary text-xs py-2.5 px-4" style={{ WebkitTapHighlightColor: "transparent" }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={onPostular} className="btn-primary w-full text-sm gap-2" style={{ WebkitTapHighlightColor: "transparent" }}><Send size={14} /> Postularme</button>
            )
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-1.5"
                style={{ background: (ESTADO_COLOR[estado ?? "pendiente"]) + "15", color: ESTADO_COLOR[estado ?? "pendiente"] }}>
                <Check size={12} /> {ESTADO_LABEL[estado ?? "pendiente"]}
              </span>
              {estado === "pendiente" && <button onClick={onRetirar} className="text-xs text-[#333] hover:text-red-400 transition flex items-center gap-1" style={{ WebkitTapHighlightColor: "transparent" }}><X size={12} /> Retirar</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



