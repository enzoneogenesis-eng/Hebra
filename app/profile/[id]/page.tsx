"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { FavoritoButton } from "@/components/FavoritoButton";
import { formatDate } from "@/lib/utils";
import { MapPin, ArrowLeft, Instagram } from "lucide-react";
import type { Profile, Trabajo, Oferta } from "@/types";

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

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: t }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", params.id).single(),
        supabase.from("trabajos").select("*").eq("user_id", params.id).order("created_at", { ascending: false }),
        supabase.from("ofertas").select("*").eq("salon_id", params.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setTrabajos(t ?? []);
      setOfertas(o ?? []);
      setLoading(false);

      // Registrar visita en historial si es cliente
      const { data: { session } } = await supabase.auth.getSession();
      if (session && p) {
        const { data: cp } = await supabase.from("profiles").select("tipo").eq("id", session.user.id).single();
        if (cp?.tipo === "cliente" && session.user.id !== params.id) {
          await supabase.from("historial").insert({ cliente_id: session.user.id, barbero_id: params.id });
        }
      }
    }
    load();
  }, [params.id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-6 w-32 bg-[#f0f0f0] rounded-full mb-6" />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="aspect-square rounded-3xl bg-[#f0f0f0]" />
        <div className="space-y-4 py-2">
          <div className="h-4 w-16 bg-[#f0f0f0] rounded-full" />
          <div className="h-10 w-3/4 bg-[#f0f0f0] rounded-2xl" />
          <div className="h-4 w-32 bg-[#f0f0f0] rounded-full" />
          <div className="h-20 bg-[#f0f0f0] rounded-2xl" />
          <div className="h-14 bg-[#f0f0f0] rounded-full mt-8" />
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-[#999] mb-4">Perfil no encontrado.</p>
      <Link href="/search" className="btn-primary">Volver al buscador</Link>
    </div>
  );

  const waNumber = profile.telefono?.replace(/\D/g, "");
  const hasWA    = !!waNumber;
  const hasIG    = !!profile.instagram;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8" style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* Back */}
      <Link href="/search"
        className="inline-flex items-center gap-2 text-sm text-[#aaa] hover:text-[#0a0a0a] transition mb-6">
        <ArrowLeft size={14} /> Volver a explorar
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Foto de perfil */}
        <div className="aspect-square rounded-3xl overflow-hidden bg-[#f4f4f2] relative">
          {profile.foto_url
            ? <Image src={profile.foto_url} alt={profile.nombre} fill className="object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#0a0a0a] flex items-center justify-center text-4xl font-bold text-white">
                  {profile.nombre[0].toUpperCase()}
                </div>
              </div>
            )
          }
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between py-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#bbb] uppercase tracking-widest">
                {tipoLabel[profile.tipo]}
              </span>
              <FavoritoButton barberoId={profile.id} />
            </div>

            <h1 className="font-['Bebas_Neue'] text-5xl md:text-6xl text-[#0a0a0a] leading-none mb-4">
              {profile.nombre.toUpperCase()}
            </h1>

            {profile.ubicacion && (
              <p className="text-sm text-[#aaa] flex items-center gap-1.5 mb-4">
                <MapPin size={13} />{profile.ubicacion}
              </p>
            )}

            {profile.bio && (
              <p className="text-sm text-[#666] leading-relaxed mb-5">{profile.bio}</p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-[#ccc] uppercase tracking-widest mb-2">Especialidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(s => (
                    <span key={s} className="text-xs font-medium bg-[#f5f5f3] text-[#555] px-3 py-1.5 rounded-full border border-[#ebebeb]">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            {hasWA && (
              <a href={`https://wa.me/${waNumber}?text=Hola%20${encodeURIComponent(profile.nombre)}%2C%20te%20contacto%20desde%20Hebra%20%F0%9F%92%88`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full text-white font-semibold text-base transition-all active:scale-95"
                style={{ background: "#25d366" }}>
                <WhatsAppIcon />
                Contactar por WhatsApp
              </a>
            )}
            {hasIG && (
              <a href={`https://instagram.com/${profile.instagram}`}
                target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full font-semibold text-sm transition-all active:scale-95 ${
                  hasWA ? "border border-[#e8e8e6] text-[#666] hover:border-[#0a0a0a] hover:text-[#0a0a0a]" : "text-white"
                }`}
                style={!hasWA ? { background: "linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)" } : {}}>
                <Instagram size={18} />
                {hasWA ? `@${profile.instagram}` : `Escribir a @${profile.instagram} en Instagram`}
              </a>
            )}
            {!hasWA && !hasIG && (
              <a href={`mailto:?subject=Contacto desde Hebra - ${profile.nombre}`}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full bg-[#0a0a0a] text-white font-semibold text-sm hover:bg-[#2a2a2a] transition-all active:scale-95">
                Contactar
              </a>
            )}
            {trabajos.length > 0 && (
              <p className="text-center text-xs text-[#bbb] pt-1">
                {trabajos.length} trabajo{trabajos.length !== 1 ? "s" : ""} en el portfolio
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== PORTFOLIO CON LIGHTBOX ===== */}
      {trabajos.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Bebas_Neue'] text-3xl text-[#0a0a0a] tracking-wide">PORTFOLIO</h2>
            <span className="text-xs text-[#bbb] font-medium">{trabajos.length} foto{trabajos.length !== 1 ? "s" : ""}</span>
          </div>
          <PortfolioGrid trabajos={trabajos} />
        </section>
      )}

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="mb-10">
          <h2 className="font-['Bebas_Neue'] text-3xl text-[#0a0a0a] mb-4 tracking-wide">OFERTAS ACTIVAS</h2>
          <div className="space-y-3">
            {ofertas.map(o => (
              <div key={o.id} className="bg-white border border-[#ebebeb] rounded-3xl p-5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#0a0a0a] mb-1">{o.titulo}</h3>
                    {o.descripcion && <p className="text-sm text-[#666]">{o.descripcion}</p>}
                    <p className="text-xs text-[#ccc] mt-2">{formatDate(o.created_at)}</p>
                  </div>
                  {hasWA && (
                    <a href={`https://wa.me/${waNumber}?text=Hola%2C%20me%20interesa%20la%20oferta%3A%20${encodeURIComponent(o.titulo)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs font-semibold text-white px-4 py-2 rounded-full flex items-center gap-1.5 transition"
                      style={{ background: "#25d366" }}>
                      <WhatsAppIcon /> Postularme
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Botón flotante mobile */}
      {(hasWA || hasIG) && (
        <div className="fixed bottom-6 left-0 right-0 px-6 md:hidden z-40">
          {hasWA ? (
            <a href={`https://wa.me/${waNumber}?text=Hola%20${encodeURIComponent(profile.nombre)}%2C%20te%20contacto%20desde%20Hebra%20%F0%9F%92%88`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-full text-white font-semibold shadow-lg active:scale-95 transition"
              style={{ background: "#25d366", boxShadow: "0 4px 20px rgba(37,211,102,0.4)" }}>
              <WhatsAppIcon /> Contactar por WhatsApp
            </a>
          ) : (
            <a href={`https://instagram.com/${profile.instagram}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-full text-white font-semibold shadow-lg active:scale-95 transition"
              style={{ background: "linear-gradient(135deg,#f09433,#dc2743,#bc1888)" }}>
              <Instagram size={20} /> Escribir por Instagram
            </a>
          )}
        </div>
      )}
    </div>
  );
}
