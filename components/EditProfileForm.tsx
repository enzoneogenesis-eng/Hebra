"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Camera, Save, Sparkles } from "lucide-react";
import { SkillsPicker } from "./SkillsPicker";
import { CiudadSelector } from "./CiudadSelector";
import { CIUDADES } from "@/lib/ciudades";
import type { Profile } from "@/types";

// Encuentra el value canónico si la ubicacion guardada matchea alguna ciudad
function findCiudadValue(ubicacion: string | null): string {
  if (!ubicacion) return "";
  const match = CIUDADES.find(c =>
    c.value === ubicacion ||
    c.aliases.some(a => ubicacion.toLowerCase().includes(a))
  );
  return match ? match.value : ubicacion;
}

export function EditProfileForm({ profile, onUpdate }: { profile: Profile; onUpdate?: () => void }) {
  const [form, setForm] = useState({
    nombre:    profile.nombre,
    bio:       profile.bio       ?? "",
    telefono:  profile.telefono  ?? "",
    instagram: profile.instagram ?? "",
  });
  const [ciudad, setCiudad]       = useState(findCiudadValue(profile.ubicacion));
  const [skills, setSkills]       = useState<string[]>(profile.skills ?? []);
  const [fotoUrl, setFotoUrl]     = useState(profile.foto_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ type: "ok"|"err"; text: string } | null>(null);
  const [generandoBio, setGenerandoBio] = useState(false);

  async function generarBio() {
    if (!form.nombre || !form.nombre.trim()) {
      setMsg({ type: "err", text: "Poné tu nombre antes de generar la bio" });
      return;
    }
    setGenerandoBio(true);
    setMsg(null);
    try {
      const { count } = await supabase
        .from("trabajos")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const res = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          tipo: profile.tipo,
          ubicacion: ciudad || null,
          skills: skills,
          cantidadTrabajos: count ?? 0,
          notas: form.bio || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setForm(f => ({ ...f, bio: data.bio }));
      setMsg({ type: "ok", text: form.bio ? "Bio mejorada a partir de tus notas. Editala si queres." : "Bio generada. Editala antes de guardar." });
    } catch (e: any) {
      setMsg({ type: "err", text: e.message ?? "No se pudo generar la bio" });
    } finally {
      setGenerandoBio(false);
    }
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ foto_url: data.publicUrl }).eq("id", profile.id);
      setFotoUrl(data.publicUrl);
      setMsg({ type: "ok", text: "Foto actualizada." });
      onUpdate?.();
    } else {
      setMsg({ type: "err", text: "Error al subir la foto." });
    }
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const ciudadLabel = CIUDADES.find(c => c.value === ciudad)?.label ?? ciudad;
    const { error } = await supabase.from("profiles").update({
      nombre:    form.nombre,
      bio:       form.bio       || null,
      ubicacion: ciudadLabel    || null,
      telefono:  form.telefono  || null,
      instagram: form.instagram || null,
      skills:    skills.length > 0 ? skills : null,
    }).eq("id", profile.id);
    setMsg(error
      ? { type: "err", text: "Error al guardar." }
      : { type: "ok",  text: "¡Perfil actualizado!" }
    );
    if (!error) onUpdate?.();
    setSaving(false);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bg-[#111] rounded-3xl border border-[#1e1e1e] p-6 mb-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <h2 className="font-['Bebas_Neue'] text-2xl text-white mb-5 tracking-wide">EDITAR PERFIL</h2>

      {/* Foto */}
      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#1a1a1a]">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#f5f5f5] flex-shrink-0">
          {fotoUrl
            ? <Image src={fotoUrl} alt="foto" fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#ccc]">{form.nombre[0]}</div>
          }
        </div>
        <div>
          <label className="btn-secondary text-xs cursor-pointer flex items-center gap-2 mb-1">
            <Camera size={13} />{uploading ? "Subiendo…" : "Cambiar foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFoto} disabled={uploading} />
          </label>
          <p className="text-[#333] text-xs">JPG, PNG · máx 8 MB</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Nombre</label>
          <input className="input" value={form.nombre} onChange={set("nombre")} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">WhatsApp</label>
            <input className="input" type="tel" value={form.telefono} onChange={set("telefono")} placeholder="+54 11 1234-5678" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Instagram</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] text-sm">@</span>
              <input className="input pl-8" value={form.instagram}
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value.replace("@", "") }))}
                placeholder="tuusuario" />
            </div>
          </div>
        </div>

        {/* Ciudad — selector normalizado */}
        <div>
          <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Ciudad</label>
          <CiudadSelector value={ciudad} onChange={setCiudad} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest">Bio</label>
            <button type="button" onClick={generarBio} disabled={generandoBio}
              className="flex items-center gap-1 text-[10px] font-bold text-[#22c55e] border border-[#1a3a1a] bg-[#0a1a0a] px-2 py-1 rounded-full active:scale-95 transition disabled:opacity-50"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <Sparkles size={11} />
              {generandoBio ? "Generando..." : "Generar con IA"}
            </button>
          </div>
          <textarea className="textarea" rows={3} value={form.bio} onChange={set("bio")}
            placeholder="Contá sobre tu experiencia, especialidad y estilo…" />
        </div>

        {/* Skills */}
        <div className="pt-2 border-t border-[#1a1a1a]">
          <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-4">Especialidades</label>
          <SkillsPicker selected={skills} onChange={setSkills} />
        </div>

        {msg && (
          <p className={`text-sm px-4 py-3 rounded-2xl ${msg.type === "ok" ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}>
            {msg.text}
          </p>
        )}

        <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center py-3" disabled={saving}>
          <Save size={14} />{saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
