"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MessageSquare, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { labelEstado, colorEstado, formatearFechaLarga } from "@/lib/turnos";
import type { Turno, Profile } from "@/types";

type TurnoConBarbero = Turno & { barbero?: Profile };
type Filtro = "proximos" | "historial";

function formatearHora(h: string) {
  // "10:30:00" -> "10:30"
  return h?.slice(0, 5) ?? h;
}

export function MisTurnosCliente({ profile }: { profile: Profile }) {
  const [turnos, setTurnos]   = useState<TurnoConBarbero[]>([]);
  const [filtro, setFiltro]   = useState<Filtro>("proximos");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTurnos(); }, []);

  async function loadTurnos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("turnos")
      .select("*, barbero:profiles!turnos_barbero_id_fkey(id, nombre, foto_url, tipo)")
      .eq("cliente_id", profile.id)
      .order("fecha", { ascending: true })
      .order("hora",  { ascending: true });

    if (error) { console.error("[MisTurnosCliente] load:", error); setLoading(false); return; }
    setTurnos((data ?? []) as TurnoConBarbero[]);
    setLoading(false);
  }

  async function cancelar(id: string) {
    if (!confirm("¿Seguro que querés cancelar este turno?")) return;
    const { error } = await supabase
      .from("turnos")
      .update({ estado: "cancelado", actualizado_en: new Date().toISOString() })
      .eq("id", id);
    if (error) { alert("No se pudo cancelar: " + error.message); return; }
    loadTurnos();
  }

  const ahora = new Date();
  function esFuturo(t: Turno) {
    const dt = new Date(`${t.fecha}T${t.hora}`);
    return dt.getTime() >= ahora.getTime();
  }

  const proximos = turnos
    .filter(t => (t.estado === "pendiente" || t.estado === "confirmado") && esFuturo(t));
  const historial = turnos
    .filter(t => !(proximos.includes(t)))
    .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));

  const visibles = filtro === "proximos" ? proximos : historial;

  const tabs: { id: Filtro; label: string; count: number }[] = [
    { id: "proximos",  label: "Próximos",  count: proximos.length  },
    { id: "historial", label: "Historial", count: historial.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-[#2a2a2a]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFiltro(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              filtro === t.id
                ? "border-white text-white"
                : "border-transparent text-[#888] hover:text-[#ccc]"
            }`}
          >
            {t.label} <span className="ml-1 text-xs text-[#666]">({t.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#888] py-8 text-center">Cargando turnos...</p>
      ) : visibles.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-[#888] text-sm">
            {filtro === "proximos"
              ? "No tenés turnos próximos."
              : "Todavía no tenés turnos pasados."}
          </p>
          {filtro === "proximos" && (
            <Link
              href="/search"
              className="inline-block bg-[#00d26a] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#00b85c]"
            >
              Reservar con un barbero
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visibles.map(t => {
            const puedeCancelar =
              (t.estado === "pendiente" || t.estado === "confirmado") && esFuturo(t);
            return (
              <li key={t.id} className="border border-[#2a2a2a] rounded-xl p-4 bg-[#141414]">
                <div className="flex items-start gap-3">
                  {t.barbero?.foto_url ? (
                    <Image
                      src={t.barbero.foto_url}
                      alt={t.barbero.nombre ?? ""}
                      width={44}
                      height={44}
                      className="rounded-full object-cover w-11 h-11"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#2a2a2a]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {t.barbero ? (
                        <Link
                          href={`/profile/${t.barbero.id}`}
                          className="font-semibold text-sm text-white hover:underline truncate"
                        >
                          {t.barbero.nombre}
                        </Link>
                      ) : (
                        <span className="font-semibold text-sm text-[#888]">Barbero</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${colorEstado(t.estado)}`}>
                        {labelEstado(t.estado)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#aaa]">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {formatearFechaLarga(t.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {formatearHora(t.hora)} · {t.duracion_min} min
                      </span>
                    </div>
                    {t.mensaje && (
                      <p className="mt-2 text-xs text-[#aaa] flex items-start gap-1">
                        <MessageSquare size={13} className="mt-0.5 shrink-0" />
                        <span className="break-words">{t.mensaje}</span>
                      </p>
                    )}
                    {puedeCancelar && (
                      <div className="mt-3">
                        <button
                          onClick={() => cancelar(t.id)}
                          className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300"
                        >
                          <X size={13} /> Cancelar turno
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}