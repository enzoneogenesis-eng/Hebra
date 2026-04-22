"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Search, Mail, UserPlus, Loader2, Check } from "lucide-react";
import type { Sucursal, Profile } from "@/types";

type Props = {
  marcaId: string;
  sucursales: Sucursal[];
  ownerId: string;
  onClose: () => void;
  onSaved: () => void;
};

type Tab = "buscar" | "invitar";

export function EquipoAgregarModal({ marcaId, sucursales, ownerId, onClose, onSaved }: Props) {
  const [tab, setTab] = useState<Tab>("buscar");

  // Campos compartidos
  const [sucursalId, setSucursalId] = useState(sucursales[0]?.id ?? "");
  const [porcentaje, setPorcentaje] = useState("50");

  // BUSCAR
  const [query, setQuery]           = useState("");
  const [resultados, setResultados] = useState<Profile[]>([]);
  const [searching, setSearching]   = useState(false);
  const [selected, setSelected]     = useState<Profile | null>(null);

  // INVITAR
  const [emailInv, setEmailInv]     = useState("");
  const [nombreInv, setNombreInv]   = useState("");

  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [successMsg, setSuccess]    = useState<string | null>(null);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (tab !== "buscar") return;
    if (query.trim().length < 2) { setResultados([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, email, foto_url, is_barbero, verificado")
        .eq("is_barbero", true)
        .or(`nombre.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
      setResultados((data ?? []) as unknown as Profile[]);
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, tab]);

  async function handleSubmitBuscar() {
    setError(null);
    if (!selected) { setError("Selecciona un barbero."); return; }
    if (!sucursalId) { setError("Selecciona una sucursal."); return; }
    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct < 0 || pct > 100) { setError("Porcentaje invalido (0-100)."); return; }

    setSaving(true);

    // Chequear si ya esta asignado a esta sucursal y activo
    const { data: ya } = await supabase
      .from("sucursales_barberos")
      .select("id")
      .eq("sucursal_id", sucursalId)
      .eq("barbero_id", selected.id)
      .eq("activo", true)
      .maybeSingle();

    if (ya) {
      setError("Este barbero ya esta activo en esa sucursal.");
      setSaving(false);
      return;
    }

    const { error: insertErr } = await supabase.from("sucursales_barberos").insert({
      sucursal_id: sucursalId,
      barbero_id: selected.id,
      porcentaje_barbero: pct,
      desde: new Date().toISOString().slice(0, 10),
      activo: true,
    });

    if (insertErr) {
      setError("No se pudo asignar: " + insertErr.message);
      setSaving(false);
      return;
    }

    setSuccess("Barbero asignado correctamente.");
    setTimeout(() => onSaved(), 800);
  }

  async function handleSubmitInvitar() {
    setError(null);
    if (!emailInv.trim()) { setError("Ingresa el email."); return; }
    if (!nombreInv.trim()) { setError("Ingresa el nombre."); return; }
    if (!sucursalId) { setError("Selecciona una sucursal."); return; }
    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct < 0 || pct > 100) { setError("Porcentaje invalido (0-100)."); return; }

    setSaving(true);

    const res = await fetch("/api/equipo/invitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInv.trim().toLowerCase(),
        nombre: nombreInv.trim(),
        sucursal_id: sucursalId,
        porcentaje: pct,
        owner_id: ownerId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al invitar.");
      setSaving(false);
      return;
    }

    setSuccess("Invitacion enviada! El barbero recibira un email para crear su contrasena.");
    setTimeout(() => onSaved(), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#2a2a2a] px-5 py-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">Agregar barbero</h2>
          <button onClick={onClose} className="text-[#888] hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a]">
          <button onClick={() => { setTab("buscar"); setError(null); setSuccess(null); }}
            className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
              tab === "buscar" ? "bg-[#0a1a0a] text-white border-b-2 border-[#1ed760]" : "text-[#aaa]"
            }`}>
            <Search size={14} /> Buscar en Hebra
          </button>
          <button onClick={() => { setTab("invitar"); setError(null); setSuccess(null); }}
            className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
              tab === "invitar" ? "bg-[#0a1a0a] text-white border-b-2 border-[#1ed760]" : "text-[#aaa]"
            }`}>
            <Mail size={14} /> Invitar nuevo
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* TAB BUSCAR */}
          {tab === "buscar" && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Buscar por nombre o email</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input type="text" autoFocus value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }}
                    placeholder="Ej: Juan, juan@gmail.com"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
                  />
                </div>
              </div>

              {searching && <p className="text-[#888] text-sm">Buscando...</p>}

              {!searching && resultados.length > 0 && (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {resultados.map(b => (
                    <button key={b.id} onClick={() => setSelected(b)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                        selected?.id === b.id ? "bg-[#0a1a0a] border border-[#1ed760]" : "bg-[#1a1a1a] hover:bg-[#222] border border-transparent"
                      }`}>
                      <div className="w-9 h-9 rounded-full bg-[#2a2a2a] overflow-hidden flex items-center justify-center text-[#888] text-sm font-bold">
                        {b.foto_url ? <img src={b.foto_url} className="w-full h-full object-cover" /> : (b.nombre ?? "?").slice(0,1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">{b.nombre}</p>
                        <p className="text-[#666] text-xs truncate">{(b as any).email}</p>
                      </div>
                      {selected?.id === b.id && <Check size={16} className="text-[#1ed760] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {!searching && query.length >= 2 && resultados.length === 0 && (
                <p className="text-[#888] text-sm py-4 text-center">
                  No se encontraron barberos. Probá en la pestaña <button onClick={() => setTab("invitar")} className="text-[#1ed760] underline">Invitar nuevo</button>.
                </p>
              )}
            </>
          )}

          {/* TAB INVITAR */}
          {tab === "invitar" && (
            <>
              <div className="bg-[#0a1a0a]/50 border border-[#1ed760]/20 rounded-xl p-3">
                <p className="text-xs text-[#aaa]">
                  <UserPlus size={12} className="inline mr-1 text-[#1ed760]" />
                  Se enviara un email invitando al barbero a crear su contrasena. Al hacerlo quedara asignado automaticamente.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Email del barbero</label>
                <input type="email" autoFocus value={emailInv} onChange={e => setEmailInv(e.target.value)}
                  placeholder="barbero@ejemplo.com" required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Nombre</label>
                <input type="text" value={nombreInv} onChange={e => setNombreInv(e.target.value)}
                  placeholder="Ej: Juan Perez" required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
                />
              </div>
            </>
          )}

          {/* CAMPOS COMUNES: sucursal + porcentaje */}
          {((tab === "buscar" && selected) || tab === "invitar") && (
            <>
              <div className="pt-4 border-t border-[#2a2a2a] space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Sucursal</label>
                  <select value={sucursalId} onChange={e => setSucursalId(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]">
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Porcentaje para el barbero</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" step="1" value={porcentaje} onChange={e => setPorcentaje(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-4 pr-10 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#1ed760]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] font-semibold">%</span>
                  </div>
                  <p className="text-[#666] text-xs mt-1.5">
                    El barbero se lleva {porcentaje || 0}%, tu te quedas con {100 - Number(porcentaje || 0)}%.
                  </p>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-xl">{error}</p>}
          {successMsg && <p className="text-green-400 text-sm bg-green-900/20 border border-green-900/30 px-4 py-3 rounded-xl">{successMsg}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-[#aaa] font-semibold hover:bg-[#1a1a1a]">
              Cancelar
            </button>
            <button type="button"
              onClick={tab === "buscar" ? handleSubmitBuscar : handleSubmitInvitar}
              disabled={saving || (tab === "buscar" && !selected) || !!successMsg}
              className="flex-1 py-3 rounded-xl bg-[#1ed760] text-black font-bold hover:bg-[#1ed760]/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Guardando..." : tab === "buscar" ? "Asignar barbero" : "Enviar invitacion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}