'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, TrendingUp, Users, Scissors, CreditCard, Banknote, Download } from 'lucide-react'

type Periodo = 'hoy' | 'semana' | 'mes'
interface DiaData { fecha: string; ingreso: number; turnos: number }
interface ServicioData { nombre: string; cantidad: number; ingreso: number }
interface FinanzasData {
  ingreso_total: number; turnos_completados: number; clientes_unicos: number
  metodo_efectivo: number; metodo_mp: number; metodo_transferencia: number
  por_dia: DiaData[]; por_servicio: ServicioData[]; servicio_top: string
}

function getDesde(periodo: Periodo): string {
  const d = new Date()
  if (periodo === 'hoy') { d.setHours(0,0,0,0); return d.toISOString() }
  if (periodo === 'semana') { d.setDate(d.getDate()-7); return d.toISOString() }
  d.setDate(1); d.setHours(0,0,0,0); return d.toISOString()
}

export function DashboardFinanzas() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [data, setData] = useState<FinanzasData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: turnos } = await supabase
        .from('turnos')
        .select('precio, metodo_pago, cliente_id, fecha, servicios(nombre)')
        .eq('barbero_id', user.id)
        .eq('estado', 'completado')
        .gte('created_at', getDesde(periodo))
      if (!turnos || turnos.length === 0) { setData(null); setLoading(false); return }
      const ingreso_total = turnos.reduce((a,t) => a+(t.precio??0), 0)
      const metodo_efectivo = turnos.filter(t=>t.metodo_pago==='efectivo').reduce((a,t)=>a+(t.precio??0),0)
      const metodo_mp = turnos.filter(t=>t.metodo_pago==='mercadopago').reduce((a,t)=>a+(t.precio??0),0)
      const metodo_transferencia = turnos.filter(t=>t.metodo_pago==='transferencia').reduce((a,t)=>a+(t.precio??0),0)
      const clientes_unicos = new Set(turnos.map(t=>t.cliente_id).filter(Boolean)).size
      const porDia: Record<string,DiaData> = {}
      turnos.forEach(t => {
        const dia = new Date(t.fecha).toLocaleDateString('es-AR',{weekday:'short'})
        if (!porDia[dia]) porDia[dia]={fecha:dia,ingreso:0,turnos:0}
        porDia[dia].ingreso += t.precio??0
        porDia[dia].turnos += 1
      })
      const porServ: Record<string,ServicioData> = {}
      turnos.forEach(t => {
        const nombre = (t.servicios as any)?.nombre ?? 'Sin servicio'
        if (!porServ[nombre]) porServ[nombre]={nombre,cantidad:0,ingreso:0}
        porServ[nombre].cantidad++
        porServ[nombre].ingreso += t.precio??0
      })
      const por_servicio = Object.values(porServ).sort((a,b)=>b.ingreso-a.ingreso)
      setData({
        ingreso_total, turnos_completados: turnos.length, clientes_unicos,
        metodo_efectivo, metodo_mp, metodo_transferencia,
        por_dia: Object.values(porDia), por_servicio,
        servicio_top: por_servicio[0]?.nombre ?? '--'
      })
      setLoading(false)
    }
    cargar()
  }, [periodo])

  const total = (data?.metodo_efectivo??0)+(data?.metodo_mp??0)+(data?.metodo_transferencia??0)
  const pct = (m: number) => total > 0 ? Math.round((m/total)*100) : 0

  const exportarCSV = () => {
    if (!data) return
    const fecha = new Date().toISOString().slice(0,10)
    const nombre = 'hebra-finanzas-' + periodo + '-' + fecha + '.csv'
    const filas = [
      ['Servicio','Cantidad','Ingreso'],
      ...data.por_servicio.map(s => [s.nombre, String(s.cantidad), String(s.ingreso)]),
      [],
      ['Metodo','Monto'],
      ['Efectivo', String(data.metodo_efectivo)],
      ['MercadoPago', String(data.metodo_mp)],
      ['Transferencia', String(data.metodo_transferencia)],
    ]
    const blob = new Blob([filas.map(f=>f.join(',')).join('\n')], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_,i) => <div key={i} className="h-20 bg-white/5 rounded-xl"/>)}
    </div>
  )

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl">✂️</div>
      <h3 className="text-white font-bold text-lg">Sin ingresos aun</h3>
      <p className="text-white/40 text-sm max-w-xs">Completa tu primer turno para ver tu resumen financiero.</p>
    </div>
  )

  const maxIngreso = Math.max(...data.por_dia.map(d=>d.ingreso), 1)
  const promedio = data.turnos_completados > 0 ? Math.round(data.ingreso_total/data.turnos_completados) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Finanzas</h2>
          <p className="text-white/40 text-sm">Tu resumen financiero</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {(['hoy','semana','mes'] as Periodo[]).map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${periodo===p ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white/80'}`}>
              {p==='hoy' ? 'Hoy' : p==='semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-green-500/0 border border-green-500/20 rounded-2xl p-6">
        <p className="text-white/50 text-sm">
          {periodo==='hoy' ? 'Ingreso de hoy' : periodo==='semana' ? 'Ingreso esta semana' : 'Ingreso este mes'}
        </p>
        <p className="text-white text-4xl font-bold mt-1">${data.ingreso_total.toLocaleString('es-AR')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {icon:Scissors, label:'Turnos', value:String(data.turnos_completados), c:'text-green-400 bg-green-500/10'},
          {icon:Users, label:'Clientes unicos', value:String(data.clientes_unicos), c:'text-blue-400 bg-blue-500/10'},
          {icon:TrendingUp, label:'Servicio top', value:data.servicio_top, c:'text-amber-400 bg-amber-500/10'},
          {icon:DollarSign, label:'Promedio turno', value:'$'+promedio.toLocaleString('es-AR'), c:'text-purple-400 bg-purple-500/10'},
        ].map(({icon:Icon,label,value,c}) => (
          <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${c} flex items-center justify-center mb-2`}><Icon size={16}/></div>
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {data.por_dia.length > 0 && (
        <div className="bg-white/3 border border-white/5 rounded-xl p-4">
          <h3 className="text-white/80 text-sm font-medium mb-4">Ingresos por dia</h3>
          <div className="flex items-end gap-2 h-32">
            {data.por_dia.map((d,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-white/30 text-[10px]">${(d.ingreso/1000).toFixed(0)}k</span>
                <div className="w-full bg-green-500/60 rounded-t-md hover:bg-green-500 transition-colors"
                  style={{height:`${(d.ingreso/maxIngreso)*80}%`, minHeight:'4px'}}/>
                <span className="text-white/40 text-[10px]">{d.fecha}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/3 border border-white/5 rounded-xl p-4">
        <h3 className="text-white/80 text-sm font-medium mb-3">Metodos de pago</h3>
        <div className="space-y-2">
          {[
            {icon:Banknote, label:'Efectivo', monto:data.metodo_efectivo, color:'bg-green-500'},
            {icon:CreditCard, label:'MercadoPago', monto:data.metodo_mp, color:'bg-blue-500'},
            {icon:DollarSign, label:'Transferencia', monto:data.metodo_transferencia, color:'bg-purple-500'},
          ].map(m => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <m.icon size={14} className="text-white/40"/>
                  <span className="text-white/70 text-xs">{m.label}</span>
                </div>
                <span className="text-white text-xs font-medium">${m.monto.toLocaleString('es-AR')} ({pct(m.monto)}%)</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{width:`${pct(m.monto)}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={exportarCSV}
        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 py-3 rounded-xl transition-colors text-sm">
        <Download size={16}/>Exportar reporte
      </button>
    </div>
  )
}
