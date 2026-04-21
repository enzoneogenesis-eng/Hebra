import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { MapPin, ArrowRight } from "lucide-react";

async function getDestacados() {
  const { data } = await supabase
    .from("profiles")
    .select("id, nombre, foto_url, city, skills, bio, tipo")
    .or("is_barbero.eq.true,is_dueno.eq.true")
    .not("foto_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export async function ProfilePreview() {
  const destacados = await getDestacados();

  if (destacados.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-8 md:mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest mb-2">Destacados</p>
          <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl text-white leading-tight">
            BARBEROS REALES.<br />
            <span className="text-[#22c55e]">TRABAJO REAL.</span>
          </h2>
        </div>
        <Link
          href="/search"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#22c55e] hover:gap-2 transition-all whitespace-nowrap"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destacados.map((p) => (
          <Link
            key={p.id}
            href={`/profile/${p.id}`}
            className="group bg-[#111] border border-[#1e1e1e] rounded-3xl overflow-hidden hover:border-[#22c55e]/40 transition-all"
          >
            <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
              {p.foto_url ? (
                <Image
                  src={p.foto_url}
                  alt={p.nombre ?? "Barbero"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#22c55e] text-black font-['Bebas_Neue'] text-7xl">
                  {(p.nombre ?? "?")[0]}
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest bg-black/60 backdrop-blur border border-[#22c55e]/20 px-2.5 py-1 rounded-full">
                  Barbero
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-['Bebas_Neue'] text-2xl text-white leading-tight mb-1">
                {p.nombre ?? "Barbero"}
              </h3>
              {p.city && (
                <div className="flex items-center gap-1.5 text-xs text-[#666] mb-3">
                  <MapPin size={12} />
                  <span>{p.city}</span>
                </div>
              )}
              {p.bio && (
                <p className="text-sm text-[#888] leading-relaxed mb-4 line-clamp-2">
                  {p.bio}
                </p>
              )}
              {Array.isArray(p.skills) && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.skills.slice(0, 3).map((s: string, i: number) => (
                    <span key={i} className="text-[10px] text-[#22c55e] border border-[#22c55e]/20 bg-[#22c55e]/5 px-2 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                  {p.skills.length > 3 && (
                    <span className="text-[10px] text-[#444] px-2 py-1">
                      +{p.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#22c55e] group-hover:gap-2 transition-all">
                Ver perfil <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 sm:hidden text-center">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22c55e]"
        >
          Ver todos los barberos <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}