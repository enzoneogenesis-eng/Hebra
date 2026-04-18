'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ResenasSection } from './ResenasSection'

export function ResenasDashboard({ barberoId, barberoNombre }: { barberoId: string; barberoNombre: string }) {
  const [resenas, setResenas] = useState<any[]>([])
  const [promedio, setPromedio] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('resenas')
        .select('id, calificacion, comentario, created_at, profiles(nombre, foto_url)')
        .eq('barbero_id', barberoId)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          cliente_nombre: r.profiles?.nombre ?? 'Cliente',
          cliente_avatar: r.profiles?.foto_url ?? null,
          calificacion: r.calificacion,
          comentario: r.comentario ?? '',
          fecha: r.created_at,
          verificada: true,
        }))
        const avg = mapped.reduce((a, r) => a + r.calificacion, 0) / mapped.length
        setResenas(mapped)
        setPromedio(Math.round(avg * 10) / 10)
      }
      setLoading(false)
    }
    cargar()
  }, [barberoId])

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_,i) => <div key={i} className="h-20 bg-white/5 rounded-xl"/>)}
    </div>
  )

  return (
    <ResenasSection
      barberoId={barberoId}
      barberoNombre={barberoNombre}
      resenas={resenas}
      promedio={promedio}
      total={resenas.length}
      puedeResenar={false}
    />
  )
}
