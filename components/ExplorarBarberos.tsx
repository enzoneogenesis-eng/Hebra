'use client'

import { useState, useEffect } from 'react'
import { MapPin, Star, Clock, Search, SlidersHorizontal, ChevronRight, Zap, Filter, X } from 'lucide-react'

// Types
interface Barbero {
  id: string
  name: string
  city: string
  avatar_url?: string
  bio?: string
  skills?: string[]
  rating: number
  total_resenas: number
  turnos_mes: number
  precio_desde?: number
  distancia?: string
  disponible_hoy?: boolean
  servicios?: Servicio[]
}

interface Servicio {
  id: string
  nombre: string
  precio: number
  duracion: number
}

interface Filtros {
  zona: string
  especialidad: string
  precioMax: number
  soloDisponibles: boolean
  ordenar: 'rating' | 'precio' | 'cercania' | 'popular'
}

// Zonas de Argentina
const ZONAS = [
  'Todas', 'CABA', 'Palermo', 'Belgrano', 'Recoleta', 'Caballito',
  'La Plata', 'Rosario', 'Cordoba', 'Mendoza', 'Tucuman',
  'Mar del Plata', 'Quilmes', 'Lomas de Zamora', 'San Isidro'
]

const ESPECIALIDADES = [
  'Todas', 'Degradado', 'Barba', 'Coloracion', 'Mechas',
  'Diseno', 'Corte clasico', 'Alisado', 'Trenzas'
]

// Estrellas component
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
        />
      ))}
    </div>
  )
}

// Card de barbero estilo PedidosYa
function BarberoCard({ barbero, onReservar }: { barbero: Barbero; onReservar: (b: Barbero) => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all duration-300 group cursor-pointer"
         onClick={() => onReservar(barbero)}>
      {/* Header con foto y badge */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center">
          {barbero.avatar_url ? (
            <img src={barbero.avatar_url} alt={barbero.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-white/20">{barbero.name[0]}</span>
          )}
        </div>
        {barbero.disponible_hoy && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap size={10} /> DISPONIBLE HOY
          </span>
        )}
        {barbero.rating >= 4.5 && (
          <span className="absolute top-3 left-3 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            TOP
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-white font-bold text-sm group-hover:text-green-400 transition-colors">
            {barbero.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-bold">{barbero.rating || '-'}</span>
            <span className="text-white/40 text-xs">({barbero.total_resenas})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-white/40" />
          <span className="text-white/50 text-xs">{barbero.city}</span>
          {barbero.distancia && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-white/40 text-xs">{barbero.distancia}</span>
            </>
          )}
        </div>

        {/* Skills */}
        {barbero.skills && barbero.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {barbero.skills.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/60">{s}</span>
            ))}
          </div>
        )}

        {/* Footer: precio + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <span className="text-white/40 text-[10px]">desde</span>
            <span className="text-green-400 font-bold text-sm ml-1">
              ${barbero.precio_desde?.toLocaleString('es-AR') || '3.500'}
            </span>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            Reservar <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente principal
export function ExplorarBarberos() {
  const [filtros, setFiltros] = useState<Filtros>({
    zona: 'Todas',
    especialidad: 'Todas',
    precioMax: 20000,
    soloDisponibles: false,
    ordenar: 'rating'
  })
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Fetch real de Supabase
  useEffect(() => {
    // Simular carga
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header sticky */}
      <div className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Zona selector */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            <MapPin size={14} className="text-green-400 flex-shrink-0" />
            {ZONAS.slice(0, 8).map(zona => (
              <button
                key={zona}
                onClick={() => setFiltros(f => ({ ...f, zona }))}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filtros.zona === zona
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {zona}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Buscar barbero, servicio o zona..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-green-500/50"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`p-2.5 rounded-xl border transition-all ${
                mostrarFiltros
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Filtros expandidos */}
          {mostrarFiltros && (
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm font-medium">Filtros</span>
                <button onClick={() => setMostrarFiltros(false)}>
                  <X size={16} className="text-white/40" />
                </button>
              </div>

              {/* Especialidad */}
              <div>
                <label className="text-white/40 text-xs mb-1 block">Especialidad</label>
                <div className="flex flex-wrap gap-1">
                  {ESPECIALIDADES.map(esp => (
                    <button
                      key={esp}
                      onClick={() => setFiltros(f => ({ ...f, especialidad: esp }))}
                      className={`px-2 py-1 rounded text-[11px] transition-all ${
                        filtros.especialidad === esp
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-white/50 border border-transparent'
                      }`}
                    >
                      {esp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Precio max */}
              <div>
                <label className="text-white/40 text-xs mb-1 block">
                  Precio maximo: ${filtros.precioMax.toLocaleString('es-AR')}
                </label>
                <input
                  type="range"
                  min={2000}
                  max={20000}
                  step={500}
                  value={filtros.precioMax}
                  onChange={e => setFiltros(f => ({ ...f, precioMax: +e.target.value }))}
                  className="w-full accent-green-500"
                />
              </div>

              {/* Solo disponibles */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.soloDisponibles}
                  onChange={e => setFiltros(f => ({ ...f, soloDisponibles: e.target.checked }))}
                  className="rounded accent-green-500"
                />
                <span className="text-white/60 text-xs">Solo disponibles hoy</span>
              </label>

              {/* Ordenar */}
              <div>
                <label className="text-white/40 text-xs mb-1 block">Ordenar por</label>
                <div className="flex gap-1">
                  {[
                    { key: 'rating', label: 'Mejor valorados' },
                    { key: 'precio', label: 'Precio' },
                    { key: 'popular', label: 'Mas popular' },
                    { key: 'cercania', label: 'Cercania' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setFiltros(f => ({ ...f, ordenar: opt.key as Filtros['ordenar'] }))}
                      className={`px-2 py-1 rounded text-[11px] transition-all ${
                        filtros.ordenar === opt.key
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 text-white/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/40 text-sm">
            {barberos.length} barberos en <span className="text-white/70">{filtros.zona}</span>
          </p>
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <Clock size={12} />
            <span>Turnos disponibles hoy</span>
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {barberos.map(b => (
            <BarberoCard
              key={b.id}
              barbero={b}
              onReservar={() => {}}
            />
          ))}
        </div>

        {barberos.length === 0 && !loading && (
          <div className="text-center py-20">
            <Search size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No se encontraron barberos</p>
            <p className="text-white/20 text-xs mt-1">Proba cambiando los filtros o la zona</p>
          </div>
        )}
      </div>
    </div>
  )
}
