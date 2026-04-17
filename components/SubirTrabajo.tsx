"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";
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
    <div className="bg-white border border-[#ebebeb] rounded-3xl p-4 mb-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-3">Subir foto al portfolio</p>
      <input className="input mb-3 text-sm" value={descripcion} onChange={e => setDesc(e.target.value)}
        placeholder="Descripción del corte (opcional)" />
      <label className="btn-secondary w-full cursor-pointer flex items-center gap-2 justify-center"
        style={{ WebkitTapHighlightColor: "transparent" }}>
        <Upload size={15} />
        {uploading ? "Subiendo…" : "Elegir foto"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}
