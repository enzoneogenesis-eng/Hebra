"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Home, Package, Zap, Users, Receipt, Megaphone, Wrench, MoreHorizontal, TrendingDown } from "lucide-react";
import { GastosForm } from "./GastosForm";
import type { Profile, Marca, Sucursal, Gasto } from "@/types";

type Periodo = "hoy" | "semana" | "mes";

const CATEGORIAS_INFO: Record<string, { label: string; icon: any; color: string }> = {
  alquiler:     { label: "Alquiler",     icon: Home,              color: "#ef4444" },
  productos:    { label: "Productos",    icon: Package,           color: "#f59e0b" },
  servicios:    { label: "Servicios",    icon: Zap,               color: "#eab308" },
  sueldos:      { label: "Sueldos",      icon: Users,             color: "#22c55e" },
  impuestos:    { label: "Impuestos",    icon: Receipt,           color: "#06b6d4" },
  marketing:    { label: "Marketing",    icon: Megaphone,         color: "#a855f7" },
  mantenimiento:{ label: "Mantenimiento",icon: Wrench,            color: "#ec4899" },
  otros:        { label: "Otros",        icon: MoreHorizontal,    color: "#6b7280" },
};

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

function formatFecha(fechaStr: string): string {
  const d = new Date(fechaStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function DashboardGastos({ profile }: { profile: Profile }) {
  const [marca, setMarca]           = useState<Marca | null>(null);
  const [sucursales, setSucurs]     = useState<Sucursal[]>([]);
  const [gastos, setGastos]         = useState<Gasto[]>([]);
  const [periodo, setPeriodo]       = useState<Periodo>("mes");
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);

    const { data: marcaData } = await supabase
      .from("marcas")
      .select("*")
      .eq("owner_id", profile.id)
      .maybeSingle();

    if (!marcaData) { setLoading(false); return; }
    setMarca(marcaData as Marca);

    const { data: sucursalesData } = await supabase
      .from("sucursales")
      .select("*")
      .eq("marca_id", marcaData.id)
      .eq("activa", true)
      .order("nombre", { ascending: true });
    setSucurs((sucursalesData ?? []) as Sucursal[]);

    const desde30 = new Date();
    desde30.setDate(desde30.getDate() - 30);
    const ids = (sucursalesData ?? []).map(s => s.id);

    const { data: gastosData } = await supabase
      .from("gastos")
      .select("*")
      .or(`sucursal_id.in.(${ids.join(",")}),marca_id.eq.${marcaData.id}`)
      .gte("fecha", desde30.toISOString().slice(0, 10))
      .order("fecha", { ascending: false });

    setGastos((gastosData ?? []) as Gasto[]);
    setLoading(false);
  }

  const desde = desdeFecha(periodo);
  const gastosPeriodo = useMemo(
    () => gastos.filter(g => new Date(g.fecha + "T00:00:00") >= desde),
    [gastos, periodo]
  );

  const total = gastosPeriodo.reduce((a, g) => a + Number(g.monto), 0);

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    gastosPeriodo.forEach(g => {
      const cat = (g as any).categoria || "otros";
      map.set(cat, (map.get(cat) ?? 0) + Number(g.monto));
    });
    return Array.from(map.entries())
      .map(([cat, monto]) => ({ cat, monto, pct: total > 0 ? (monto / total) * 100 : 0 }))
      .sort((a, b) => b.monto - a.monto);
  }, [gastosPeriodo, total]);

  const sucursalTop = useMemo(() => {
    const map = new Map<string, number>();
    gastosPeriodo.forEach(g => {
      if (!(g as any).sucursal_id) return;
      const id = (g as any).sucursal_id;
      map.set(id, (map.get(id) ?? 0) + Number(g.monto));
    });
    let topId: string | null = null;
    let topMonto = 0;
    map.forEach((monto, id) => { if (monto > topMonto) { topMonto = monto; topId = id; } });
    if (!topId) return null;
    const suc = sucursales.find(s => s.id === topId);
    return { nombre: suc?.nombre ?? "Desconocida", monto: topMonto };
  }, [gastosPeriodo, sucursales]);

  async function handleDelete(gastoId: string) {
    if (!confirm("Eliminar este gasto?")) return;
    setDeletingId(gastoId);
    const { error } = await supabase.from("gastos").delete().eq("id", gastoId);
    setDeletingId(null);
    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    setGastos(prev => prev.filter(g => g.id !== gastoId));
  }

  function onSaved() {
    setShowForm(false);
    loadAll();
  }

  const periodoLabel = periodo === "hoy" ? "hoy" : periodo === "semana" ? "ultimos 7 dias" : "ultimos 30 dias";

  if (loading) {
    return <div className="text-[#888] text-sm py-10 text-center">Cargando gastos...</div>;
  }

  if (!marca) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-white font-semibold">No tenes una marca configurada todavia.</p>
        <p className="text-[#888] text-sm">Contacta al equipo de Hebra para configurar tu cadena.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider">Gastos</p>
          <h2 className="text-white text-2xl font-bold">Control de egresos</h2>
          <p className="text-[#888] text-sm mt-1">Carga y controla los gastos de tu marca.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#1ed760] text-black font-bold px-4 py-2.5 rounded-xl hover:bg-[#1ed760]/90 transition active:scale-95">
          <Plus size={16} /> Nuevo gasto
        </button>
      </div>

      {/* Filtro de periodo */}
      <div className="flex gap-2 flex-wrap">
        {(["hoy", "semana", "mes"] as Periodo[]).map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              periodo === p ? "bg-white text-black" : "bg-[#1a1a1a] text-[#aaa] hover:bg-[#2a2a2a]"
            }`}>
            {p === "hoy" ? "Hoy" : p === "semana" ? "7 dias" : "30 dias"}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <TrendingDown size={16} /> <span className="uppercase tracking-wider">Total gastado</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatearARS(total)}</p>
          <p className="text-xs text-[#666] mt-1">{periodoLabel}</p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Receipt size={16} /> <span className="uppercase tracking-wider">Categoria top</span>
          </div>
          {porCategoria.length > 0 ? (
            <>
              <p className="text-xl font-bold text-white truncate">{CATEGORIAS_INFO[porCategoria[0].cat]?.label ?? "Otros"}</p>
              <p className="text-xs text-[#666] mt-1">{formatearARS(porCategoria[0].monto)}</p>
            </>
          ) : (
            <p className="text-sm text-[#666] mt-2">Sin datos</p>
          )}
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Home size={16} /> <span className="uppercase tracking-wider">Sucursal con mas gasto</span>
          </div>
          {sucursalTop ? (
            <>
              <p className="text-xl font-bold text-white truncate">{sucursalTop.nombre.replace(/^.*?- /, "")}</p>
              <p className="text-xs text-[#666] mt-1">{formatearARS(sucursalTop.monto)}</p>
            </>
          ) : (
            <p className="text-sm text-[#666] mt-2">Sin gastos por sucursal</p>
          )}
        </div>
      </div>

      {/* Por categoria */}
      {porCategoria.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Por categoria</h3>
          <div className="space-y-3">
            {porCategoria.map(({ cat, monto, pct }) => {
              const info = CATEGORIAS_INFO[cat];
              const Icon = info?.icon ?? MoreHorizontal;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm text-[#ddd]">
                      <Icon size={14} style={{ color: info?.color ?? "#888" }} />
                      <span>{info?.label ?? "Otros"}</span>
                      <span className="text-[#666] text-xs">({pct.toFixed(0)}%)</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{formatearARS(monto)}</span>
                  </div>
                  <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, background: info?.color ?? "#6b7280" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
        <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Ultimos gastos</h3>
        {gastosPeriodo.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#888] text-sm mb-3">Sin gastos en este periodo.</p>
            <button onClick={() => setShowForm(true)} className="text-[#1ed760] text-sm font-semibold hover:underline">
              Carga tu primer gasto
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {gastosPeriodo.map(g => {
              const cat = (g as any).categoria || "otros";
              const info = CATEGORIAS_INFO[cat];
              const Icon = info?.icon ?? MoreHorizontal;
              const sucId = (g as any).sucursal_id;
              const sucursal = sucId ? sucursales.find(s => s.id === sucId) : null;
              const asignado = sucursal ? sucursal.nombre.replace(/^.*?- /, "") : "Marca";
              const descripcion = (g as any).descripcion;
              return (
                <div key={g.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-[#1a1a1a] last:border-b-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${info?.color ?? "#6b7280"}22` }}>
                      <Icon size={16} style={{ color: info?.color ?? "#6b7280" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {descripcion || info?.label || "Gasto"}
                      </p>
                      <p className="text-[#666] text-xs truncate">
                        {formatFecha(g.fecha)} &middot; {info?.label ?? "Otros"} &middot; {asignado}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white font-semibold text-sm">{formatearARS(Number(g.monto))}</span>
                    <button onClick={() => handleDelete(g.id)} disabled={deletingId === g.id}
                      className="text-[#666] hover:text-red-400 transition p-1 disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <GastosForm marcaId={marca.id} sucursales={sucursales} onClose={() => setShowForm(false)} onSaved={onSaved} />
      )}
    </div>
  );
}