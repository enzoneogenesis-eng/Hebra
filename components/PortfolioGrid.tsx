"use client";
import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";
import type { Trabajo } from "@/types";

export function PortfolioGrid({ trabajos }: { trabajos: Trabajo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (trabajos.length === 0) return null;

  return (
    <>
      {/* Grid responsivo: 2 col mobile, 3 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {trabajos.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square rounded-2xl overflow-hidden bg-[#f4f4f2] group focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2"
          >
            <Image
              src={t.imagen_url}
              alt={t.descripcion ?? `Trabajo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay con descripción al hover */}
            {t.descripcion && (
              <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.75) 100%)" }}>
                <p className="text-white text-xs font-medium p-3 line-clamp-2">{t.descripcion}</p>
              </div>
            )}
            {/* Ícono lupa */}
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(255,255,255,0.9)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                <path d="M11 8v6M8 11h6"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          trabajos={trabajos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
