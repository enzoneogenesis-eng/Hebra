"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, Plus, Users, Eye, Trash2, MapPin } from "lucide-react";
import type { Profile, Oferta } from "@/types";
import { OfertaForm } from "./OfertaForm";
import { PostulacionesModal } from "./PostulacionesModal";

type OfertaConCount = Oferta & { postulaciones_count: number };

export function DashboardOfertas({ profile }: { profile: Profile }) {
  const [ofertas, setOfertas]     = useState<OfertaConCount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [viendoPost, setViendoPost] = useState<Oferta | null>(null);

  useEffect(() => { loadOfertas(); }, []);

  async function loadOfertas() {
    setLoading(true);
    const { data } = await supabase
      .from("ofertas")
      .select("*, postulaciones(count)")
      .eq("salon_id", profile.id)
      .order("created_at", { ascending: false });

    const mapped: OfertaConCount[] = (data ?? []).map((o: any) => ({
      ...o,
      postulaciones_count: o.postulaciones?.[0]?.count ?? 0,
    }));
    setOfertas(mapped);
    setLoading(false);
  }

  async function handleDelete(ofertaId: string) {
    if (!confirm("Eliminar esta oferta? Se perderan las postulaciones asociadas.")) return;
    const { error } = await supabase.from("ofertas").delete().eq("id", ofertaId);
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    setOfertas(prev => prev.filter(o => o.id !== ofertaId));
  }

  async function toggleActiva(o: OfertaConCount) {
    const { error } = await supabase.from("ofertas").update({ activa: !o.activa }).eq("id", o.id);
    if (error) { alert("No se pudo actualizar: " + error.message); return; }
    setOfertas(prev => prev.map(x => x.id === o.id ? { ...x, activa: !x.activa } : x));
  }

  const activas = useMemo(() => ofertas.filter(o => o.activa), [ofertas]);
  const totalPostulaciones = useMemo(() => ofertas.reduce((a, o) => a + o.postulaciones_count, 0), [ofertas]);

  if (loading) return <div className="text-[#888] text-sm py-10 text-center">Cargando ofertas...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider">Reclutamiento</p>
          <h2 className="text-white text-2xl font-bold">Ofertas de trabajo</h2>
          <p className="text-[#888] text-sm mt-1">Publica busquedas y recibi postulaciones de barberos en Hebra.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#1ed760] text-black font-bold px-4 py-2.5 rounded-xl hover:bg-[#1ed760]/90 transition active:scale-95">
          <Plus size={16} /> Nueva oferta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Briefcase size={16} /> <span className="uppercase tracking-wider">Ofertas activas</span>
          </div>
          <p className="text-2xl font-bold text-white">{activas.length}</p>
          <p className="text-xs text-[#666] mt-1">de {ofertas.length} total</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Users size={16} /> <span className="uppercase tracking-wider">Postulaciones</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalPostulaciones}</p>
          <p className="text-xs text-[#666] mt-1">recibidas en total</p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#888] text-xs mb-2">
            <Eye size={16} /> <span className="uppercase tracking-wider">Visible en</span>
          </div>
          <p className="text-2xl font-bold text-white">Busquedas</p>
          <p className="text-xs text-[#666] mt-1">de todos los barberos</p>
        </div>
      </div>

      {/* Listado */}
      {ofertas.length === 0 ? (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-10 text-center">
          <Briefcase size={36} className="text-[#333] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Todavia no publicaste ninguna oferta</p>
          <p className="text-[#888] text-sm mb-4">Publica una busqueda y dejá que los barberos te encuentren.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#1ed760] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#1ed760]/90 transition">
            <Plus size={16} /> Publicar oferta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {ofertas.map(o => (
            <div key={o.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold truncate">{o.titulo}</h3>
                    {o.activa ? (
                      <span className="text-[9px] font-bold bg-[#1ed760]/20 text-[#1ed760] px-1.5 py-0.5 rounded-full uppercase">Activa</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-[#333] text-[#888] px-1.5 py-0.5 rounded-full uppercase">Pausada</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[#888] text-xs mb-2">
                    {o.ciudad && <span className="flex items-center gap-1"><MapPin size={11} /> {o.ciudad}</span>}
                    {(o as any).tipo_empleo && <span>{(o as any).tipo_empleo}</span>}
                  </div>
                  {o.descripcion && <p className="text-[#aaa] text-sm line-clamp-2">{o.descripcion}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleActiva(o)}
                    className="text-[#888] hover:text-white p-2 rounded-lg hover:bg-[#1a1a1a] transition text-xs"
                    title={o.activa ? "Pausar" : "Activar"}>
                    {o.activa ? "Pausar" : "Activar"}
                  </button>
                  <button onClick={() => handleDelete(o.id)}
                    className="text-[#888] hover:text-red-400 p-2 rounded-lg hover:bg-[#1a1a1a] transition"
                    title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Postulaciones footer */}
              <button onClick={() => setViendoPost(o)}
                className="w-full flex items-center justify-between text-sm bg-[#0a0a0a] hover:bg-[#111] border border-[#1a1a1a] rounded-lg px-4 py-2.5 transition">
                <span className="flex items-center gap-2 text-[#aaa]">
                  <Users size={14} />
                  {o.postulaciones_count} postulaci{o.postulaciones_count !== 1 ? "ones" : "on"}
                </span>
                <span className="text-[#1ed760] text-xs font-semibold">Ver postulantes</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OfertaForm
          salonId={profile.id}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadOfertas(); }}
        />
      )}

      {viendoPost && (
        <PostulacionesModal
          oferta={viendoPost}
          onClose={() => setViendoPost(null)}
        />
      )}
    </div>
  );
}