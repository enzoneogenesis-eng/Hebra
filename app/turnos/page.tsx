"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ReservarTurno } from "@/components/ReservarTurno"

function TurnosContent() {
  const params = useSearchParams()
  const barberoId = params.get("barbero")
  const [barbero, setBarbero] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    async function cargar() {
      if (!barberoId) {
        if (!cancel) {
          setError("Seleccioná un barbero primero.")
          setLoading(false)
        }
        return
      }
      try {
        const [bRes, sRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", barberoId).single(),
          supabase.from("servicios").select("*").eq("barbero_id", barberoId).eq("activo", true),
        ])
        if (cancel) return
        if (bRes.error || !bRes.data) {
          setError("Barbero no encontrado.")
        } else {
          setBarbero(bRes.data)
          setServicios(sRes.data ?? [])
        }
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Error cargando datos")
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    cargar()
    return () => { cancel = true }
  }, [barberoId])

  if (loading) {
    return <div className="p-8 text-white/60">Cargando...</div>
  }
  if (error || !barbero) {
    return <div className="p-8 text-white">{error ?? "No se pudo cargar el barbero."}</div>
  }

  return <ReservarTurno barbero={barbero} servicios={servicios} />
}

export default function TurnosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/60">Cargando...</div>}>
      <TurnosContent />
    </Suspense>
  )
}
