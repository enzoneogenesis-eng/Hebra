"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Heart, Star, TrendingUp } from "lucide-react";

interface Stats {
  visitasHoy: number;
  visitasSemana: number;
  visitasMes: number;
  favoritos: number;
  resenas: number;
  promedio: string | null;
  postulaciones: number;
}

export function EstadisticasBarbero({ barberoId }: { barberoId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ahora = new Date();
      const hoy      = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
      const semana   = new Date(ahora.getTime() - 7  * 86400000).toISOString();
      const mes      = new Date(ahora.getTime() - 30 * 86400000).toISOString();

      const [
        { count: visitasMes },
        { count: visitasSemana },
        { count: visitasHoy },
        { count: favoritos },
        { data: resenas },
        { count: postulaciones },
      ] = await Promise.all([
        supabase.from("visitas").select("*", { count: "exact", head: true }).eq("barbero_id", barberoId).gte("created_at", mes),
        supabase.from("visitas").select("*", { count: "exact", head: true }).eq("barbero_id", barberoId).gte("created_at", semana),
        supabase.from("visitas").select("*", { count: "exact", head: true }).eq("barbero_id", barberoId).gte("created_at", hoy),
        supabase.from("favoritos").select("*", { count: "exact", head: true }).eq("barbero_id", barberoId),
        supabase.from("resenas").select("calificacion").eq("barbero_id", barberoId),
        supabase.from("postulaciones").select("*", { count: "exact", head: true }).eq("barbero_id", barberoId),
      ]);

      const prom = resenas && resenas.length > 0
        ? (resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length).toFixed(1)
        : null;

      setStats({
        visitasHoy:     visitasHoy ?? 0,
        visitasSemana:  visitasSemana ?? 0,
        visitasMes:     visitasMes ?? 0,
        favoritos:      favoritos ?? 0,
        resenas:        resenas?.length ?? 0,
        promedio:       prom,
        postulaciones:  postulaciones ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [barberoId]);

  if (loading) return (
    <div className="grid grid-cols-2 gap-3 mb-6 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-[#111] rounded-2xl border border-[#1e1e1e]" />)}
    </div>
  );

  if (!stats) return null;

  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Tu actividad</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Visitas */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={14} className="text-[#333]" />
            <span className="text-[10px] text-[#444] uppercase tracking-wider">Visitas</span>
          </div>
          <p className="font-['Bebas_Neue'] text-3xl text-white">{stats.visitasMes}</p>
          <p className="text-[10px] text-[#333] mt-0.5">últimos 30 días</p>
          <div className="flex gap-3 mt-2">
            <span className="text-[10px] text-[#444]">Hoy: <span className="text-[#22c55e] font-semibold">{stats.visitasHoy}</span></span>
            <span className="text-[10px] text-[#444]">Semana: <span className="text-white font-semibold">{stats.visitasSemana}</span></span>
          </div>
        </div>

        {/* Favoritos */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-[#333]" />
            <span className="text-[10px] text-[#444] uppercase tracking-wider">Favoritos</span>
          </div>
          <p className="font-['Bebas_Neue'] text-3xl text-white">{stats.favoritos}</p>
          <p className="text-[10px] text-[#333] mt-0.5">clientes te guardaron</p>
        </div>

        {/* Calificación */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-[#333]" />
            <span className="text-[10px] text-[#444] uppercase tracking-wider">Calificación</span>
          </div>
          {stats.promedio ? (
            <>
              <p className="font-['Bebas_Neue'] text-3xl text-[#22c55e]">{stats.promedio}</p>
              <p className="text-[10px] text-[#333] mt-0.5">{stats.resenas} reseña{stats.resenas !== 1 ? "s" : ""}</p>
            </>
          ) : (
            <>
              <p className="font-['Bebas_Neue'] text-3xl text-[#222]">—</p>
              <p className="text-[10px] text-[#333] mt-0.5">Sin reseñas aún</p>
            </>
          )}
        </div>

        {/* Postulaciones */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-[#333]" />
            <span className="text-[10px] text-[#444] uppercase tracking-wider">Postulaciones</span>
          </div>
          <p className="font-['Bebas_Neue'] text-3xl text-white">{stats.postulaciones}</p>
          <p className="text-[10px] text-[#333] mt-0.5">a salones enviadas</p>
        </div>
      </div>
    </div>
  );
}
