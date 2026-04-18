'use client'

import { useState } from 'react'
import { Calendar, Clock, CreditCard, Banknote, ChevronLeft, ChevronRight, Check, Star, MapPin } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracion: number
}

interface ReservarTurnoProps {
  barbero: {
    id: string
    name: string
    city?: string
    avatar_url?: string
    rating?: number
  }
  servicios: Servicio[]
  onClose?: () => void
  onConfirmar?: (turno: any) => void
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function generarDias(): { fecha: Date; label: string; disponible: boolean }[] {
  const dias = []
  const hoy = new Date()
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    dias.push({
      fecha,
      label: i === 0 ? 'Hoy' : i === 1 ? 'Manana' : DIAS_SEMANA[fecha.getDay()],
      disponible: fecha.getDay() !== 0 // no domingo
    })
  }
  return dias
}

function generarHorarios(): string[] {
  const horarios = []
  for (let h = 9; h < 19; h++) {
    horarios.push(`${h.toString().padStart(2, '0')}:00`)
    horarios.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return horarios
}

export function ReservarTurno({ barbero, servicios, onClose, onConfirmar }: ReservarTurnoProps) {
  const [paso, setPaso] = useState(1) // 1=servicio, 2=fecha/hora, 3=pago, 4=confirmado
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null)
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'mercadopago'>('efectivo')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  const dias = generarDias()
  const horarios = generarHorarios()

  // Simular horarios ocupados
  const horariosOcupados = ['10:00', '11:30', '14:00', '16:30']

  async function confirmarTurno() {
    if (!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada) return
    setLoading(true)

    // TODO: Llamar a Supabase para crear el turno
    // TODO: Si metodo es mercadopago, crear preferencia de pago

    await new Promise(r => setTimeout(r, 1500)) // simular
    setLoading(false)
    setPaso(4)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-neutral-900 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-md p-4 border-b border-white/5 flex items-center gap-3 z-10">
          {paso > 1 && paso < 4 && (
            <button onClick={() => setPaso(p => p - 1)} className="text-white/50 hover:text-white">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
              {barbero.avatar_url ? (
                <img src={barbero.avatar_url} alt={barbero.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/30 font-bold">{barbero.name[0]}</span>
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{barbero.name}</h3>
              <div className="flex items-center gap-2">
                {barbero.city && <span className="text-white/40 text-xs">{barbero.city}</span>}
                {barbero.rating && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white/60">{barbero.rating}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-xs">Cerrar</button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-3">
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <div
                key={p}
                className={`h-1 rounded-full flex-1 transition-all ${
                  p <= paso ? 'bg-green-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-white/30 text-[10px] mt-1">
            Paso {Math.min(paso, 3)} de 3 — {paso === 1 ? 'Elegir servicio' : paso === 2 ? 'Fecha y hora' : paso === 3 ? 'Confirmar' : 'Listo'}
          </p>
        </div>

        {/* PASO 1: Elegir servicio */}
        {paso === 1 && (
          <div className="p-4 space-y-2">
            <h4 className="text-white/80 text-sm font-medium mb-3">Elegir servicio</h4>
            {servicios.map(s => (
              <button
                key={s.id}
                onClick={() => { setServicioSeleccionado(s); setPaso(2) }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  servicioSeleccionado?.id === s.id
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/3 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-sm">{s.nombre}</p>
                    {s.descripcion && (
                      <p className="text-white/40 text-xs mt-0.5">{s.descripcion}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-white/30 text-xs">
                        <Clock size={10} /> {s.duracion} min
                      </span>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold text-sm">
                    ${s.precio.toLocaleString('es-AR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: Fecha y hora */}
        {paso === 2 && (
          <div className="p-4 space-y-4">
            {/* Servicio seleccionado mini */}
            <div className="flex items-center justify-between bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
              <span className="text-white/80 text-xs">{servicioSeleccionado?.nombre}</span>
              <span className="text-green-400 text-xs font-bold">
                ${servicioSeleccionado?.precio.toLocaleString('es-AR')}
              </span>
            </div>

            {/* Dias */}
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2">Elegir dia</h4>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {dias.map((d, i) => (
                  <button
                    key={i}
                    disabled={!d.disponible}
                    onClick={() => setFechaSeleccionada(d.fecha)}
                    className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[52px] transition-all ${
                      !d.disponible
                        ? 'opacity-30 cursor-not-allowed'
                        : fechaSeleccionada?.toDateString() === d.fecha.toDateString()
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-medium">{d.label}</span>
                    <span className="text-lg font-bold">{d.fecha.getDate()}</span>
                    <span className="text-[10px]">{MESES[d.fecha.getMonth()].slice(0, 3)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Horarios */}
            {fechaSeleccionada && (
              <div>
                <h4 className="text-white/80 text-sm font-medium mb-2">Elegir horario</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {horarios.map(h => {
                    const ocupado = horariosOcupados.includes(h)
                    const seleccionado = horaSeleccionada === h
                    return (
                      <button
                        key={h}
                        disabled={ocupado}
                        onClick={() => setHoraSeleccionada(h)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          ocupado
                            ? 'bg-white/3 text-white/15 cursor-not-allowed line-through'
                            : seleccionado
                            ? 'bg-green-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Boton siguiente */}
            {horaSeleccionada && (
              <button
                onClick={() => setPaso(3)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* PASO 3: Confirmar y pagar */}
        {paso === 3 && (
          <div className="p-4 space-y-4">
            {/* Resumen */}
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <h4 className="text-white/80 text-sm font-medium">Resumen del turno</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Servicio</span>
                  <span className="text-white">{servicioSeleccionado?.nombre}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Fecha</span>
                  <span className="text-white">
                    {fechaSeleccionada?.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Hora</span>
                  <span className="text-white">{horaSeleccionada} hs</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Duracion</span>
                  <span className="text-white">{servicioSeleccionado?.duracion} minutos</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between">
                  <span className="text-white/60 text-sm font-medium">Total</span>
                  <span className="text-green-400 font-bold text-lg">
                    ${servicioSeleccionado?.precio.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Metodo de pago */}
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2">Metodo de pago</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setMetodoPago('efectivo')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    metodoPago === 'efectivo'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/3 border-white/5'
                  }`}
                >
                  <Banknote size={20} className={metodoPago === 'efectivo' ? 'text-green-400' : 'text-white/30'} />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">Efectivo en el local</p>
                    <p className="text-white/40 text-xs">Pagas cuando llegas al turno</p>
                  </div>
                </button>

                <button
                  onClick={() => setMetodoPago('mercadopago')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    metodoPago === 'mercadopago'
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/3 border-white/5'
                  }`}
                >
                  <CreditCard size={20} className={metodoPago === 'mercadopago' ? 'text-blue-400' : 'text-white/30'} />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">MercadoPago</p>
                    <p className="text-white/40 text-xs">Tarjeta, transferencia o QR</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="text-white/40 text-xs mb-1 block">Notas (opcional)</label>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej: Quiero degradado alto con diseno..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/50 resize-none h-16"
              />
            </div>

            {/* Confirmar */}
            <button
              onClick={confirmarTurno}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Confirmando...</span>
              ) : metodoPago === 'mercadopago' ? (
                <>
                  <CreditCard size={16} /> Pagar con MercadoPago
                </>
              ) : (
                <>
                  <Check size={16} /> Confirmar turno
                </>
              )}
            </button>
          </div>
        )}

        {/* PASO 4: Confirmado */}
        {paso === 4 && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">Turno confirmado</h3>
              <p className="text-white/50 text-sm mt-1">
                {fechaSeleccionada?.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {horaSeleccionada} hs
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-left space-y-1">
              <p className="text-white/60 text-xs">Barbero: <span className="text-white">{barbero.name}</span></p>
              <p className="text-white/60 text-xs">Servicio: <span className="text-white">{servicioSeleccionado?.nombre}</span></p>
              <p className="text-white/60 text-xs">Pago: <span className="text-white">{metodoPago === 'efectivo' ? 'En el local' : 'MercadoPago'}</span></p>
            </div>
            <p className="text-white/30 text-xs">
              Te enviamos la confirmacion por WhatsApp
            </p>
            <button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
