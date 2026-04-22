"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Users, DollarSign, Scissors, TrendingUp, Banknote, CreditCard, Smartphone, ArrowLeftRight } from "lucide-react";
import type { Profile, Marca, Sucursal } from "@/types";

type Periodo = "semana" | "mes" | "anterior";

type IngresoLiquidacion = {
  barbero_id: string;
  sucursal_id: string;
  monto: number;
  monto_barbero: number;
  monto_salon: number;
  porcentaje_barbero: number;
  fecha: string;
  metodo_pago: string | null;
};

type BarberoResumen = {
  barbero_id: string;
  nombre: string;
  foto_url: string | null;
  sucursal_id: string;
  sucursal_nombre: string;
  porcentaje: number;
  cortes: number;
  facturado: number;
  al_barbero: number;
  al_salon: number;
  metodos: Record<string, number>;
};

function formatearARS(n: number): string {
  return "$ " + Math.round(n).toLocaleString("es-AR");
}

function rangoFechas(p: Periodo): { desde: string; hasta: string; label: string } {
  const hoy = new Date();
  const desde = new Date(hoy);
  const hasta = new Date(hoy);
  if (p === "semana") {
    desde.setDate(hoy.getDate() - 7);
    return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10), label: "ultimos 7 dias" };
  }
  if (p === "mes") {
    desde.setDate(hoy.getDate() - 30);
    return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10), label: "ultimos 30 dias" };
  }
  // anterior: dias 60-30
  desde.setDate(hoy.getDate() - 60);
  hasta.setDate(hoy.getDate() - 30);
  return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10), label: "mes anterior" };
}

export function DashboardLiquidacion({ profile }: { profile: Profile }) {
  const [marca, setMarca]           = useState<Marca | null>(null);
  const [sucursales, setSucurs]     = useState<Sucursal[]>([]);
  const [ingresos, setIngresos]     = useState<IngresoLiquidacion[]>([]);
  const [barberos, setBarberos]     = useState<Record<string, { nombre: string; foto_url: string | null }>>({});
  const [asignaciones, setAsigs]    = useState<{ barbero_id: string; sucursal_id: string; porcentaje_barbero: number }[]>([]);
  const [periodo, setPeriodo]       = useState<Periodo>("mes");
  const [loading, setLoading]       = useState(true);
  const [expandido, setExpandido]   = useState<string | null>(null);

  useEffect(() => { loadAll(); }, [periodo]);

  async function loadAll() {
    setLoading(true);

    const { data: marcaData } = await supabase.from("marcas").select("*").eq("owner_id", profile.id).maybeSingle();
    if (!marcaData) { setLoading(false); return; }
    setMarca(marcaData as Marca);

    const { data: sucs } = await supabase.from("sucursales").select("*").eq("marca_id", marcaData.id).eq("activa", true);
    setSucurs((sucs ?? []) as Sucursal[]);

    const ids = (sucs ?? []).map(s => s.id);
    if (ids.length === 0) { setLoading(false); return; }

    const { desde, hasta } = rangoFechas(periodo);

    // Ingresos del periodo
    const { data: ings } = await supabase
      .from("ingresos")
      .select("barbero_id, sucursal_id, monto, monto_barbero, monto_salon, porcentaje_barbero, fecha, metodo_pago")
      .in("sucursal_id", ids)
      .gte("fecha", desde)
      .lte("fecha", hasta);

    setIngresos((ings ?? []) as IngresoLiquidacion[]);

    // Barberos presentes en esos ingresos (para tener nombre/foto)
    const barberoIds = Array.from(new Set((ings ?? []).map(i => i.barbero_id)));
    if (barberoIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, nombre, foto_url").in("id", barberoIds);
      const map: Record<string, { nombre: string; foto_url: string | null }> = {};
      (profs ?? []).forEach(p => { map[p.id] = { nombre: p.nombre ?? "Barbero", foto_url: p.foto_url }; });
      setBarberos(map);
    }

    // Asignaciones activas (para conocer porcentaje actual por barbero/sucursal)
    const { data: asigs } = await supabase
      .from("sucursales_barberos")
      .select("barbero_id, sucursal_id, porcentaje_barbero")
      .in("sucursal_id", ids)
      .eq("activo", true);
    setAsigs((asigs ?? []) as any);

    setLoading(false);
  }

  // Agrupar ingresos por (barbero, sucursal)
  const resumenBarberos = useMemo<BarberoResumen[]>(() => {
    const map = new Map<string, BarberoResumen>();
    ingresos.forEach(i => {
      const key = `${i.barbero_id}_${i.sucursal_id}`;
      const suc = sucursales.find(s => s.id === i.sucursal_id);
      if (!map.has(key)) {
        const asig = asignaciones.find(a => a.barbero_id === i.barbero_id && a.sucursal_id === i.sucursal_id);
        map.set(key, {
          barbero_id: i.barbero_id,
          nombre: barberos[i.barbero_id]?.nombre ?? "Barbero",
          foto_url: barberos[i.barbero_id]?.foto_url ?? null,
          sucursal_id: i.sucursal_id,
          sucursal_nombre: (suc?.nombre ?? "").replace(/^.*?- /, ""),
          porcentaje: asig?.porcentaje_barbero ?? i.porcentaje_barbero,
          cortes: 0,
          facturado: 0,
          al_barbero: 0,
          al_salon: 0,
          metodos: {},
        });
      }
      const r = map.get(key)!;
      r.cortes += 1;
      r.facturado += Number(i.monto);
      r.al_barbero += Number(i.monto_barbero ?? 0);
      r.al_salon += Number(i.monto_salon ?? 0);
      const m = i.metodo_pago || "otro";
      r.metodos[m] = (r.metodos[m] ?? 0) + Number(i.monto);
    });
    return Array.from(map.values()).sort((a, b) => b.al_barbero - a.al_barbero);
  }, [ingresos, sucursales, barberos, asignaciones]);

  // Separar Nahuel (el owner) de los empleados
  const miData = useMemo(() => resumenBarberos.filter(r => r.barbero_id === profile.id), [resumenBarberos, profile.id]);
  const equipo = useMemo(() => resumenBarberos.filter(r => r.barbero_id !== profile.id), [resumenBarberos, profile.id]);

  const miFacturacion = miData.reduce((a, r) => a + r.facturado, 0);
  const totalALiquidar = equipo.reduce((a, r) => a + r.al_barbero, 0);
  const totalSalonEquipo = equipo.reduce((a, r) => a + r.al_salon, 0);
  const totalCortesEquipo = equipo.reduce((a, r) => a + r.cortes, 0);
  const { label: periodoLabel } = rangoFechas(periodo);

  if (loading) return <div className="text-[#888] text-sm py-10 text-center">Cargando liquidacion...</div>;

  if (!marca) {
    return <div className="text-center py-16"><p className="text-white font-semibold">No tenes una marca configurada.</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#2a2a2a]">
        <p className="text-[#888] text-xs uppercase tracking-wider">Liquidacion</p>
        <h2 className="text-white text-2xl font-bold">Cuanto pagar al equipo</h2>
        <p className="text-[#888] text-sm mt-1">Calculado automaticamente con los porcentajes de cada barbero.</p>
      </div>

      {/* Filtro periodo */}
      <div className="flex gap-2 flex-wrap">
        {(["semana", "mes", "anterior"] as Periodo[]).map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              periodo === p ? "bg-white text-black" : "bg-[#1a1a1a] text-[#aaa] hover:bg-[#2a2a2a]"
            }`}>
            {p === "semana" ? "7 dias" : p === "mes" ? "30 dias" : "Mes anterior"}
          </button>
        ))}
      </div>

      {/* TU FACTURACION */}
      {miData.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-[#1ed760]" />
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Tu facturacion como barbero</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {miData.map(r => (
              <div key={`${r.barbero_id}_${r.sucursal_id}`} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
                <p className="text-[#666] text-xs uppercase">{r.sucursal_nombre}</p>
                <p className="text-white text-xl font-bold mt-1">{formatearARS(r.facturado)}</p>
                <p className="text-[#888] text-xs mt-0.5">{r.cortes} corte{r.cortes !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
          <p className="text-[#1ed760] text-sm font-semibold mt-4">
            Total facturado: {formatearARS(miFacturacion)}
          </p>
        </div>
      )}

      {/* A LIQUIDAR AL EQUIPO */}
      <div className="bg-gradient-to-br from-[#0a1a0a] to-[#141414] border border-[#1ed760]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-[#1ed760]" />
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider">A liquidar al equipo</h3>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
            <p className="text-[#888] text-[10px] uppercase tracking-wider">Total a pagar</p>
            <p className="text-[#1ed760] text-2xl font-bold mt-1">{formatearARS(totalALiquidar)}</p>
            <p className="text-[#666] text-xs mt-0.5">{periodoLabel}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
            <p className="text-[#888] text-[10px] uppercase tracking-wider">Tu parte del salon</p>
            <p className="text-white text-2xl font-bold mt-1">{formatearARS(totalSalonEquipo)}</p>
            <p className="text-[#666] text-xs mt-0.5">del equipo</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
            <p className="text-[#888] text-[10px] uppercase tracking-wider">Cortes del equipo</p>
            <p className="text-white text-2xl font-bold mt-1">{totalCortesEquipo}</p>
            <p className="text-[#666] text-xs mt-0.5">{equipo.length} asignacion{equipo.length !== 1 ? "es" : ""}</p>
          </div>
        </div>

        {/* Lista de barberos */}
        {equipo.length === 0 ? (
          <p className="text-[#888] text-sm py-4 text-center">Tu equipo no genero ingresos en este periodo.</p>
        ) : (
          <div className="space-y-2">
            {equipo.map(r => {
              const key = `${r.barbero_id}_${r.sucursal_id}`;
              const isExp = expandido === key;
              return (
                <div key={key} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
                  <button onClick={() => setExpandido(isExp ? null : key)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#111] transition">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#888] text-sm font-bold">
                      {r.foto_url ? <img src={r.foto_url} className="w-full h-full object-cover" /> : r.nombre.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-white text-sm font-semibold">{r.nombre}</p>
                      <p className="text-[#666] text-xs">
                        {r.sucursal_nombre} &middot; {r.porcentaje}% &middot; {r.cortes} corte{r.cortes !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#1ed760] text-lg font-bold">{formatearARS(r.al_barbero)}</p>
                      <p className="text-[#666] text-[10px]">de {formatearARS(r.facturado)}</p>
                    </div>
                  </button>

                  {isExp && (
                    <div className="border-t border-[#1a1a1a] px-4 py-3 bg-[#050505]">
                      <p className="text-[#888] text-[10px] uppercase tracking-wider mb-2">Desglose por metodo de pago</p>
                      <div className="space-y-1.5">
                        {Object.entries(r.metodos).map(([metodo, monto]) => {
                          const Icon = metodo === "efectivo" ? Banknote : metodo === "tarjeta" ? CreditCard : metodo === "mercadopago" ? Smartphone : ArrowLeftRight;
                          const label = metodo === "efectivo" ? "Efectivo" : metodo === "tarjeta" ? "Tarjeta" : metodo === "mercadopago" ? "MercadoPago" : metodo === "transferencia" ? "Transferencia" : "Otro";
                          return (
                            <div key={metodo} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-[#aaa]">
                                <Icon size={13} /> {label}
                              </span>
                              <span className="text-white font-medium">{formatearARS(monto)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}