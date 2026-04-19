"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, ImagePlus } from "lucide-react";
import type { Trabajo } from "@/types";

interface Props {
  userId: string;
  onSubido?: (trabajo: Trabajo) => void;
  onUpload?: () => void;
}

export function SubirTrabajo({ userId, onSubido, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [descripcion, setDesc]    = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file);
    if (upErr) { setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
    const { data } = await supabase.from("trabajos").insert({
      user_id: userId, imagen_url: publicUrl, descripcion: descripcion.trim() || null,
    }).select("*").single();
    if (data) { onSubido?.(data as Trabajo); onUpload?.(); }
    setDesc(""); setUploading(false);
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <ImagePlus size={16} className="text-[#22c55e]" />
        <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Subir foto al portfolio</p>
      </div>

      <input
        className="w-full bg-[#0a0a0a] border border-[#1e1e1e] text-white text-sm rounded-xl px-4 py-3 mb-3 placeholder:text-[#444] focus:outline-none focus:border-[#22c55e]/40 transition-colors"
        value={descripcion}
        onChange={e => setDesc(e.target.value)}
        placeholder="Descripción del corte (opcional)"
      />

      <label
        className={`
          w-full cursor-pointer flex items-center justify-center gap-2
          rounded-xl py-3.5 text-sm font-semibold
          transition-all
          ${uploading
            ? "bg-[#1e1e1e] text-[#666] cursor-wait"
            : "bg-[#22c55e] text-black hover:bg-[#16a34a]"}
        `}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Upload size={16} />
        {uploading ? "Subiendo..." : "Elegir foto para subir"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>

      <p className="text-[10px] text-[#444] mt-3 text-center">
        JPG o PNG · hasta 8 MB
      </p>
    </div>
  );
}