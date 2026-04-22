"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Store, MapPin, Users, ChevronRight, Search } from "lucide-react";

type SucursalLite = {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  foto_url: string | null;
};

type MarcaConSucursales = {
  id: string;
  nombre: string;
  logo_url: string | null;
  owner_id: string;
  sucursales: SucursalLite[];
};

export function ExplorarSalones() {
  const [marcas, setMarcas]     = useState<MarcaConSucursales[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("marcas")
      .select("id, nombre, logo_url, owner_id, sucursales(id, nombre, direccion, ciudad, foto_url, activa)")
      .order("nombre", { ascending: true });

    const mapped: MarcaConSucursales[] = (data ?? []).map((m: any) => ({
      ...m,
      sucursales: (m.sucursales ?? []).filter((s: any) => s.activa),
    })).filter(m => m.sucursales.length > 0);

    setMarcas(mapped);
    setLoading(false);
  }

  const marcasFiltradas = query.trim().length > 0
    ? marcas.filter(m =>
        m.nombre.toLowerCase().includes(query.toLowerCase()) ||
        m.sucursales.some(s =>
          s.nombre.toLowerCase().includes(query.toLowerCase()) ||
          (s.ciudad ?? "").toLowerCase().includes(query.toLowerCase()) ||
          (s.direccion ?? "").toLowerCase().includes(query.toLowerCase())
        )
      )
    : marcas;

  return (
    <div className="min-h-screen bg-black pt-16 pb-20 md:pb-10">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-['Bebas_Neue'] text-4xl md:text-5xl text-white tracking-wide">SALONES</h1>
          <p className="text-[#888] text-sm mt-1">Encontra el salon perfecto en tu zona.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o ciudad..."
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 bg-[#141414] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : marcasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <Store size={40} className="text-[#333] mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No encontramos salones</p>
            <p className="text-[#888] text-sm">Proba con otra busqueda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {marcasFiltradas.map(m => (
              <div key={m.id} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                {/* Header marca */}
                <div className="p-5 border-b border-[#1a1a1a] flex items-center gap-4">
                  {m.logo_url ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#2a2a2a] flex-shrink-0">
                      <img src={m.logo_url} alt={m.nombre} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                      <Store size={24} className="text-[#666]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white text-lg font-bold truncate">{m.nombre}</h2>
                    <p className="text-[#888] text-xs">
                      {m.sucursales.length} sucursal{m.sucursales.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>

                {/* Sucursales */}
                <div className="divide-y divide-[#1a1a1a]">
                  {m.sucursales.map(s => {
                    const nombreCorto = s.nombre.replace(/^.*?- /, "");
                    return (
                      <Link key={s.id} href={`/sucursal/${s.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-[#0f0f0f] transition active:bg-[#0a0a0a]">
                        <div className="w-14 h-14 rounded-lg bg-[#0a0a0a] overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {s.foto_url ? (
                            <img src={s.foto_url} alt={s.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <MapPin size={20} className="text-[#444]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold truncate">{nombreCorto}</p>
                          <p className="text-[#888] text-xs truncate">
                            {s.direccion}{s.ciudad ? ", " + s.ciudad : ""}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-[#666] flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA secundario: buscar barberos */}
        <div className="mt-10 bg-[#0a1a0a]/50 border border-[#1ed760]/20 rounded-2xl p-5 text-center">
          <Users size={24} className="text-[#1ed760] mx-auto mb-2" />
          <p className="text-white font-semibold mb-1">Buscas un barbero especifico?</p>
          <p className="text-[#888] text-sm mb-3">Explora barberos individuales y su trabajo.</p>
          <Link href="/search" className="inline-block bg-[#1ed760] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#1ed760]/90 transition">
            Buscar barberos
          </Link>
        </div>
      </div>
    </div>
  );
}