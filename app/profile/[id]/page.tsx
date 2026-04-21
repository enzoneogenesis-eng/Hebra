"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { FavoritoButton } from "@/components/FavoritoButton";
import { CompartirPerfil } from "@/components/CompartirPerfil";
import { Resenas } from "@/components/Resenas";
import { BadgeVerificado } from "@/components/BadgeVerificado";
import { formatDate } from "@/lib/utils";
import { MapPin, ArrowLeft, Instagram } from "lucide-react";
import type { Profile, Trabajo, Oferta } from "@/types";
import { ReservarTurnoModal } from "@/components/ReservarTurnoModal";
import { Calendar } from "lucide-react";

const tipoLabel: Record<string, string> = { barbero: "Barbero", salon: "Salón", cliente: "Cliente" };

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [ofertas, setOfertas]   = useState<Oferta[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showReservar, setShowReservar] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: t }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", params.id).single(),
        supabase.from("trabajos").select("*").eq("user_id", params.id).order("created_at", { ascending: false }),
        supabase.from("ofertas").select("*").eq("salon_id", params.id).eq("activa", true).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setTrabajos(t ?? []);
      setOfertas(o ?? []);
      setLoading(false);

      // Registrar visita
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id ?? null);
      if (p && session?.user.id !== params.id) {
        await supabase.from("visitas").insert({
          barbero_id: params.id,
          visitor_id: session?.user.id ?? null,
        });
        if (session) {
          const { data: cp } = await supabase.from("profiles").select("tipo").eq("id", session.user.id).single();
          if (cp?.tipo === "cliente") {
            await supabase.from("historial").insert({ cliente_id: session.user.id, barbero_id: params.id });
          }
        }
      }
    }
    load();
  }, [params.id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse" style={{ background: "#0a0a0a" }}>
      <div className="h-6 w-32 bg-[#111] rounded-full mb-6" />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="aspect-square rounded-3xl bg-[#111]" />
        <div className="space-y-4 py-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-[#111] rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20" style={{ background: "#0a0a0a" }}>
      <p className="text-[#444] mb-4">Perfil no encontrado.</p>
      <Link href="/search" className="btn-primary px-6">Volver al buscador</Link>
    </div>
  );

  const waNumber = profile.telefono?.replace(/\D/g, "");
  const hasWA    = !!waNumber;
  const hasIG    = !!profile.instagram;
  const verificado = (profile as any).verificado;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8" style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* Back + compartir */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/search" className="inline-flex items-center gap-2 text-sm text-[#444] hover:text-white transition">
          <ArrowLeft size={14} /> Explorar
        </Link>
        <CompartirPerfil nombre={profile.nombre} id={profile.id} />
      </div>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="aspect-square rounded-3xl overflow-hidden bg-[#111] relative">
          {profile.foto_url
            ? <Image src={profile.foto_url} alt={profile.nombre} fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-bold text-[#22c55e]">{profile.nombre[0].toUpperCase()}</span>
              </div>
          }
        </div>

        <div className="flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">{tipoLabel[profile.tipo]}</span>
                {verificado && <BadgeVerificado />}
              </div>
              <FavoritoButton barberoId={profile.id} />
            </div>

            <h1 className="font-['Bebas_Neue'] text-5xl md:text-6xl text-white leading-none mb-3">
              {profile.nombre.toUpperCase()}
            </h1>

            {profile.ubicacion && (
              <p className="text-sm text-[#444] flex items-center gap-1.5 mb-4">
                <MapPin size={13} />{profile.ubicacion}
              </p>
            )}

            {profile.bio && (
              <p className="text-sm text-[#555] leading-relaxed mb-4">{profile.bio}</p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-[#333] uppercase tracking-widest mb-2">Especialidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(s => (
                    <span key={s} className="text-xs font-medium bg-[#0a1a0a] text-[#22c55e] px-3 py-1.5 rounded-full border border-[#1a3a1a]">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {profile.is_barbero && currentUserId && currentUserId !== profile.id && (
              <button
                onClick={() => setShowReservar(true)}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full text-black font-bold text-base transition-all active:scale-95 bg-[#1ed760] hover:bg-[#1ed760]/90"
              >
                <Calendar size={18} />
                Reservar turno
              </button>
            )}
            {hasWA && (
              <a href={`https://wa.me/${waNumber}?text=Hola%20${encodeURIComponent(profile.nombre)}%2C%20te%20contacto%20desde%20Hebra%20%F0%9F%92%88`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full text-black font-bold text-base transition-all active:scale-95"
                style={{ background: "#22c55e" }}>
                <WhatsAppIcon />Contactar por WhatsApp
              </a>
            )}
            {hasIG && (
              <a href={`https://instagram.com/${profile.instagram}`}
                target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all active:scale-95 ${
                  hasWA ? "border border-[#1e1e1e] text-[#555] hover:border-[#444]" : "text-white"
                }`}
                style={!hasWA ? { background: "linear-gradient(135deg,#f09433,#dc2743,#bc1888)" } : {}}>
                <Instagram size={18} />{hasWA ? `@${profile.instagram}` : `Instagram @${profile.instagram}`}
              </a>
            )}
            {!hasWA && !hasIG && (
              <div className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#111] border border-[#1e1e1e] text-[#444] text-sm">
                Sin datos de contacto
              </div>
            )}
            {trabajos.length > 0 && (
              <p className="text-center text-xs text-[#333]">{trabajos.length} foto{trabajos.length !== 1 ? "s" : ""} en el portfolio</p>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio */}
      {trabajos.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Bebas_Neue'] text-3xl text-white tracking-wide">PORTFOLIO</h2>
            <span className="text-xs text-[#333]">{trabajos.length} fotos</span>
          </div>
          <PortfolioGrid trabajos={trabajos} />
        </section>
      )}

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="mb-10">
          <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-4 tracking-wide">OFERTAS ACTIVAS</h2>
          <div className="space-y-3">
            {ofertas.map(o => (
              <div key={o.id} className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{o.titulo}</h3>
                    {o.descripcion && <p className="text-sm text-[#555]">{o.descripcion}</p>}
                    <p className="text-xs text-[#333] mt-2">{formatDate(o.created_at)}</p>
                  </div>
                  {hasWA && (
                    <a href={`https://wa.me/${waNumber}?text=Hola%2C%20me%20interesa%20la%20oferta%3A%20${encodeURIComponent(o.titulo)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs font-bold text-black px-4 py-2 rounded-full flex items-center gap-1.5 transition active:scale-95"
                      style={{ background: "#22c55e" }}>
                      <WhatsAppIcon /> Postularme
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reseñas */}
      {profile.tipo !== "cliente" && (
        <Resenas barberoId={profile.id} />
      )}

      {showReservar && (
        <ReservarTurnoModal barbero={profile} onClose={() => setShowReservar(false)} />
      )}
    </div>
  );
}
