"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import type { Trabajo } from "@/types";

interface Props {
  trabajos: Trabajo[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ trabajos, initialIndex, onClose }: Props) {
  const [index, setIndex]     = useState(initialIndex);
  const [visible, setVisible] = useState(false);
  const touchStartX           = useRef<number | null>(null);
  const touchStartY           = useRef<number | null>(null);

  // Fade in al montar
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Cerrar con fade out
  function close() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  const prev = useCallback(() => setIndex(i => (i - 1 + trabajos.length) % trabajos.length), [trabajos.length]);
  const next = useCallback(() => setIndex(i => (i + 1) % trabajos.length), [trabajos.length]);

  // Teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Solo swipe horizontal (más horizontal que vertical)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  const trabajo = trabajos[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `rgba(0,0,0,${visible ? 0.88 : 0})`,
        transition: "background 200ms ease",
      }}
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Contador */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-1.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
        onClick={e => e.stopPropagation()}
      >
        {index + 1} / {trabajos.length}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={e => { e.stopPropagation(); close(); }}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-90"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      {/* Flecha izquierda */}
      {trabajos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-3 sm:left-6 w-11 h-11 flex items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-90"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      )}

      {/* Imagen */}
      <div
        className="relative w-full h-full flex items-center justify-center px-16 py-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.96)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={trabajo.imagen_url}
            alt={trabajo.descripcion ?? `Foto ${index + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Descripción */}
        {trabajo.descripcion && (
          <div
            className="absolute bottom-0 left-0 right-0 text-center pb-2"
          >
            <span
              className="text-white text-sm px-4 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            >
              {trabajo.descripcion}
            </span>
          </div>
        )}
      </div>

      {/* Flecha derecha */}
      {trabajos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-3 sm:right-6 w-11 h-11 flex items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-90"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      )}

      {/* Dots indicadores (mobile) */}
      {trabajos.length > 1 && trabajos.length <= 12 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5"
          onClick={e => e.stopPropagation()}
        >
          {trabajos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="rounded-full transition-all"
              style={{
                width: i === index ? "20px" : "6px",
                height: "6px",
                background: i === index ? "white" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
