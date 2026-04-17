import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ProfilePreview } from "@/components/ProfilePreview";
import { LandingGallery } from "@/components/LandingGallery";

const PORTFOLIO_FOTOS = [
  { src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop", alt: "Degradé" },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&h=300&fit=crop", alt: "Clásico" },
  { src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&h=300&fit=crop", alt: "Barbería" },
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&h=300&fit=crop", alt: "Barba" },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop", alt: "Fade" },
  { src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop", alt: "Textura" },
];

async function getStats() {
  const [{ count: totalBarberos }, { count: totalTrabajos }, { data: avatares }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("tipo", ["barbero", "salon"]),
    supabase.from("trabajos").select("*",  { count: "exact", head: true }),
    supabase.from("profiles").select("id, foto_url, nombre").in("tipo", ["barbero", "salon"]).limit(6),
  ]);
  return { totalBarberos: totalBarberos ?? 0, totalTrabajos: totalTrabajos ?? 0, avatares: avatares ?? [] };
}

export default async function HomePage() {
  const { totalBarberos, totalTrabajos, avatares } = await getStats();

  return (
    <div style={{ background: "#0a0a0a" }}>

      {/* HERO */}
      <section className="px-4 pt-8 pb-6 md:px-6 md:pt-16 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 border border-[#1e1e1e] bg-[#111] text-[#666] text-xs font-medium px-4 py-2 rounded-full mb-6">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l6 6 6-6M6 21l6-6 6 6"/></svg>
          La red profesional del corte
        </div>
        <h1 className="font-['Bebas_Neue'] text-[58px] sm:text-[80px] md:text-[110px] leading-none tracking-tight text-white mb-4">
          TU PRÓXIMO<br />BARBERO<br />
          <span className="text-[#333]">TE ESPERA.</span>
        </h1>
        <p className="text-[#888] text-base md:text-lg max-w-lg mb-6 leading-relaxed font-light">
          Encontrá los mejores barberos y salones. Mostrá tu trabajo y conectá con clientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/register" className="btn-primary w-full sm:w-auto px-8">Crear perfil gratis</Link>
          <Link href="/search"   className="btn-secondary w-full sm:w-auto px-8">Explorar barberos →</Link>
        </div>
      </section>

      {/* PRUEBA SOCIAL */}
      <section className="px-4 md:px-6 pb-8 max-w-6xl mx-auto">
        <LandingGallery />

        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {avatares.map((p, i) => (
                <div key={p.id} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] overflow-hidden bg-[#1e1e1e] relative flex-shrink-0"
                  style={{ zIndex: avatares.length - i }}>
                  {p.foto_url
                    ? <Image src={p.foto_url} alt={p.nombre} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black bg-[#22c55e]">{p.nombre[0]}</div>
                  }
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{totalBarberos} barberos en Hebra</p>
              <p className="text-[10px] text-[#444]">Sumate gratis</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-['Bebas_Neue'] text-2xl text-[#22c55e]">{totalTrabajos}</p>
            <p className="text-[9px] text-[#444] uppercase tracking-wider">Fotos</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#1e1e1e] bg-[#111]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-3 gap-4">
          {[
            { n: totalBarberos.toString(), label: "Profesionales", green: true },
            { n: totalTrabajos.toString(), label: "Fotos publicadas", green: false },
            { n: "100%",                   label: "Gratis",          green: false },
          ].map((s, i) => (
            <div key={i} className="text-center sm:text-left">
              <p className={`font-['Bebas_Neue'] text-4xl md:text-5xl ${s.green ? "text-[#22c55e]" : "text-white"}`}>{s.n}</p>
              <p className="text-xs text-[#444] font-light mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREVIEW PERFIL */}
      <div className="border-t border-[#1e1e1e]">
        <ProfilePreview />
      </div>

      {/* FEATURES */}
      <section className="border-y border-[#1e1e1e] bg-[#111]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "✂", title: "Portfolio visual",   desc: "Subí fotos de tus cortes y construí tu reputación." },
            { icon: "⊙", title: "Buscador por zona",  desc: "Encontrá barberos por ciudad y especialidad." },
            { icon: "▣", title: "Ofertas de trabajo", desc: "Salones buscan barberos. Postulate al instante." },
          ].map((f, i) => (
            <div key={i} className="flex gap-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1e1e1e]">
              <span className="text-[#22c55e] text-xl mt-0.5">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="border border-[#22c55e]/20 bg-[#0a1a0a] rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl text-white leading-tight mb-2">
              ¿SOS BARBERO<br />O TENÉS UN SALÓN?
            </h2>
            <p className="text-[#555] text-sm leading-relaxed">
              Creá tu perfil y hacete encontrar por miles de clientes.
            </p>
          </div>
          <Link href="/register" className="btn-primary px-8 w-full md:w-auto whitespace-nowrap">
            Empezar ahora →
          </Link>
        </div>
      </section>
    </div>
  );
}
