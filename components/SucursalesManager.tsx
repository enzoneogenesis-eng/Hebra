"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Store, Plus, Edit3, Trash2, Link as LinkIcon, MapPin, Check } from "lucide-react";
import type { Profile, Sucursal, Marca } from "@/types";
import { SucursalForm } from "./SucursalForm";

type Props = { profile: Profile };

export function SucursalesManager({ profile }: Props) {
  const [marca, setMarca]                 = useState<Marca | null>(null);
  const [sucursales, setSucursales]       = useState<Sucursal[]>([]);
  const [loading, setLoading]             = useState(true);
  const [err, setErr]                     = useState<string | null>(null);
  const [formOpen, setFormOpen]           = useState(false);
  const [editing, setEditing]             = useState<Sucursal | null>(null);
  const [copiedId, setCopiedId]           = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    // 1) encontrar la marca del usuario
    const { data: m, error: mErr } = await supabase
      .from("marcas")
      .select("*")
      .eq("owner_id", profile.id)
      .limit(1)
      .maybeSingle();
    if (mErr) { setErr("Error al cargar la marca"); setLoading(false); return; }
    if (!m) { setMarca(null); setSucursales([]); setLoading(false); return; }
    setMarca(m as Marca);

    // 2) traer sucursales de esa marca
    const { data: s, error: sErr } = await supabase
      .from("sucursales")
      .select("*")
      .eq("marca_id", (m as Marca).id)
      .order("creada_en", { ascending: true });
    if (sErr) { setErr("Error al cargar sucursales"); setLoading(false); return; }
    setSucursales((s as Sucursal[]) ?? []);
    setLoading(false);
  }

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(s: Sucursal) { setEditing(s); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setEditing(null); }

  function onSaved(saved: Sucursal) {
    setSucursales(prev => {
      const idx = prev.findIndex(x => x.id === saved.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; }
      return [...prev, saved];
    });
  }

  async function toggleActiva(s: Sucursal) {
    const nueva = !s.activa;
    // optimistic
    setSucursales(prev => prev.map(x => x.id === s.id ? { ...x, activa: nueva } : x));
    const { error } = await supabase.from("sucursales").update({ activa: nueva }).eq("id", s.id);
    if (error) {
      // revert
      setSucursales(prev => prev.map(x => x.id === s.id ? { ...x, activa: s.activa } : x));
      setErr("No se pudo actualizar el estado");
    }
  }

  async function eliminar(s: Sucursal) {
    if (!confirm(`¿Eliminar la sucursal "${s.nombre}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from("sucursales").delete().eq("id", s.id);
    if (error) { setErr("No se pudo eliminar. Quizá tenga ingresos o barberos asociados."); return; }
    setSucursales(prev => prev.filter(x => x.id !== s.id));
  }

  async function copiarLink(s: Sucursal) {
    const url = `${window.location.origin}/sucursal/${s.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setErr("No se pudo copiar el link");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[#111] rounded-3xl" />)}
      </div>
    );
  }

  if (!marca) {
    return (
      <div className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-8 text-center">
        <Store size={32} className="text-[#333] mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">Todavía no tenés una marca creada</p>
        <p className="text-[#666] text-sm">Primero creá tu marca en la tab "Mi marca" y después volvé acá para agregar sucursales.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-semibold text-lg">Sucursales</h2>
          <p className="text-[#666] text-xs mt-0.5">{sucursales.length} {sucursales.length === 1 ? "local" : "locales"} · {marca.nombre}</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs gap-1.5" style={{ WebkitTapHighlightColor: "transparent" }}>
          <Plus size={14} /> Nueva
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl p-3 mb-4">
          {err}
        </div>
      )}

      {/* Empty state */}
      {sucursales.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] border-dashed rounded-3xl p-10 text-center">
          <Store size={36} className="text-[#22c55e] mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Agregá tu primera sucursal</p>
          <p className="text-[#666] text-sm mb-5">Cada sucursal tendrá su página pública con equipo, servicios y mapa.</p>
          <button onClick={openCreate} className="btn-primary text-sm gap-2 mx-auto" style={{ WebkitTapHighlightColor: "transparent" }}>
            <Plus size={15} /> Crear sucursal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sucursales.map(s => (
            <div key={s.id} className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-4">
              <div className="flex items-start gap-3">
                {/* Foto */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#0a0a0a] border border-[#1e1e1e] relative flex-shrink-0">
                  {s.foto_url ? (
                    <Image src={s.foto_url} alt={s.nombre} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#333]">
                      <Store size={22} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm truncate">{s.nombre}</h3>
                    {!s.activa && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded-full flex-shrink-0">Inactiva</span>
                    )}
                  </div>
                  {(s.direccion || s.ciudad) && (
                    <p className="text-[11px] text-[#666] flex items-center gap-1 truncate">
                      <MapPin size={11} className="flex-shrink-0" />
                      <span className="truncate">{[s.direccion, s.ciudad].filter(Boolean).join(", ")}</span>
                    </p>
                  )}
                  {s.horario_texto && (
                    <p className="text-[11px] text-[#555] mt-0.5 truncate">{s.horario_texto}</p>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a1a1a]">
                <button
                  onClick={() => copiarLink(s)}
                  className="flex-1 text-[11px] font-semibold text-[#22c55e] bg-[#0a1a0a] border border-[#1a3a1a] rounded-2xl py-2 hover:bg-[#0d220d] transition flex items-center justify-center gap-1.5"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {copiedId === s.id ? <><Check size={12} /> Copiado</> : <><LinkIcon size={12} /> Link público</>}
                </button>
                <button
                  onClick={() => openEdit(s)}
                  className="text-[11px] font-semibold text-[#aaa] bg-[#1a1a1a] border border-[#222] rounded-2xl py-2 px-3 hover:bg-[#222] transition flex items-center gap-1.5"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <Edit3 size={12} /> Editar
                </button>
                <button
                  onClick={() => toggleActiva(s)}
                  className={`text-[11px] font-semibold rounded-2xl py-2 px-3 transition ${
                    s.activa
                      ? "text-[#888] bg-[#1a1a1a] border border-[#222] hover:bg-[#222]"
                      : "text-[#22c55e] bg-[#0a1a0a] border border-[#1a3a1a] hover:bg-[#0d220d]"
                  }`}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  title={s.activa ? "Desactivar" : "Activar"}
                >
                  {s.activa ? "Pausar" : "Activar"}
                </button>
                <button
                  onClick={() => eliminar(s)}
                  className="text-[11px] font-semibold text-red-400 bg-red-500/5 border border-red-500/20 rounded-2xl py-2 px-3 hover:bg-red-500/10 transition"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {formOpen && (
        <SucursalForm
          marcaId={marca.id}
          sucursal={editing ?? undefined}
          onSave={onSaved}
          onClose={closeForm}
        />
      )}
    </div>
  );
}