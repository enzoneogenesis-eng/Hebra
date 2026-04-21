"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { EditProfileForm } from "./EditProfileForm";
import { CiudadSelector } from "./CiudadSelector";
import { MisTurnosCliente } from "./MisTurnosCliente";
import { CIUDADES } from "@/lib/ciudades";
import { Search, Heart, Clock, Bell, BellOff, X, Calendar } from "lucide-react";
import type { Profile, Notificacion } from "@/types";

interface FavoritoRow { barbero_id: string; created_at: string; profiles: Profile }
interface HistorialRow { barbero_id: string; created_at: string; profiles: Profile }

export function DashboardCliente({ profile }: { profile: Profile }) {
  const [tab, setTab]                   = useState<"turnos"|"favoritos"|"historial"|"notificaciones">("turnos");
  const [favoritos, setFavoritos]       = useState<FavoritoRow[]>([]);
  const [historial, setHistorial]       = useState<HistorialRow[]>([]);
  const [notifs, setNotifs]             = useState<Notificacion[]>([]);
  const [suscripciones, setSuscripciones] = useState<string[]>([]);
  const [ciudadSub, setCiudadSub]       = useState("");
  const [loading, setLoading]           = useState(true);
  const [noLeidas, setNoLeidas]         = useState(0);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [{ data: favs }, { data: hist }, { data: nots }, { data: subs }] = await Promise.all([
      supabase.from("favoritos").select("barbero_id, created_at, profiles(*)").eq("cliente_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("historial").select("barbero_id, created_at, profiles(*)").eq("cliente_id", profile.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("notificaciones").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("suscripciones_ciudad").select("ciudad").eq("cliente_id", profile.id),
    ]);
    setFavoritos((favs as any) ?? []);
    // Deduplicar historial por barbero_id
    const seen = new Set<string>();
    const hist_dedup = ((hist as any) ?? []).filter((h: HistorialRow) => {
      if (seen.has(h.barbero_id)) return false;
      seen.add(h.barbero_id);
      return true;
    });
    setHistorial(hist_dedup);
    setNotifs((nots as any) ?? []);
    setSuscripciones((subs ?? []).map((s: any) => s.ciudad));
    setNoLeidas((nots ?? []).filter((n: any) => !n.leida).length);
    setLoading(false);
  }

  async function marcarLeidas() {
    await supabase.from("notificaciones").update({ leida: true }).eq("user_id", profile.id).eq("leida", false);
    setNotifs(n => n.map(x => ({ ...x, leida: true })));
    setNoLeidas(0);
  }

  async function suscribir() {
    if (!ciudadSub || suscripciones.includes(ciudadSub)) return;
    await supabase.from("suscripciones_ciudad").insert({ cliente_id: profile.id, ciudad: ciudadSub });
    setSuscripciones(s => [...s, ciudadSub]);
    setCiudadSub("");
  }

  async function desuscribir(ciudad: string) {
    await supabase.from("suscripciones_ciudad").delete().eq("cliente_id", profile.id).eq("ciudad", ciudad);
    setSuscripciones(s => s.filter(c => c !== ciudad));
  }

  async function quitarFavorito(barberoId: string) {
    await supabase.from("favoritos").delete().eq("cliente_id", profile.id).eq("barbero_id", barberoId);
    setFavoritos(f => f.filter(x => x.barbero_id !== barberoId));
  }

  function BarberoMini({ p, onRemove }: { p: Profile; onRemove?: () => void }) {
    return (
      <div className="flex items-center gap-3 bg-white border border-[#f0f0f0] rounded-2xl p-3 hover:border-[#0a0a0a] transition-all group">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f4f4f2] flex-shrink-0">
          {p.foto_url
            ? <Image src={p.foto_url} alt={p.nombre} width={48} height={48} className="object-cover w-full h-full" />
            : <div className="w-full h-full flex items-center justify-center font-bold text-[#ccc] bg-[#0a0a0a] text-white">{p.nombre[0]}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0a0a0a] text-sm truncate">{p.nombre}</p>
          {p.ubicacion && <p className="text-xs text-[#aaa] truncate">{p.ubicacion}</p>}
          {p.skills && <div className="flex gap-1 mt-1">{p.skills.slice(0,2).map(s=><span key={s} className="text-[10px] bg-[#f4f4f2] text-[#666] px-2 py-0.5 rounded-full border border-[#ebebeb]">{s}</span>)}</div>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/profile/${p.id}`} className="text-[10px] font-semibold bg-[#0a0a0a] text-white px-3 py-1.5 rounded-full hover:bg-[#333] transition">
            Ver
          </Link>
          {onRemove && (
            <button onClick={onRemove} className="text-[#ccc] hover:text-red-400 transition p-1">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "turnos",         label: "Mis turnos",     icon: <Calendar size={15} />,  count: 0 },
    { id: "favoritos",      label: "Favoritos",      icon: <Heart size={15} />,      count: favoritos.length },
    { id: "historial",      label: "Visitados",      icon: <Clock size={15} />,      count: historial.length },
    { id: "notificaciones", label: "Notificaciones", icon: <Bell  size={15} />,      count: noLeidas },
  ] as const;

  return (
    <div>

      {/* CTA buscador */}
      <Link href="/search"
        className="flex items-center gap-3 bg-[#0a0a0a] text-white rounded-3xl p-5 mb-6 hover:bg-[#2a2a2a] transition group">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Search size={18} />
        </div>
        <div>
          <p className="font-semibold text-sm">Buscar barberos</p>
          <p className="text-xs text-white/50">Encontrá profesionales cerca tuyo</p>
        </div>
        <span className="ml-auto text-white/30 group-hover:text-white/60 transition">→</span>
      </Link>

      {/* Tabs */}
      <div className="bg-white border border-[#f0f0f0] rounded-3xl overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-[#f0f0f0]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as any); if (t.id === "notificaciones" && noLeidas > 0) marcarLeidas(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold transition-all ${
                tab === t.id ? "text-[#0a0a0a] border-b-2 border-[#0a0a0a] bg-[#fafafa]" : "text-[#aaa] hover:text-[#666]"
              }`}>
              {t.icon}
              <span className="hidden sm:block">{t.label}</span>
              {t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  t.id === "notificaciones" ? "bg-[#0a0a0a] text-white" : "bg-[#f0f0f0] text-[#666]"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#f4f4f2] rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* FAVORITOS */}
              {tab === "turnos" && (
                  <div>
                    <MisTurnosCliente profile={profile} />
                  </div>
                )}

                {tab === "favoritos" && (
                <div>
                  {favoritos.length > 0 ? (
                    <div className="space-y-2">
                      {favoritos.map(f => (
                        <BarberoMini key={f.barbero_id} p={f.profiles} onRemove={() => quitarFavorito(f.barbero_id)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart size={32} className="text-[#e8e8e6] mx-auto mb-3" />
                      <p className="font-semibold text-[#ccc] text-sm">Todavía no tenés favoritos</p>
                      <p className="text-xs text-[#ddd] mt-1">Guardá barberos tocando el corazón en su perfil</p>
                      <Link href="/search" className="inline-block mt-4 btn-primary text-xs py-2">Explorar barberos</Link>
                    </div>
                  )}
                </div>
              )}

              {/* HISTORIAL */}
              {tab === "historial" && (
                <div>
                  {historial.length > 0 ? (
                    <div className="space-y-2">
                      {historial.map(h => <BarberoMini key={h.barbero_id} p={h.profiles} />)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock size={32} className="text-[#e8e8e6] mx-auto mb-3" />
                      <p className="font-semibold text-[#ccc] text-sm">No visitaste ningún perfil todavía</p>
                      <p className="text-xs text-[#ddd] mt-1">Los barberos que visites van a aparecer acá</p>
                      <Link href="/search" className="inline-block mt-4 btn-primary text-xs py-2">Explorar barberos</Link>
                    </div>
                  )}
                </div>
              )}

              {/* NOTIFICACIONES */}
              {tab === "notificaciones" && (
                <div className="space-y-5">
                  {/* Suscripciones a ciudades */}
                  <div className="bg-[#f9f9f7] border border-[#ebebeb] rounded-2xl p-4">
                    <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Bell size={12} /> Nuevos barberos en tu ciudad
                    </p>
                    <div className="flex gap-2 mb-3">
                      <CiudadSelector value={ciudadSub} onChange={setCiudadSub}
                        placeholder="Elegí una ciudad" className="py-2 text-xs flex-1" />
                      <button onClick={suscribir} disabled={!ciudadSub || suscripciones.includes(ciudadSub)}
                        className="btn-primary text-xs py-2 px-4 whitespace-nowrap">
                        Activar
                      </button>
                    </div>
                    {suscripciones.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suscripciones.map(c => {
                          const label = CIUDADES.find(x => x.value === c)?.label ?? c;
                          return (
                            <span key={c} className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0a0a0a] text-white px-3 py-1.5 rounded-full">
                              {label}
                              <button onClick={() => desuscribir(c)} className="hover:text-gray-300"><X size={10} /></button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lista de notificaciones */}
                  {notifs.length > 0 ? (
                    <div className="space-y-2">
                      {notifs.map(n => (
                        <div key={n.id} className={`flex gap-3 p-4 rounded-2xl border transition-all ${
                          n.leida ? "bg-white border-[#f0f0f0]" : "bg-[#fafafa] border-[#0a0a0a]/10"
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            n.leida ? "bg-[#f4f4f2]" : "bg-[#0a0a0a]"
                          }`}>
                            <Bell size={13} className={n.leida ? "text-[#ccc]" : "text-white"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${n.leida ? "text-[#999]" : "text-[#0a0a0a]"}`}>{n.titulo}</p>
                            <p className="text-xs text-[#aaa] mt-0.5">{n.mensaje}</p>
                            {n.data?.barbero_id && (
                              <Link href={`/profile/${n.data.barbero_id}`} className="text-[10px] font-semibold text-[#0a0a0a] underline mt-1 block">
                                Ver perfil →
                              </Link>
                            )}
                          </div>
                          {!n.leida && <div className="w-2 h-2 rounded-full bg-[#0a0a0a] flex-shrink-0 mt-2" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BellOff size={28} className="text-[#e8e8e6] mx-auto mb-3" />
                      <p className="text-sm text-[#ccc]">No hay notificaciones todavía</p>
                      <p className="text-xs text-[#ddd] mt-1">Activá alertas de ciudades arriba</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
