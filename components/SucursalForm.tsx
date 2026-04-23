"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { X, Camera, Store, MapPin, Phone, Clock } from "lucide-react";
import type { Sucursal } from "@/types";

type Props = {
  marcaId: string;
  sucursal?: Sucursal;
  onSave: (s: Sucursal) => void;
  onClose: () => void;
};

export function SucursalForm({ marcaId, sucursal, onSave, onClose }: Props) {
  const isEdit = !!sucursal;
  const [nombre, setNombre]         = useState(sucursal?.nombre ?? "");
  const [direccion, setDireccion]   = useState(sucursal?.direccion ?? "");
  const [ciudad, setCiudad]         = useState(sucursal?.ciudad ?? "");
  const [telefono, setTelefono]     = useState(sucursal?.telefono ?? "");
  const [horario, setHorario]       = useState(sucursal?.horario_texto ?? "");
  const [fotoUrl, setFotoUrl]       = useState(sucursal?.foto_url ?? null);
  const [fotoFile, setFotoFile]     = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [err, setErr]               = useState<string | null>(null);

  function pickFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErr("La foto no puede pesar más de 5 MB");
      return;
    }
    setErr(null);
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function uploadFoto(sucursalId: string, file: File): Promise<string | null> {
    const ext  = file.name.split(".").pop();
    const path = `${sucursalId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("sucursales").upload(path, file, { upsert: true });
    if (error) { console.error("upload foto sucursal", error); return null; }
    const { data } = supabase.storage.from("sucursales").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    if (!nombre.trim()) { setErr("El nombre es obligatorio"); return; }
    setSaving(true);
    setErr(null);

    try {
      if (isEdit && sucursal) {
        // EDIT: update campos simples, opcional upload foto nueva
        let nuevaFoto = fotoUrl;
        if (fotoFile) {
          nuevaFoto = await uploadFoto(sucursal.id, fotoFile);
        }
        const { data, error } = await supabase
          .from("sucursales")
          .update({
            nombre: nombre.trim(),
            direccion: direccion.trim() || null,
            ciudad: ciudad.trim() || null,
            telefono: telefono.trim() || null,
            horario_texto: horario.trim() || null,
            foto_url: nuevaFoto,
          })
          .eq("id", sucursal.id)
          .select()
          .single();
        if (error) throw error;
        onSave(data as Sucursal);
      } else {
        // CREATE: 1) insert sin foto, 2) si hay foto subirla, 3) update foto_url
        const { data: inserted, error: insErr } = await supabase
          .from("sucursales")
          .insert({
            marca_id: marcaId,
            nombre: nombre.trim(),
            direccion: direccion.trim() || null,
            ciudad: ciudad.trim() || null,
            telefono: telefono.trim() || null,
            horario_texto: horario.trim() || null,
          })
          .select()
          .single();
        if (insErr) throw insErr;

        let finalData = inserted as Sucursal;
        if (fotoFile && inserted) {
          const pubUrl = await uploadFoto((inserted as Sucursal).id, fotoFile);
          if (pubUrl) {
            const { data: updated } = await supabase
              .from("sucursales")
              .update({ foto_url: pubUrl })
              .eq("id", (inserted as Sucursal).id)
              .select()
              .single();
            if (updated) finalData = updated as Sucursal;
          }
        }
        onSave(finalData);
      }
      onClose();
    } catch (e: any) {
      console.error("save sucursal", e);
      setErr(e?.message ?? "Error al guardar la sucursal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl w-full max-w-lg my-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-[#22c55e]" />
            <h2 className="text-white font-semibold">{isEdit ? "Editar sucursal" : "Nueva sucursal"}</h2>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition" style={{ WebkitTapHighlightColor: "transparent" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Foto */}
          <div>
            <label className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-2 block">Foto / logo</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#111] border border-[#1e1e1e] relative flex-shrink-0">
                {(fotoPreview || fotoUrl) ? (
                  <Image src={fotoPreview ?? fotoUrl ?? ""} alt="Foto sucursal" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333]">
                    <Store size={24} />
                  </div>
                )}
              </div>
              <div>
                <label className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-2">
                  <Camera size={13} /> Elegir foto
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFoto} />
                </label>
                <p className="text-[#333] text-[10px] mt-1">JPG, PNG, WEBP · máx 5 MB</p>
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1 block">Nombre *</label>
            <input
              className="input w-full"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nahuel the Barber · Zapiola"
              maxLength={80}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1 block flex items-center gap-1.5">
              <MapPin size={10} /> Dirección
            </label>
            <input
              className="input w-full"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Zapiola 1234"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1 block">Ciudad / Barrio</label>
            <input
              className="input w-full"
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              placeholder="Bernal"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1 block flex items-center gap-1.5">
              <Phone size={10} /> Teléfono
            </label>
            <input
              className="input w-full"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="11 5555-1234"
            />
          </div>

          {/* Horario */}
          <div>
            <label className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1 block flex items-center gap-1.5">
              <Clock size={10} /> Horario
            </label>
            <input
              className="input w-full"
              value={horario}
              onChange={e => setHorario(e.target.value)}
              placeholder="Lun a Sab · 10 a 20 hs"
            />
          </div>

          {err && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl p-3">
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1a1a1a] flex gap-2">
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1 text-sm" style={{ WebkitTapHighlightColor: "transparent" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !nombre.trim()} className="btn-primary flex-1 text-sm" style={{ WebkitTapHighlightColor: "transparent" }}>
            {saving ? "Guardando…" : (isEdit ? "Guardar cambios" : "Crear sucursal")}
          </button>
        </div>
      </div>
    </div>
  );
}