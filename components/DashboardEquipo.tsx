"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Plus, Pencil, UserX, Percent } from "lucide-react";
import type { Profile, Sucursal, SucursalBarbero } from "@/types";
import { EquipoAgregarModal } from "./EquipoAgregarModal";

type AsignacionConBarbero = SucursalBarbero & {
  barbero?: Profile;
  sucursal?: Sucursal;
};

export function DashboardEquipo({ profile }: { profile: Profile }) {
  const [sucursales, setSucurs]     = useState<Sucursal[]>([]);
  const [asignaciones, setAsign]    = useState<AsignacionConBarbero[]>([]);
  const [loading, setLoading]       = useState(true);
  const [marcaId, setMarcaId]       = useState<string | null>(null);
  const [showAdd, setShowAdd]       = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);

    const { data: marca } = await supabase
      .from("marcas")
      .select("id")
      .eq("owner_id", profile.id)
      .maybeSingle();

    if (!marca) { setLoading(false); return; }
    setMarcaId(marca.id);

    const { data: sucs } = await supabase
      .from("sucursales")
      .select("*")
      .eq("marca_id", marca.id)
      .eq("activa", true)
      .order("nombre", { ascending: true });

    setSucurs((sucs ?? []) as Sucursal[]);

    const ids = (sucs ?? []).map(s => s.id);
    if (ids.length === 0) { setLoading(false); return; }

    // Cargar asignaciones activas con datos del barbero
    const { data: asigs } = await supabase
      .from("sucursales_barberos")
      .select("*, barbero:profiles!sucursales_barberos_barbero_id_fkey(id, nombre, email, foto_url, verificado)")
      .in("sucursal_id", ids)
      .eq("activo", true)
      .order("desde", { ascending: false });

    setAsign((asigs ?? []) as AsignacionConBarbero[]);
    setLoading(false);
  }

  // Agrupar asignaciones por sucursal
  const porSucursal = useMemo(() => {
    const map = new Map<string, AsignacionConBarbero[]>();
    sucursales.forEach(s => map.set(s.id, []));
    asignaciones.forEach(a => {
      const arr = map.get(a.sucursal_id) ?? [];
      arr.push(a);
      map.set(a.sucursal_id, arr);
    });
    return Array.from(map.entries()).map(([sucId, asigs]) => ({
      sucursal: sucursales.find(s => s.id === sucId)!,
      asignaciones: asigs,
    }));
  }, [sucursales, asignaciones]);

  const totalBarberos = asignaciones.length;
  const promedioPct = asignaciones.length > 0
    ? asignaciones.reduce((a, x) => a + Number(x.porcentaje_barbero), 0) / asignaciones.length
    : 0;

  if (loading) return <div className="text-[#888] text-sm py-10 text-center">Cargando equipo...</div>;

  if (!marcaId) {
    return (
      <div className="text-center py-16">
        <p className="text-white font-semibold">No tenes una marca configurada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider">Equipo</p>
          <h2 className="text-white text-2xl font-bold">Mis barberos</h2>
          <p className="text-[#888] text-sm mt-1">Gestiona barberos y sus porcentajes por sucursal.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#1ed760] text-black font-bold px-4 py-2.5 rounded-xl hover:bg-[#1ed760]/90 transition active:scale-95">
          <Plus size={16} /> Agregar barbero
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Users size={16} /> <span className="uppercase tracking-wider">Barberos activos</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalBarberos}</p>
          <p className="text-xs text-[#666] mt-1">en {sucursales.length} sucursal{sucursales.length !== 1 ? "es" : ""}</p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Percent size={16} /> <span className="uppercase tracking-wider">Porcentaje promedio</span>
          </div>
          <p className="text-2xl font-bold text-white">{promedioPct.toFixed(0)}%</p>
          <p className="text-xs text-[#666] mt-1">para barberos</p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Users size={16} /> <span className="uppercase tracking-wider">Para el dueno</span>
          </div>
          <p className="text-2xl font-bold text-white">{(100 - promedioPct).toFixed(0)}%</p>
          <p className="text-xs text-[#666] mt-1">promedio retenido</p>
        </div>
      </div>

      {/* Listado por sucursal */}
      {sucursales.length === 0 ? (
        <div className="text-center py-12 bg-[#141414] border border-[#2a2a2a] rounded-xl">
          <p className="text-[#888] text-sm">No tenes sucursales cargadas aun.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {porSucursal.map(({ sucursal, asignaciones }) => (
            <div key={sucursal.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#0f0f0f]">
                <h3 className="text-white font-bold">{sucursal.nombre}</h3>
                <p className="text-[#888] text-xs mt-0.5">
                  {asignaciones.length} barbero{asignaciones.length !== 1 ? "s" : ""}
                </p>
              </div>

              {asignaciones.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[#666] text-sm">Sin barberos asignados.</p>
                  <button onClick={() => setShowAdd(true)} className="mt-2 text-[#1ed760] text-sm font-semibold hover:underline">
                    Agregar el primero
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {asignaciones.map(a => {
                    const b = a.barbero;
                    if (!b) return null;
                    const esSelf = b.id === profile.id;
                    return (
                      <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#888] text-sm font-bold">
                          {b.foto_url ? (
                            <img src={b.foto_url} alt={b.nombre ?? ""} className="w-full h-full object-cover" />
                          ) : (
                            (b.nombre ?? "?").slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">
                            {b.nombre}
                            {esSelf && <span className="ml-2 text-[10px] text-[#1ed760] font-bold">(vos)</span>}
                          </p>
                          
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white text-sm font-bold">{Number(a.porcentaje_barbero).toFixed(0)}%</p>
                          <p className="text-[#666] text-[10px]">desde {a.desde.slice(0, 10)}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button className="p-2 text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button className="p-2 text-[#888] hover:text-red-400 hover:bg-[#1a1a1a] rounded-lg transition" title="Desactivar">
                            <UserX size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && marcaId && (
        <EquipoAgregarModal
          marcaId={marcaId}
          sucursales={sucursales}
          ownerId={profile.id}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); loadAll(); }}
        />
      )}
    </div>
  );
}