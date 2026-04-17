import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/types";

const tipoLabel: Record<string, string> = { barbero: "Barbero", salon: "Salón", cliente: "Cliente" };

// Colores de fondo por inicial
function getBgColor(nombre: string): string {
  const colors = ["#1a2a1a","#1a1a2a","#2a1a1a","#1a2a2a","#2a2a1a","#1a1a1a"];
  return colors[nombre.charCodeAt(0) % colors.length];
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link href={`/profile/${profile.id}`}
      className="group bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden active:scale-95 transition-all duration-200 block hover:border-[#333]"
      style={{ WebkitTapHighlightColor: "transparent" }}>

      <div className="relative aspect-square overflow-hidden" style={{ background: getBgColor(profile.nombre) }}>
        {profile.foto_url ? (
          <Image src={profile.foto_url} alt={profile.nombre} fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-['Bebas_Neue'] text-6xl text-[#22c55e] opacity-60">
              {profile.nombre[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {tipoLabel[profile.tipo]}
          </span>
        </div>
        {profile.telefono && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="black">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            </svg>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-white text-sm leading-tight mb-0.5 truncate">{profile.nombre}</h3>
        {profile.ubicacion && (
          <p className="text-[11px] text-[#555] truncate flex items-center gap-1 mb-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {profile.ubicacion}
          </p>
        )}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] font-medium bg-[#1a1a1a] text-[#666] px-2 py-0.5 rounded-full border border-[#222]">{s}</span>
            ))}
            {profile.skills.length > 2 && (
              <span className="text-[10px] text-[#333] px-1">+{profile.skills.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
