"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Resena {
  id: string;
  calificacion: number;
  comentario: string | null;
  created_at: string;
  profiles: { nombre: string; foto_url: string | null };
}

function Estrellas({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= n ? "#22c55e" : "none"}
          stroke={i <= n ? "#22c55e" : "#333"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export function Resenas({ barberoId }: { barberoId: string }) {
  const [resenas, setResenas]     = useState<Resena[]>([]);
  const [loading, setLoading]     = useState(true);
  const [miResena, setMiResena]   = useState<Resena | null>(null);
  const [esCliente, setEsCliente] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [form, setForm]           = useState({ calificacion: 5, comentario: "" });
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);

  const promedio = resenas.length > 0
    ? (resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length).toFixed(1)
    : null;

  useEffect(() => {
    async function load() {
      const [{ data: r }, { data: { session } }] = await Promise.all([
        supabase.from("resenas").select("*, profiles!resenas_cliente_id_fkey(nombre, foto_url)").eq("barbero_id", barberoId).order("created_at", { ascending: false }),
        supabase.auth.getSession(),
      ]);
      setResenas((r as any) ?? []);
      if (session && session.user.id !== barberoId) { setEsCliente(true); setClienteId(session.user.id); const mia = (r as any)?.find((x: any) => session.user.id === x.cliente_id); if (mia) setMiResena(mia); }
      setLoading(false);
    }
    load();
  }, [barberoId]);

  async function guardarResena() {
    if (!clienteId) return;
    setSaving(true);
    const { data, error } = await supabase.from("resenas").upsert({
      barbero_id: barberoId, cliente_id: clienteId,
      calificacion: form.calificacion, comentario: form.comentario.trim() || null,
    }).select("*, profiles!resenas_cliente_id_fkey(nombre, foto_url)").single();
    if (!error && data) {
      setMiResena(data as any);
      setResenas(r => [data as any, ...r.filter(x => x.id !== (data as any).id)]);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function eliminarResena() {
    if (!clienteId || !miResena) return;
    await supabase.from("resenas").delete().eq("id", miResena.id);
    setResenas(r => r.filter(x => x.id !== miResena.id));
    setMiResena(null);
  }

  if (loading) return <div className="h-20 bg-[#111] rounded-3xl animate-pulse" />;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-['Bebas_Neue'] text-3xl text-white tracking-wide">RESEÑAS</h2>
          {promedio && (
            <div className="flex items-center gap-1.5 bg-[#0a1a0a] border border-[#1a3a1a] px-3 py-1 rounded-full">
              <span className="font-bold text-[#22c55e] text-sm">{promedio}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span className="text-[#444] text-xs">({resenas.length})</span>
            </div>
          )}
        </div>
        {esCliente && !miResena && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-[#22c55e] border border-[#1a3a1a] bg-[#0a1a0a] px-4 py-2 rounded-full active:scale-95 transition"
            style={{ WebkitTapHighlightColor: "transparent" }}>
            + Dejar reseña
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-5 mb-4">
          <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Tu calificación</p>
          <div className="flex gap-2 mb-4">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, calificacion: n }))}
                className="active:scale-90 transition" style={{ WebkitTapHighlightColor: "transparent" }}>
                <svg width="32" height="32" viewBox="0 0 24 24"
                  fill={n <= form.calificacion ? "#22c55e" : "none"}
                  stroke={n <= form.calificacion ? "#22c55e" : "#333"} strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <textarea className="textarea text-sm mb-3" rows={3}
            value={form.comentario} onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
            placeholder="¿Cómo fue tu experiencia? (opcional)" />
          <div className="flex gap-2">
            <button onClick={guardarResena} disabled={saving} className="btn-primary flex-1 text-sm">
              {saving ? "Guardando..." : "Publicar reseña"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mi reseña */}
      {miResena && (
        <div className="bg-[#0a1a0a] border border-[#1a3a1a] rounded-3xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#22c55e]">Tu reseña</p>
            <button onClick={eliminarResena} className="text-[10px] text-[#333] hover:text-red-400 transition">
              Eliminar
            </button>
          </div>
          <Estrellas n={miResena.calificacion} />
          {miResena.comentario && <p className="text-sm text-[#555] mt-2">{miResena.comentario}</p>}
        </div>
      )}

      {/* Lista */}
      {resenas.length === 0 ? (
        <div className="text-center py-8 bg-[#111] border border-[#1e1e1e] rounded-3xl">
          <p className="text-sm text-[#333]">Sin reseñas todavía</p>
          {esCliente && <p className="text-xs text-[#222] mt-1">¡Sé el primero en dejar una!</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {resenas.filter(r => !miResena || r.id !== miResena.id).map(r => (
            <div key={r.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">{r.profiles?.nombre ?? "Cliente"}</p>
                <Estrellas n={r.calificacion} size={13} />
              </div>
              {r.comentario && <p className="text-sm text-[#555] leading-relaxed">{r.comentario}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
