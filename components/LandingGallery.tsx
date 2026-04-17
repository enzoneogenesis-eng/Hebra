"use client";
import { useState } from "react";
import Image from "next/image";

const FOTOS = [
  { src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop", alt: "Degradé" },
  { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop", alt: "Corte clásico" },
  { src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop", alt: "Barbería" },
  { src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop", alt: "Barba" },
  { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop", alt: "Fade" },
  { src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop", alt: "Textura" },
];

export function LandingGallery() {
  const [open, setOpen]   = useState<number | null>(null);
  const [visible, setVis] = useState(false);

  function abrir(i: number) {
    setOpen(i);
    requestAnimationFrame(() => setVis(true));
    document.body.style.overflow = "hidden";
  }

  function cerrar() {
    setVis(false);
    setTimeout(() => {
      setOpen(null);
      document.body.style.overflow = "";
    }, 200);
  }

  function prev() { setOpen(i => ((i ?? 0) - 1 + FOTOS.length) % FOTOS.length); }
  function next() { setOpen(i => ((i ?? 0) + 1) % FOTOS.length); }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 mb-4">
        {FOTOS.map((foto, i) => (
          <button key={i} onClick={() => abrir(i)}
            className="aspect-square rounded-xl overflow-hidden relative bg-[#111] active:scale-95 transition-transform"
            style={{ WebkitTapHighlightColor: "transparent" }}>
            <Image src={foto.src} alt={foto.alt} fill sizes="16vw" className="object-cover hover:opacity-80 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: `rgba(0,0,0,${visible ? 0.92 : 0})`, transition: "background 200ms ease" }}
          onClick={cerrar}
        >
          {/* Contador */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            {open + 1} / {FOTOS.length}
          </div>

          {/* Cerrar */}
          <button onClick={cerrar}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* Flecha izq */}
          <button onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-3 w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Imagen */}
          <div className="relative w-full h-full flex items-center justify-center px-16 py-16"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.95)", transition: "opacity 200ms ease, transform 200ms ease" }}
            onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-full max-w-2xl mx-auto">
              <Image src={FOTOS[open].src} alt={FOTOS[open].alt} fill className="object-contain" priority />
            </div>
          </div>

          {/* Flecha der */}
          <button onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-3 w-11 h-11 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5" onClick={e => e.stopPropagation()}>
            {FOTOS.map((_, i) => (
              <button key={i} onClick={() => setOpen(i)}
                className="rounded-full transition-all"
                style={{ width: i === open ? "20px" : "6px", height: "6px", background: i === open ? "#22c55e" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
