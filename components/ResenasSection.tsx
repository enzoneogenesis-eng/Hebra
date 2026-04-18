'use client'

import { useState } from 'react'
import { Star, Send, ThumbsUp, CheckCircle } from 'lucide-react'

interface Resena {
  id: string
  cliente_nombre: string
  cliente_avatar?: string
  calificacion: number
  comentario: string
  servicio?: string
  fecha: string
  verificada: boolean
}

interface ResenasSectionProps {
  barberoId: string
  barberoNombre: string
  resenas: Resena[]
  promedio: number
  total: number
  puedeResenar: boolean
  onEnviarResena?: (calificacion: number, comentario: string) => void
}

function Stars({ rating, size = 16, interactive = false, onChange }: {
  rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            className={`transition-colors ${
              i <= (hover || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-white/15'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBreakdown({ resenas }: { resenas: Resena[] }) {
  const total = resenas.length || 1
  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map(stars => {
        const count = resenas.filter(r => r.calificacion === stars).length
        const pct = (count / total) * 100
        return (
          <div key={stars} className="flex items-center gap-2">
            <span className="text-white/40 text-xs w-3">{stars}</span>
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-white/30 text-xs w-6 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ResenasSection({ barberoId, barberoNombre, resenas, promedio, total, puedeResenar, onEnviarResena }: ResenasSectionProps) {
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)

  async function enviar() {
    if (calificacion === 0) return
    setEnviando(true)
    onEnviarResena?.(calificacion, comentario)
    await new Promise(r => setTimeout(r, 1000))
    setEnviando(false)
    setEnviada(true)
  }

  return (
    <div className="space-y-4">
      {/* Header con promedio */}
      <div className="flex items-start gap-6">
        <div className="text-center">
          <p className="text-white text-4xl font-bold">{promedio || '-'}</p>
          <Stars rating={promedio} size={14} />
          <p className="text-white/30 text-xs mt-1">{total} resenas</p>
        </div>
        <div className="flex-1">
          <RatingBreakdown resenas={resenas} />
        </div>
      </div>

      {/* Formulario de resena */}
      {puedeResenar && !enviada && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-white/80 text-sm font-medium">Tu experiencia con {barberoNombre}</p>
          <Stars rating={calificacion} size={28} interactive onChange={setCalificacion} />
          {calificacion > 0 && (
            <>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Conta como fue tu experiencia..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/50 resize-none h-20"
              />
              <button
                onClick={enviar}
                disabled={enviando}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Send size={14} />
                {enviando ? 'Enviando...' : 'Enviar resena'}
              </button>
            </>
          )}
        </div>
      )}

      {enviada && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
          <p className="text-white/80 text-sm">Gracias por tu resena</p>
        </div>
      )}

      {/* Lista de resenas */}
      <div className="space-y-3">
        {resenas.map(r => (
          <div key={r.id} className="bg-white/3 border border-white/5 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {r.cliente_avatar ? (
                  <img src={r.cliente_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white/30 text-xs font-bold">{r.cliente_nombre[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{r.cliente_nombre}</span>
                  {r.verificada && (
                    <span className="flex items-center gap-0.5 text-green-400 text-[10px]">
                      <CheckCircle size={10} /> Verificada
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars rating={r.calificacion} size={11} />
                  <span className="text-white/20 text-[10px]">{r.fecha}</span>
                </div>
                {r.servicio && (
                  <span className="text-white/30 text-[10px]">Servicio: {r.servicio}</span>
                )}
                <p className="text-white/60 text-sm mt-1.5">{r.comentario}</p>
              </div>
            </div>
          </div>
        ))}

        {resenas.length === 0 && (
          <div className="text-center py-8">
            <Star size={32} className="text-white/10 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Todavia no hay resenas</p>
            <p className="text-white/15 text-xs">Se la primera persona en dejar una</p>
          </div>
        )}
      </div>
    </div>
  )
}
