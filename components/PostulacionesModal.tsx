"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Check, XCircle, Eye, User, MessageSquare, Loader2 } from "lucide-react";
import type { Oferta, Profile } from "@/types";
import Link from "next/link";

type Props = {
  oferta: Oferta;
  onClose: () => void;
};

type PostulacionConBarbero = {
  id: string;
  oferta_id: string;
  barbero_id: string;
  mensaje: string | null;
  estado: string;
  created_at: string;
  barbero?: { id: string; nombre: string | null; foto_url: string | null; skills: string[] | null; ubicacion: string | null };
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#f59e0b",
  vista:     "#3b82f6",
  aceptada:  "#22c55e",
  rechazada: "#ef4444",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  vista:     "Vista",
  aceptada:  "Aceptada",
  rechazada: "Rechazada",
};

export function PostulacionesModal({ oferta, onClose }: Props) {
  const [posts, setPosts]     = useState<PostulacionConBarbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => { loadPostulaciones(); }, []);

  async function loadPostulaciones() {
    setLoading(true);
    const { data } = await supabase
      .from("postulaciones")
      .select("*, barbero:profiles!postulaciones_barbero_id_fkey(id, nombre, foto_url, skills, ubicacion)")
      .eq("oferta_id", oferta.id)
      .order("created_at", { ascending: false });
    setPosts((data ?? []) as any);
    setLoading(false);
  }

  async function cambiarEstado(postId: string, nuevoEstado: string) {
    setUpdating(postId);
    const { error } = await supabase.from("postulaciones").update({ estado: nuevoEstado }).eq("id", postId);
    setUpdating(null);
    if (error) { alert("No se pudo actualizar: " + error.message); return; }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, estado: nuevoEstado } : p));
  }

  function formatFecha(s: string): string {
    const d = new Date(s);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#2a2a2a] px-5 py-4 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1">
            <p className="text-[#888] text-[10px] uppercase tracking-wider">Postulantes</p>
            <h2 className="text-white text-lg font-bold truncate">{oferta.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-[#888] hover:text-white flex-shrink-0"><X size={20} /></button>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-[#888] text-sm py-8 text-center">Cargando postulaciones...</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <User size={36} className="text-[#333] mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Todavia no hay postulaciones</p>
              <p className="text-[#888] text-sm">Cuando algun barbero se postule, aparecera aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => {
                const color = ESTADO_COLOR[p.estado] ?? "#888";
                const label = ESTADO_LABEL[p.estado] ?? p.estado;
                const updating_this = updating === p.id;
                return (
                  <div key={p.id} className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#888] font-bold">
                        {p.barbero?.foto_url ? (
                          <img src={p.barbero.foto_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          (p.barbero?.nombre ?? "?").slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Link href={`/profile/${p.barbero_id}`} target="_blank"
                            className="text-white text-sm font-bold truncate hover:underline">
                            {p.barbero?.nombre ?? "Barbero"}
                          </Link>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0"
                            style={{ background: color + "22", color }}>
                            {label}
                          </span>
                        </div>
                        <p className="text-[#666] text-xs">
                          {p.barbero?.ubicacion ?? "-"} &middot; Postulado el {formatFecha(p.created_at)}
                        </p>
                        {p.barbero?.skills && p.barbero.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.barbero.skills.slice(0, 5).map(s => (
                              <span key={s} className="text-[10px] bg-[#0a0a0a] text-[#aaa] px-2 py-0.5 rounded-full border border-[#1a1a1a]">
                                {s}
                              </span>
                            ))}
                            {p.barbero.skills.length > 5 && (
                              <span className="text-[10px] text-[#666]">+{p.barbero.skills.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {p.mensaje && (
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 mb-3">
                        <p className="text-[10px] text-[#666] uppercase mb-1 flex items-center gap-1">
                          <MessageSquare size={10} /> Mensaje del postulante
                        </p>
                        <p className="text-[#ddd] text-sm">{p.mensaje}</p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/profile/${p.barbero_id}`} target="_blank"
                        className="flex items-center gap-1.5 text-xs text-[#aaa] px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:bg-[#1a1a1a] transition">
                        <Eye size={12} /> Ver perfil
                      </Link>

                      {p.estado !== "aceptada" && (
                        <button onClick={() => cambiarEstado(p.id, "aceptada")} disabled={updating_this}
                          className="flex items-center gap-1.5 text-xs text-black bg-[#1ed760] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1ed760]/90 transition disabled:opacity-50">
                          {updating_this ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Aceptar
                        </button>
                      )}

                      {p.estado !== "rechazada" && (
                        <button onClick={() => cambiarEstado(p.id, "rechazada")} disabled={updating_this}
                          className="flex items-center gap-1.5 text-xs text-red-400 border border-red-900/40 px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition disabled:opacity-50">
                          <XCircle size={12} /> Rechazar
                        </button>
                      )}

                      {p.estado === "pendiente" && (
                        <button onClick={() => cambiarEstado(p.id, "vista")} disabled={updating_this}
                          className="flex items-center gap-1.5 text-xs text-[#888] px-3 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition disabled:opacity-50">
                          Marcar vista
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}