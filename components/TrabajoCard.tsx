import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Trabajo } from "@/types";

export function TrabajoCard({ trabajo }: { trabajo: Trabajo }) {
  return (
    <article className="card overflow-hidden group">
      <div className="aspect-square relative bg-ink-100">
        <Image src={trabajo.imagen_url} alt={trabajo.descripcion ?? "Trabajo"} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
        {trabajo.descripcion && (
          <div className="absolute inset-0 bg-ink-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <p className="text-white text-xs line-clamp-3">{trabajo.descripcion}</p>
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-ink-300 text-xs">{formatDate(trabajo.created_at)}</p>
      </div>
    </article>
  );
}
