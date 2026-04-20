"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Calendar, Clock, MessageCircle, Check } from "lucide-react";
import type { Profile, Disponibilidad, Turno } from "@/types";
import { generarSlots, filtrarOcupados, proximasFechas, formatearFechaCorta, formatearFechaLarga, fechaToISO } from "@/lib/turnos";

export function ReservarTurnoModal({ barbero, onClose }: { barbero: Profile; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [disp, setDisp] = useState<Disponibilidad | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fechas, setFechas] = useState<Date[]>([]);
  const [fechaSel, setFechaSel] = useState<Date | null>(null);
  const [slotsDia, setSlotsDia] = useState<string[]>([]);
  const [slotSel, setSlotSel] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar disponibilidad y sesion
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id ?? null);

      const { data: d } = await supabase
        .from("disponibilidad")
        .select("*")
        .eq("user_id", barbero.id)
        .maybeSingle();

      if (d) {
        setDisp(d);
        const fechasDisp = proximasFechas(d as Disponibilidad, new Date(), 14);
        setFechas(fechasDisp);
        if (fechasDisp.length > 0) setFechaSel(fechasDisp[0]);
      }
      setLoading(false);
    }
    load();
  }, [barbero.id]);

  // Cuando cambia la fecha, cargar slots libres
  useEffect(() => {
    async function loadSlots() {
      if (!fechaSel || !disp) return;
      setSlotSel(null);
      const fechaISO = fechaToISO(fechaSel);
      const { data: turnos } = await supabase
        .from("turnos")
        .select("hora, estado")
        .eq("barbero_id", barbero.id)
        .eq("fecha", fechaISO);

      const todos = generarSlots(disp, fechaSel);
      const libres = filtrarOcupados(todos, (turnos ?? []) as Turno[]);
      setSlotsDia(libres);
    }
    loadSlots();
  }, [fechaSel, disp, barbero.id]);

  async function confirmar() {
    if (!userId || !fechaSel || !slotSel || !disp) return;
    setEnviando(true);
    setError(null);

    const { error: insertError } = await supabase.from("turnos").insert({
      barbero_id: barbero.id,
      cliente_id: userId,
      fecha: fechaToISO(fechaSel),
      hora: slotSel,
      duracion_min: disp.duracion_min,
      estado: "pendiente",
      mensaje: mensaje.trim() || null,
    });

    setEnviando(false);
    if (insertError) {
      setError("No se pudo reservar: " + insertError.message);
    } else {
      setExito(true);
    }
  }

  // Cierre con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // No logueado
  if (!loading && !userId) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-[#111] rounded-3xl p-8 max-w-sm w-full text-center">
          <h3 className="text-white font-bold text-lg mb-2">Iniciá sesión</h3>
          <p className="text-[#888] text-sm mb-6">Para reservar un turno necesitás tener una cuenta en Hebra.</p>
          <a href="/login" className="block w-full bg-[#1ed760] text-black font-bold py-3 rounded-xl">
            Iniciar sesión
          </a>
        </div>
      </Overlay>
    );
  }

  // Intentando reservar en su propio perfil
  if (!loading && userId === barbero.id) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-[#111] rounded-3xl p-8 max-w-sm w-full text-center">
          <p className="text-white mb-6">No podés reservar un turno en tu propio perfil.</p>
          <button onClick={onClose} className="w-full bg-[#222] text-white font-semibold py-3 rounded-xl">
            Cerrar
          </button>
        </div>
      </Overlay>
    );
  }

  // Barbero sin disponibilidad configurada
  if (!loading && !disp) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-[#111] rounded-3xl p-8 max-w-sm w-full text-center">
          <Calendar className="text-[#444] mx-auto mb-4" size={48} />
          <h3 className="text-white font-bold text-lg mb-2">Sin turnos online</h3>
          <p className="text-[#888] text-sm mb-6">
            {barbero.nombre} todavía no habilitó la reserva de turnos por Hebra. Podés contactarlo por WhatsApp.
          </p>
          <button onClick={onClose} className="w-full bg-[#222] text-white font-semibold py-3 rounded-xl">
            Cerrar
          </button>
        </div>
      </Overlay>
    );
  }

  // Exito
  if (exito) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-[#111] rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#1ed760]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-[#1ed760]" size={32} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Turno solicitado</h3>
          <p className="text-[#888] text-sm mb-2">
            {fechaSel && formatearFechaLarga(fechaSel)} a las {slotSel}
          </p>
          <p className="text-[#666] text-xs mb-6">
            Te avisamos cuando el barbero confirme. Mirá el estado en &quot;Mi panel&quot;.
          </p>
          <button onClick={onClose} className="w-full bg-[#1ed760] text-black font-bold py-3 rounded-xl">
            Listo
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bg-[#111] rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222]">
          <div>
            <h3 className="text-white font-bold text-lg">Reservar turno</h3>
            <p className="text-[#666] text-xs">con {barbero.nombre}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#222] hover:bg-[#2a2a2a] text-white">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#666]">Cargando...</div>
        ) : (
          <div className="overflow-y-auto">
            {/* Selector de fechas */}
            <div className="p-5 border-b border-[#222]">
              <label className="block text-[#888] text-xs uppercase tracking-wider mb-3">
                Elegí un día
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {fechas.map((f, i) => {
                  const iso = fechaToISO(f);
                  const isoSel = fechaSel ? fechaToISO(fechaSel) : "";
                  const activa = iso === isoSel;
                  return (
                    <button
                      key={i}
                      onClick={() => setFechaSel(f)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                        activa ? "bg-[#1ed760] text-black" : "bg-[#222] text-[#aaa]"
                      }`}
                    >
                      {formatearFechaCorta(f)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots */}
            <div className="p-5 border-b border-[#222]">
              <label className="block text-[#888] text-xs uppercase tracking-wider mb-3">
                Elegí un horario
              </label>
              {slotsDia.length === 0 ? (
                <p className="text-[#666] text-sm text-center py-4">
                  No hay horarios libres este día
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slotsDia.map(h => (
                    <button
                      key={h}
                      onClick={() => setSlotSel(h)}
                      className={`py-2 rounded-xl text-sm font-semibold transition ${
                        slotSel === h ? "bg-[#1ed760] text-black" : "bg-[#222] text-[#aaa]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mensaje opcional */}
            {slotSel && (
              <div className="p-5 border-b border-[#222]">
                <label className="block text-[#888] text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MessageCircle size={12} />
                  Mensaje (opcional)
                </label>
                <textarea
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  maxLength={200}
                  placeholder="Ej: corte y barba, vengo de parte de..."
                  className="w-full bg-[#0a0a0a] text-white text-sm p-3 rounded-xl border border-[#222] focus:border-[#1ed760] focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-5 my-3 p-3 bg-red-500/10 text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Resumen y confirmar */}
            {slotSel && fechaSel && (
              <div className="p-5 bg-[#0a0a0a]">
                <div className="flex items-center gap-2 text-[#aaa] text-sm mb-4">
                  <Clock size={14} />
                  <span>{formatearFechaLarga(fechaSel)} a las {slotSel}</span>
                </div>
                <button
                  onClick={confirmar}
                  disabled={enviando}
                  className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-bold py-4 rounded-xl transition disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Solicitar turno"}
                </button>
                <p className="text-[#666] text-xs text-center mt-3">
                  El barbero tiene que confirmar antes de que el turno quede reservado.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}