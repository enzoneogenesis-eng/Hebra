"use client";
import { useState, useEffect } from "react";

const BARBEROS = [
  {
    nombre: "Matías Rodríguez",
    tipo: "Barbero",
    ciudad: "Palermo, CABA",
    bio: "Especialista en degradé y diseño de barba. 8 años de experiencia.",
    instagram: "mati.cuts.bsas",
    skills: ["Degradé", "Barba", "Clásico", "Navaja"],
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
    trabajos: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
    ],
  },
  {
    nombre: "Studio Navajas",
    tipo: "Salón",
    ciudad: "Recoleta, CABA",
    bio: "Barbería boutique premium. Experiencia de alto nivel desde el primer minuto.",
    instagram: "studionavajas.bsas",
    skills: ["Navaja", "Keratina", "Barba completa", "Clásico"],
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    trabajos: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop",
    ],
  },
  {
    nombre: "Andrés Torres",
    tipo: "Barbero",
    ciudad: "Rosario, Santa Fe",
    bio: "Especialista en coloración masculina. Mechas, balayage y color fantasía.",
    instagram: "andres.color.barber",
    skills: ["Mechas", "Balayage", "Color fantasía", "Decoloración"],
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    trabajos: [
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop",
    ],
  },
];

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export function ProfilePreview() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const b = BARBEROS[active];

  // Auto-rotate cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive(i => (i + 1) % BARBEROS.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function switchTo(i: number) {
    if (i === active) return;
    setVisible(false);
    setTimeout(() => { setActive(i); setVisible(true); }, 200);
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-2">Así se ve tu perfil</p>
          <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl text-white tracking-wide leading-none">
            LO QUE VAN A VER<br />TUS CLIENTES.
          </h2>
        </div>
        {/* Selector de perfiles */}
        <div className="flex gap-2">
          {BARBEROS.map((bar, i) => (
            <button key={i} onClick={() => switchTo(i)}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                active === i
                  ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                  : "bg-white text-[#999] border-[#e8e8e6] hover:border-[#0a0a0a]"
              }`}>
              {bar.nombre.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Mockup del perfil */}
      <div
        className="bg-[#111] border border-[#1e1e1e] rounded-3xl overflow-hidden transition-all duration-300"
        style={{
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* Barra de browser falsa */}
        <div className="bg-[#0a0a0a] border-b border-[#1e1e1e] px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ddd]" />
            <div className="w-3 h-3 rounded-full bg-[#ddd]" />
            <div className="w-3 h-3 rounded-full bg-[#ddd]" />
          </div>
          <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-xs text-[#444] border border-[#e8e8e6]">
            hebra.app/profile/{b.nombre.toLowerCase().replace(/\s/g, "-").replace(/[áéíóú]/g, c => ({á:"a",é:"e",í:"i",ó:"o",ú:"u"}[c]||c))}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Columna izquierda — info */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Foto + nombre */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f4f4f2] flex-shrink-0 relative">
                    <img src={b.foto} alt={b.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest block mb-1">{b.tipo}</span>
                    <h3 className="font-['Bebas_Neue'] text-3xl text-[#0a0a0a] leading-none mb-1">
                      {b.nombre.toUpperCase()}
                    </h3>
                    <p className="text-xs text-[#aaa] flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      {b.ciudad}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-[#555] leading-relaxed mb-5">{b.bio}</p>

                {/* Skills */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-[#333] uppercase tracking-widest mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.skills.map(s => (
                      <span key={s} className="text-xs font-medium bg-[#1a1a1a] text-[#888] px-3 py-1.5 rounded-full border border-[#222]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-full text-white text-sm font-semibold"
                  style={{ background: "#25d366" }}>
                  <WhatsAppIcon />
                  Contactar por WhatsApp
                </div>
                <div className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full text-[#666] text-sm font-medium border border-[#e8e8e6]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" strokeWidth="0"/>
                  </svg>
                  @{b.instagram}
                </div>
              </div>
            </div>

            {/* Columna derecha — portfolio grid */}
            <div>
              <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Portfolio</p>
              <div className="grid grid-cols-3 gap-2">
                {b.trabajos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#f4f4f2] relative group">
                    <img src={url} alt={`trabajo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#444] mt-3 text-center">{b.trabajos.length} trabajos publicados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-5">
        {BARBEROS.map((_, i) => (
          <button key={i} onClick={() => switchTo(i)}
            className={`rounded-full transition-all duration-300 ${
              active === i ? "bg-[#22c55e] w-6 h-2" : "bg-[#222] w-2 h-2"
            }`}
          />
        ))}
      </div>

      {/* CTA debajo */}
      <div className="text-center mt-8">
        <p className="text-sm text-[#444] mb-4">Tu perfil puede verse exactamente así en minutos.</p>
        <a href="/register"
          className="inline-flex items-center gap-2 bg-[#22c55e] text-black font-bold px-8 py-3.5 rounded-full text-sm hover:bg-[#16a34a] transition">
          Crear mi perfil gratis →
        </a>
      </div>
    </section>
  );
}
