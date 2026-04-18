"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ResenasSection } from "./ResenasSection"

interface Props {
  barberoId: string
  barberoNombre: string
}

export function ResenasDashboard({ barberoId, barberoNombre }: Props) {
  const [resenas, setResenas] = useState<any[]>([])
  const [promedio, setPromedio] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function cargar() {
      try {
        const { data: resData, error } = await supabase
          .from("resenas")
          .select("id, calificacion, comentario, created_at, cliente_id")
          .eq("barbero_id", barberoId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error cargando resenas:", error)
          if (!cancel) setLoading(false)
          return
        }

        if (!resData || resData.length === 0) {
          if (!cancel) setLoading(false)
          return
        }

        const clienteIds = Array.from(new Set(resData.map((r: any) => r.cliente_id).filter(Boolean)))
        let perfiles: Record<string, { nombre?: string; foto_url?: string }> = {}

        if (clienteIds.length > 0) {
          const { data: profData } = await supabase
            .from("profiles")
            .select("id, nombre, foto_url")
            .in("id", clienteIds)
          if (profData) {
            perfiles = Object.fromEntries(profData.map((p: any) => [p.id, p]))
          }
        }

        const mapped = resData.map((r: any) => ({
          id: r.id,
          cliente_nombre: perfiles[r.cliente_id]?.nombre ?? "Cliente",
          cliente_avatar: perfiles[r.cliente_id]?.foto_url ?? null,
          calificacion: r.calificacion,
          comentario: r.comentario ?? "",
          fecha: r.created_at,
          verificada: true,
        }))

        const avg = mapped.reduce((a: number, r: any) => a + r.calificacion, 0) / mapped.length

        if (!cancel) {
          setResenas(mapped)
          setPromedio(Math.round(avg * 10) / 10)
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        if (!cancel) setLoading(false)
      }
    }
    cargar()
    return () => { cancel = true }
  }, [barberoId])

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[0,1,2].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
    )
  }

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
