"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Calendar, Clock, MessageCircle, Check, Store, Scissors, DollarSign } from "lucide-react";
import type { Profile, Disponibilidad, Sucursal, Servicio } from "@/types";
import { generarSlots, filtrarOcupados, proximasFechas, formatearFechaCorta, formatearFechaLarga, fechaToISO } from "@/lib/turnos";

function formatearARS(n: number): string {
  return "$ " + Math.round(n).toLocaleString("es-AR");
}

export function ReservarTurnoModal({ barbero, onClose }: { barbero: Profile; onClose: () => void }) {
  const [loading, setLoading]         = useState(true);
  const [disp, setDisp]               = useState<Disponibilidad | null>(null);
  const [userId, setUserId]           = useState<string | null>(null);

  // Nuevos: sucursales + servicios
  const [sucursales, setSucursales]   = useState<Sucursal[]>([]);
  const [servicios, setServicios]     = useState<Servicio[]>([]);
  const [sucursalSel, setSucursalSel] = useState<string | null>(null);
  const [servicioSel, setServicioSel] = useState<Servicio | null>(null);

  // Existentes
  const [fechas, setFechas]           = useState<Date[]>([]);
  const [fechaSel, setFechaSel]       = useState<Date | null>(null);
  const [slotsDia, setSlotsDia]       = useState<string[]>([]);
  const [slotSel, setSlotSel]         = useState<string | null>(null);
  const [mensaje, setMensaje]         = useState("");
  const [enviando, setEnviando]       = useState(false);
  const [exito, setExito]             = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Cargar sesion + disponibilidad + sucursales + servicios
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id ?? null);

      // Disponibilidad
      const { data: d } = await supabase
        .from("disponibilidad")
        .select("*")
        .eq("user_id", barbero.id)
        .maybeSingle();
      if (d) {
        setDisp(d as Disponibilidad);
        setFechas(proximasFechas(d as Disponibilidad));
      }

      // Sucursales donde el barbero trabaja
      const { data: rels } = await supabase
        .from("sucursales_barberos")
        .select("sucursal:sucursales(*)")
        .eq("barbero_id", barbero.id)
        .eq("activo", true);
      const sucs = (rels ?? [])
        .map((r: any) => r.sucursal)
        .filter((s: Sucursal | null) => s && s.activa);
      setSucursales(sucs as Sucursal[]);
      if (sucs.length === 1) setSucursalSel(sucs[0].id);

      // Servicios: los propios del barbero + los de la marca a la que pertenece cualquiera de sus sucursales
      const marcaIds = Array.from(new Set(sucs.map((s: any) => s.marca_id).filter(Boolean)));
      const orFilters: string[] = [`and(owner_type.eq.barbero,owner_id.eq.${barbero.id})`];
      if (marcaIds.length > 0) {
        orFilters.push(`and(owner_type.eq.marca,owner_id.in.(${marcaIds.join(",")}))`);
      }
      const { data: servs } = await supabase
        .from("servicios")
        .select("*")
        .eq("activo", true)
        .or(orFilters.join(","))
        .order("precio", { ascending: true });
      setServicios((servs ?? []) as Servicio[]);

      setLoading(false);
    }
    load();
  }, [barbero.id]);

  // Cuando cambia fecha, calculamos slots
  useEffect(() => {
    async function loadSlots() {
      if (!fechaSel || !disp) return;
      const fechaISO = fechaToISO(fechaSel);
      const { data: turnosDia } = await supabase
        .from("turnos")
        .select("hora, estado")
        .eq("barbero_id", barbero.id)
        .eq("fecha", fechaISO);

      const duracionSlot = servicioSel?.duracion_min ?? disp.duracion_min;
      const dispAjustada = { ...disp, duracion_min: duracionSlot };
      const todos = generarSlots(dispAjustada, fechaSel);
      const ocupados = (turnosDia ?? [])
        .filter((t: any) => t.estado === "pendiente" || t.estado === "confirmado")
        .map((t: any) => t.hora.slice(0, 5));
      setSlotsDia(filtrarOcupados(todos, ocupados));
      setSlotSel(null);
    }
    loadSlots();
  }, [fechaSel, disp, servicioSel, barbero.id]);

  async function confirmar() {
    if (!userId || !fechaSel || !slotSel || !servicioSel) return;
    setEnviando(true);
    setError(null);

    const { error: insertError } = await supabase.from("turnos").insert({
      barbero_id:  barbero.id,
      cliente_id:  userId,
      sucursal_id: sucursalSel,
      servicio_id: servicioSel.id,
      fecha:       fechaToISO(fechaSel),
      hora:        slotSel,
      duracion_min: servicioSel.duracion_min,
      estado:      "pendiente",
      mensaje:     mensaje.trim() || null,
    });

    setEnviando(false);
    if (insertError) {
      setError("No se pudo reservar: " + insertError.message);
    } else {
      setExito(true);
    }
  }

  // ===== Early returns =====
  if (loading) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8 text-center text-[#888]">Cargando disponibilidad...</div>
      </Overlay>
    );
  }

  if (!userId) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Iniciá sesión</h3>
          <p className="text-[#888] text-sm mb-6">Para reservar un turno necesitás tener una cuenta en Hebra.</p>
          <a href="/login" className="block w-full bg-[#1ed760] text-black font-bold py-3 rounded-xl">
            Iniciar sesión
          </a>
        </div>
      </Overlay>
    );
  }

  if (userId === barbero.id) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8 text-center">
          <h3 className="text-white font-bold text-lg mb-2">No disponible</h3>
          <p className="text-white mb-6">No podés reservar un turno en tu propio perfil.</p>
          <button onClick={onClose} className="w-full bg-[#222] text-white font-semibold py-3 rounded-xl">
            Cerrar
          </button>
        </div>
      </Overlay>
    );
  }

  if (!disp) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Sin turnos online</h3>
          <p className="text-[#888] text-sm mb-6">Este barbero todavía no configuró su agenda online. Contactalo por WhatsApp o sus redes.</p>
          <button onClick={onClose} className="w-full bg-[#222] text-white font-semibold py-3 rounded-xl">Cerrar</button>
        </div>
      </Overlay>
    );
  }

  if (servicios.length === 0) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Sin servicios configurados</h3>
          <p className="text-[#888] text-sm mb-6">Este barbero todavía no tiene servicios publicados. Contactalo directamente.</p>
          <button onClick={onClose} className="w-full bg-[#222] text-white font-semibold py-3 rounded-xl">Cerrar</button>
        </div>
      </Overlay>
    );
  }

  if (exito) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#1ed760]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#1ed760]" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Turno solicitado</h3>
          <p className="text-[#888] text-sm mb-6">El barbero tiene que confirmarlo. Vas a verlo en "Mis turnos".</p>
          <button onClick={onClose} className="w-full bg-[#1ed760] text-black font-bold py-3 rounded-xl">Listo</button>
        </div>
      </Overlay>
    );
  }

  // ===== Render principal =====
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
        <div>
          <h3 className="text-white font-bold text-lg">Reservar turno</h3>
          <p className="text-[#666] text-xs">con {barbero.nombre}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#222] hover:bg-[#2a2a2a] text-white">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto">

        {/* 1) SUCURSAL (solo si hay más de 1) */}
        {sucursales.length > 1 && (
          <div className="p-5 border-b border-[#1a1a1a]">
            <p className="text-[#aaa] text-xs font-semibold mb-3 flex items-center gap-2">
              <Store size={14} /> ELEGÍ LA SUCURSAL
            </p>
            <div className="space-y-2">
              {sucursales.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSucursalSel(s.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    sucursalSel === s.id
                      ? "bg-[#1ed760]/10 border-[#1ed760] text-white"
                      : "bg-[#141414] border-[#2a2a2a] text-[#aaa] hover:border-[#444]"
                  }`}
                >
                  <p className="font-semibold text-sm">{s.nombre}</p>
                  {s.direccion && <p className="text-xs text-[#666] mt-0.5">{s.direccion}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1b) Sucursal única: mostrar como info no interactiva */}
        {sucursales.length === 1 && (
          <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center gap-2 text-[#888] text-xs">
            <Store size={13} /> {sucursales[0].nombre}
          </div>
        )}

        {/* 2) SERVICIO */}
        {(sucursales.length === 0 || sucursalSel) && (
          <div className="p-5 border-b border-[#1a1a1a]">
            <p className="text-[#aaa] text-xs font-semibold mb-3 flex items-center gap-2">
              <Scissors size={14} /> ELEGÍ EL SERVICIO
            </p>
            <div className="space-y-2">
              {servicios.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setServicioSel(s); setSlotSel(null); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    servicioSel?.id === s.id
                      ? "bg-[#1ed760]/10 border-[#1ed760] text-white"
                      : "bg-[#141414] border-[#2a2a2a] text-[#aaa] hover:border-[#444]"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold text-sm">{s.nombre}</p>
                    <p className="text-xs text-[#666] mt-0.5">{s.duracion_min} min</p>
                  </div>
                  <p className="font-bold text-sm flex items-center gap-1">
                    <DollarSign size={13} /> {formatearARS(s.precio).replace("$ ", "")}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3) DIA */}
        {servicioSel && (
          <div className="p-5 border-b border-[#1a1a1a]">
            <p className="text-[#aaa] text-xs font-semibold mb-3 flex items-center gap-2">
              <Calendar size={14} /> ELEGÍ UN DÍA
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {fechas.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setFechaSel(f)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition ${
                    fechaSel?.toDateString() === f.toDateString()
                      ? "bg-[#1ed760] text-black font-semibold"
                      : "bg-[#141414] text-[#aaa] border border-[#2a2a2a]"
                  }`}
                >
                  {formatearFechaCorta(f)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4) HORARIO */}
        {servicioSel && fechaSel && (
          <div className="p-5 border-b border-[#1a1a1a]">
            <p className="text-[#aaa] text-xs font-semibold mb-3 flex items-center gap-2">
              <Clock size={14} /> ELEGÍ UN HORARIO
            </p>
            {slotsDia.length === 0 ? (
              <p className="text-[#666] text-sm text-center py-6">Sin horarios disponibles este día.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slotsDia.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSlotSel(slot)}
                    className={`py-3 rounded-lg text-sm font-medium transition ${
                      slotSel === slot
                        ? "bg-[#1ed760] text-black"
                        : "bg-[#141414] text-[#aaa] border border-[#2a2a2a] hover:border-[#444]"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5) Resumen y confirmar */}
        {slotSel && fechaSel && servicioSel && (
          <div className="p-5 bg-[#0a0a0a]">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-[#aaa]">
                <Calendar size={14} /> {formatearFechaLarga(fechaSel)} a las {slotSel}
              </div>
              <div className="flex items-center gap-2 text-[#aaa]">
                <Scissors size={14} /> {servicioSel.nombre} — {formatearARS(servicioSel.precio)}
              </div>
            </div>

            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Mensaje opcional..."
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-sm text-white placeholder-[#666] mb-4 resize-none"
              rows={2}
            />

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              onClick={confirmar}
              disabled={enviando}
              className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-bold py-4 rounded-xl transition disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Confirmar turno"}
            </button>

            <p className="text-[#666] text-xs mt-3 text-center">
              El barbero tiene que confirmar antes de que el turno quede reservado.
            </p>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ===== Overlay wrapper =====
function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-[#0a0a0a] w-full md:max-w-lg md:rounded-2xl border border-[#1a1a1a] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}