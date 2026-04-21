"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { DollarSign, Scissors, TrendingUp, CreditCard, Calendar, Store, Banknote, Smartphone, ArrowLeftRight, HelpCircle } from "lucide-react";
import type { Profile, Marca, Sucursal, Ingreso, Gasto } from "@/types";

type Periodo = "hoy" | "semana" | "mes";

function formatearARS(n: number): string {
  return "$ " + Math.round(n).toLocaleString("es-AR");
}

function desdeFecha(p: Periodo): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (p === "hoy") return d;
  if (p === "semana") { d.setDate(d.getDate() - 7); return d; }
  d.setDate(d.getDate() - 30);
  return d;
}

const COLORES_SUCURSAL = ["#00d26a", "#4ade80", "#22c55e"];

export function DashboardDueno({ profile }: { profile: Profile }) {
  const [marca, setMarca]         = useState<Marca | null>(null);
  const [sucursales, setSucurs]   = useState<Sucursal[]>([]);
  const [ingresos, setIngresos]   = useState<Ingreso[]>([]);
  const [gastos, setGastos]       = useState<Gasto[]>([]);
  const [periodo, setPeriodo]     = useState<Periodo>("mes");
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    // 1) Marca del dueño
    const { data: marcaData } = await supabase
      .from("marcas")
      .select("*")
      .eq("owner_id", profile.id)
      .maybeSingle();
    if (!marcaData) { setLoading(false); return; }
    setMarca(marcaData as Marca);

    // 2) Sucursales de la marca
    const { data: sucursalesData } = await supabase
      .from("sucursales")
      .select("*")
      .eq("marca_id", marcaData.id)
      .eq("activa", true)
      .order("nombre", { ascending: true });
    setSucurs((sucursalesData ?? []) as Sucursal[]);

    // 3) Ingresos de las sucursales de la marca (últimos 30 días)
    const desde30 = new Date();
    desde30.setDate(desde30.getDate() - 30);
    const ids = (sucursalesData ?? []).map(s => s.id);
    if (ids.length > 0) {
      const { data: ingresosData } = await supabase
        .from("ingresos")
        .select("*")
        .in("sucursal_id", ids)
        .gte("fecha", desde30.toISOString().slice(0, 10))
        .order("fecha", { ascending: false });
      setIngresos((ingresosData ?? []) as Ingreso[]);

      // 4) Gastos (por sucursal o por marca)
      const { data: gastosData } = await supabase
        .from("gastos")
        .select("*")
        .or(`sucursal_id.in.(${ids.join(",")}),marca_id.eq.${marcaData.id}`)
        .gte("fecha", desde30.toISOString().slice(0, 10));
      setGastos((gastosData ?? []) as Gasto[]);
    }
    setLoading(false);
  }

  // ===== Derivados =====
  const desde = desdeFecha(periodo);
  const ingresosPeriodo = useMemo(
    () => ingresos.filter(i => new Date(i.fecha) >= desde),
    [ingresos, periodo]
  );
  const gastosPeriodo = useMemo(
    () => gastos.filter(g => new Date(g.fecha) >= desde),
    [gastos, periodo]
  );

  const facturacion    = ingresosPeriodo.reduce((a, i) => a + Number(i.monto), 0);
  const cortes         = ingresosPeriodo.length;
  const totalGastos    = gastosPeriodo.reduce((a, g) => a + Number(g.monto), 0);
  const ganancia       = facturacion - totalGastos;
  const ticketPromedio = cortes > 0 ? facturacion / cortes : 0;

  const porSucursal = useMemo(() => {
    return sucursales.map(s => {
      const del = ingresosPeriodo.filter(i => i.sucursal_id === s.id);
      return {
        id: s.id,
        nombre: s.nombre.replace(/^.*?- /, ""), // solo "Sucursal Zapiola"
        nombreCorto: s.nombre.split(" - ").slice(-1)[0]?.replace("Sucursal ", "") ?? s.nombre,
        facturacion: del.reduce((a, i) => a + Number(i.monto), 0),
        cortes: del.length,
      };
    });
  }, [sucursales, ingresosPeriodo]);

  const porMetodo = useMemo(() => {
    const m = { efectivo: 0, mercadopago: 0, transferencia: 0, otro: 0 };
    ingresosPeriodo.forEach(i => {
      const mp = (i as any).metodo_pago as keyof typeof m;
      if (mp in m) m[mp] += Number(i.monto);
    });
    return m;
  }, [ingresosPeriodo]);

  // ===== Render =====
  if (loading) {
    return <div className="text-[#888] text-sm py-10 text-center">Cargando tu dashboard...</div>;
  }

  if (!marca) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-white font-semibold">No tenés una marca configurada todavía.</p>
        <p className="text-[#888] text-sm">Contactá al equipo de Hebra para configurar tu cadena de sucursales.</p>
      </div>
    );
  }

  const periodoLabel = periodo === "hoy" ? "hoy" : periodo === "semana" ? "últimos 7 días" : "últimos 30 días";

  return (
    <div className="space-y-6">
      {/* Header marca */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider">Marca</p>
          <h2 className="text-white text-2xl font-bold">{marca.nombre}</h2>
          <p className="text-[#888] text-sm mt-1">{sucursales.length} {sucursales.length === 1 ? "sucursal" : "sucursales"} activas</p>
        </div>
      </div>

      {/* Selector de período */}
      <div className="flex gap-2">
        {(["hoy","semana","mes"] as Periodo[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              periodo === p
                ? "bg-[#00d26a] text-black"
                : "bg-[#1a1a1a] text-[#888] hover:text-white"
            }`}
          >
            {p === "hoy" ? "Hoy" : p === "semana" ? "7 días" : "30 días"}
          </button>
        ))}
      </div>

      {/* KPIs grandes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<DollarSign size={18} />}   label="Facturación" valor={formatearARS(facturacion)} sub={periodoLabel} />
        <KpiCard icon={<Scissors size={18} />}     label="Cortes"      valor={cortes.toString()}          sub={periodoLabel} />
        <KpiCard icon={<TrendingUp size={18} />}   label="Ganancia"    valor={formatearARS(ganancia)}    sub={`menos ${formatearARS(totalGastos)} gastos`} />
        <KpiCard icon={<CreditCard size={18} />}   label="Ticket prom."valor={formatearARS(ticketPromedio)} sub="por corte" />
      </div>

      {/* Gráfico + Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
            <Store size={16} /> Facturación por sucursal
          </h3>
          {porSucursal.length === 0 ? (
            <p className="text-[#888] text-sm text-center py-8">Sin datos en el período.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={porSucursal} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <XAxis dataKey="nombreCorto" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => "$" + (v/1000).toFixed(0) + "k"} />
                  <Tooltip
                    cursor={{ fill: "#1a1a1a" }}
                    contentStyle={{ background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8 }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(v: number) => [formatearARS(v), "Facturación"]}
                  />
                  <Bar dataKey="facturacion" radius={[6,6,0,0]}>
                    {porSucursal.map((_, i) => (
                      <Cell key={i} fill={COLORES_SUCURSAL[i % COLORES_SUCURSAL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Métodos de pago */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-2">
          <h3 className="text-white text-sm font-semibold mb-3">Métodos de pago</h3>
          <MetodoRow icon={<Banknote size={15} />}       label="Efectivo"      valor={formatearARS(porMetodo.efectivo)} />
          <MetodoRow icon={<Smartphone size={15} />}     label="Mercado Pago"  valor={formatearARS(porMetodo.mercadopago)} />
          <MetodoRow icon={<ArrowLeftRight size={15} />} label="Transferencia" valor={formatearARS(porMetodo.transferencia)} />
          <MetodoRow icon={<HelpCircle size={15} />}     label="Otro"          valor={formatearARS(porMetodo.otro)} />
        </div>
      </div>

      {/* Tarjetas por sucursal */}
      <div>
        <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
          <Calendar size={16} /> Desempeño por sucursal ({periodoLabel})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {porSucursal.map((s, i) => (
            <div key={s.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORES_SUCURSAL[i % COLORES_SUCURSAL.length] }} />
                <p className="text-white font-semibold text-sm truncate">{s.nombreCorto}</p>
              </div>
              <p className="text-2xl font-bold text-white">{formatearARS(s.facturacion)}</p>
              <p className="text-xs text-[#888] mt-1">{s.cortes} {s.cortes === 1 ? "corte" : "cortes"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Sub-components =====
function KpiCard({ icon, label, valor, sub }: { icon: React.ReactNode; label: string; valor: string; sub: string; }) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
        {icon} <span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white truncate">{valor}</p>
      <p className="text-xs text-[#666] mt-1 truncate">{sub}</p>
    </div>
  );
}

function MetodoRow({ icon, label, valor }: { icon: React.ReactNode; label: string; valor: string; }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-[#aaa]">{icon} {label}</span>
      <span className="font-medium text-white">{valor}</span>
    </div>
  );
}