"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Check, X, MessageCircle, Clock, User } from "lucide-react";
import type { Profile, Turno } from "@/types";
import { formatearFechaLarga, labelEstado, colorEstado } from "@/lib/turnos";

type Filtro = "pendiente" | "confirmado" | "pasados";

export function TurnosBarbero({ profile }: { profile: Profile }) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("pendiente");
  const [accionando, setAccionando] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("turnos")
      .select("*, cliente:profiles!turnos_cliente_id_fkey(id, nombre, foto_url, tipo)")
      .eq("barbero_id", profile.id)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (!error && data) {
      setTurnos(data as any);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [profile.id]);

  async function cambiarEstado(id: string, nuevoEstado: string) {
    setAccionando(id);
    const { error } = await supabase
      .from("turnos")
      .update({ estado: nuevoEstado, actualizado_en: new Date().toISOString() })
      .eq("id", id);
    setAccionando(null);
    if (!error) load();
  }

  // Filtrar
  const hoyStr = new Date().toISOString().substring(0, 10);
  const filtrados = turnos.filter(t => {
    if (filtro === "pendiente") return t.estado === "pendiente";
    if (filtro === "confirmado") return t.estado === "confirmado" && t.fecha >= hoyStr;
    if (filtro === "pasados") return t.fecha < hoyStr || ["rechazado", "cancelado", "completado"].includes(t.estado);
    return true;
  });

  const countPendientes = turnos.filter(t => t.estado === "pendiente").length;

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl p-8 text-center text-[#666]">
        Cargando turnos...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFiltro("pendiente")}
          className={`relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
            filtro === "pendiente" ? "bg-[#1ed760] text-black" : "bg-[#222] text-[#888]"
          }`}
        >
          Pendientes
          {countPendientes > 0 && filtro !== "pendiente" && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {countPendientes}
            </span>
          )}
        </button>
        <button
          onClick={() => setFiltro("confirmado")}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
            filtro === "confirmado" ? "bg-[#1ed760] text-black" : "bg-[#222] text-[#888]"
          }`}
        >
          Confirmados
        </button>
        <button
          onClick={() => setFiltro("pasados")}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
            filtro === "pasados" ? "bg-[#1ed760] text-black" : "bg-[#222] text-[#888]"
          }`}
        >
          Historial
        </button>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-[#111] rounded-2xl p-8 text-center text-[#666]">
          {filtro === "pendiente" && "No tenes turnos pendientes"}
          {filtro === "confirmado" && "No tenes turnos confirmados proximos"}
          {filtro === "pasados" && "Aun no hay historial de turnos"}
        </div>
      ) : (
        filtrados.map(t => {
          const cliente = (t as any).cliente as Profile | undefined;
          const colors = colorEstado(t.estado);
          const esPasado = t.fecha < hoyStr;

          return (
            <div key={t.id} className="bg-[#111] rounded-2xl p-5">
              {/* Header: cliente + estado */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#222] flex-shrink-0">
                  {cliente?.foto_url ? (
                    <Image src={cliente.foto_url} alt={cliente.nombre} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-[#444]" size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {cliente ? (
                    <Link href={`/profile/${cliente.id}`} className="text-white font-semibold hover:text-[#1ed760] transition block truncate">
                      {cliente.nombre}
                    </Link>
                  ) : (
                    <div className="text-white font-semibold truncate">Cliente</div>
                  )}
                  <div className="text-[#888] text-xs capitalize">{cliente?.tipo ?? ""}</div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {labelEstado(t.estado)}
                </span>
              </div>

              {/* Fecha y hora */}
              <div className="flex items-center gap-2 text-[#ccc] text-sm mb-3">
                <Clock size={14} className="text-[#666]" />
                <span>{formatearFechaLarga(t.fecha)} a las {t.hora.substring(0, 5)}</span>
              </div>

              {/* Mensaje */}
              {t.mensaje && (
                <div className="flex gap-2 p-3 bg-[#0a0a0a] rounded-xl mb-3">
                  <MessageCircle size={14} className="text-[#666] flex-shrink-0 mt-0.5" />
                  <p className="text-[#ccc] text-sm italic">{t.mensaje}</p>
                </div>
              )}

              {/* Acciones */}
              {t.estado === "pendiente" && !esPasado && (
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarEstado(t.id, "confirmado")}
                    disabled={accionando === t.id}
                    className="flex-1 flex items-center justify-center gap-1 bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-semibold py-2 rounded-xl transition disabled:opacity-50"
                  >
                    <Check size={16} />
                    Confirmar
                  </button>
                  <button
                    onClick={() => cambiarEstado(t.id, "rechazado")}
                    disabled={accionando === t.id}
                    className="flex-1 flex items-center justify-center gap-1 bg-[#222] hover:bg-[#2a2a2a] text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
                  >
                    <X size={16} />
                    Rechazar
                  </button>
                </div>
              )}

              {t.estado === "confirmado" && esPasado && (
                <button
                  onClick={() => cambiarEstado(t.id, "completado")}
                  disabled={accionando === t.id}
                  className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-semibold py-2 rounded-xl transition disabled:opacity-50"
                >
                  Marcar como completado
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}