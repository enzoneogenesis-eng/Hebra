'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, Users, Scissors, CreditCard, Banknote, Download, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface FinanzasData {
  ingreso_hoy: number
  ingreso_semana: number
  ingreso_mes: number
  ingreso_mes_anterior: number
  turnos_hoy: number
  turnos_semana: number
  turnos_mes: number
  clientes_unicos: number
  servicio_top: string
  metodo_efectivo: number
  metodo_mp: number
  metodo_transferencia: number
  por_dia: { fecha: string; ingreso: number; turnos: number }[]
  por_servicio: { nombre: string; cantidad: number; ingreso: number }[]
}

// Datos de ejemplo
const MOCK_DATA: FinanzasData = {
  ingreso_hoy: 35000,
  ingreso_semana: 187500,
  ingreso_mes: 842000,
  ingreso_mes_anterior: 756000,
  turnos_hoy: 6,
  turnos_semana: 28,
  turnos_mes: 124,
  clientes_unicos: 89,
  servicio_top: 'Corte + barba',
  metodo_efectivo: 520000,
  metodo_mp: 248000,
  metodo_transferencia: 74000,
  por_dia: [
    { fecha: 'Lun', ingreso: 42000, turnos: 7 },
    { fecha: 'Mar', ingreso: 38000, turnos: 6 },
    { fecha: 'Mie', ingreso: 45000, turnos: 8 },
    { fecha: 'Jue', ingreso: 31000, turnos: 5 },
    { fecha: 'Vie', ingreso: 52000, turnos: 9 },
    { fecha: 'Sab', ingreso: 28000, turnos: 5 },
  ],
  por_servicio: [
    { nombre: 'Corte clasico', cantidad: 45, ingreso: 225000 },
    { nombre: 'Corte + barba', cantidad: 38, ingreso: 285000 },
    { nombre: 'Barba', cantidad: 22, ingreso: 77000 },
    { nombre: 'Degradado', cantidad: 19, ingreso: 114000 },
  ],
}

function StatCard({ icon: Icon, label, value, subvalue, trend, color = 'green' }: {
  icon: any; label: string; value: string; subvalue?: string; trend?: number; color?: string
}) {
  const colorMap: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  }
  return (
    <div className="bg-white/3 border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-white font-bold text-xl">{value}</p>
      <p className="text-white/40 text-xs mt-0.5">{label}</p>
      {subvalue && <p className="text-white/25 text-[10px] mt-0.5">{subvalue}</p>}
    </div>
  )
}

function BarChart({ data }: { data: { fecha: string; ingreso: number }[] }) {
  const maxIngreso = Math.max(...data.map(d => d.ingreso))
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-white/30 text-[10px]">
            ${(d.ingreso / 1000).toFixed(0)}k
          </span>
          <div
            className="w-full bg-green-500/60 rounded-t-md transition-all hover:bg-green-500"
            style={{ height: `${(d.ingreso / maxIngreso) * 80}%`, minHeight: '4px' }}
          />
          <span className="text-white/40 text-[10px]">{d.fecha}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardFinanzas() {
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('mes')
  const data = MOCK_DATA
  const crecimiento = Math.round(((data.ingreso_mes - data.ingreso_mes_anterior) / data.ingreso_mes_anterior) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Finanzas</h2>
          <p className="text-white/40 text-sm">Tu resumen financiero</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {(['hoy', 'semana', 'mes'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                periodo === p ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {p === 'hoy' ? 'Hoy' : p === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Ingreso principal */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-500/0 border border-green-500/20 rounded-2xl p-6">
        <p className="text-white/50 text-sm">Ingreso {periodo === 'hoy' ? 'de hoy' : periodo === 'semana' ? 'esta semana' : 'este mes'}</p>
        <p className="text-white text-4xl font-bold mt-1">
          ${(periodo === 'hoy' ? data.ingreso_hoy : periodo === 'semana' ? data.ingreso_semana : data.ingreso_mes).toLocaleString('es-AR')}
        </p>
        {periodo === 'mes' && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${crecimiento >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {crecimiento >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(crecimiento)}% vs mes anterior
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Scissors}
          label="Turnos completados"
          value={periodo === 'hoy' ? String(data.turnos_hoy) : periodo === 'semana' ? String(data.turnos_semana) : String(data.turnos_mes)}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Clientes unicos"
          value={String(data.clientes_unicos)}
          subvalue="este mes"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Servicio mas pedido"
          value={data.servicio_top}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Promedio por turno"
          value={'$' + Math.round(data.ingreso_mes / data.turnos_mes).toLocaleString('es-AR')}
          color="purple"
        />
      </div>

      {/* Grafico semanal */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-4">
        <h3 className="text-white/80 text-sm font-medium mb-4">Ingresos por dia</h3>
        <BarChart data={data.por_dia} />
      </div>

      {/* Desglose por metodo de pago */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-4">
        <h3 className="text-white/80 text-sm font-medium mb-3">Metodos de pago</h3>
        <div className="space-y-2">
          {[
            { icon: Banknote, label: 'Efectivo', monto: data.metodo_efectivo, color: 'bg-green-500' },
            { icon: CreditCard, label: 'MercadoPago', monto: data.metodo_mp, color: 'bg-blue-500' },
            { icon: DollarSign, label: 'Transferencia', monto: data.metodo_transferencia, color: 'bg-purple-500' },
          ].map(m => {
            const pct = Math.round((m.monto / data.ingreso_mes) * 100)
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <m.icon size={14} className="text-white/40" />
                    <span className="text-white/70 text-xs">{m.label}</span>
                  </div>
                  <span className="text-white text-xs font-medium">
                    ${m.monto.toLocaleString('es-AR')} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top servicios */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-4">
        <h3 className="text-white/80 text-sm font-medium mb-3">Servicios mas vendidos</h3>
        <div className="space-y-2">
          {data.por_servicio.map((s, i) => (
            <div key={s.nombre} className="flex items-center justify-between py-1.5 border-b border-white/3 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-white/20 text-xs w-4">{i + 1}.</span>
                <span className="text-white/80 text-sm">{s.nombre}</span>
              </div>
              <div className="text-right">
                <span className="text-white text-sm font-medium">${s.ingreso.toLocaleString('es-AR')}</span>
                <span className="text-white/30 text-xs ml-2">{s.cantidad} turnos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exportar */}
      <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 py-3 rounded-xl transition-colors text-sm">
        <Download size={16} />
        Exportar reporte del mes
      </button>
    </div>
  )
}
