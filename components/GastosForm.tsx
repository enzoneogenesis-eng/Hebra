"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Home, Package, Zap, Users, Receipt, Megaphone, Wrench, MoreHorizontal, Banknote, CreditCard, Smartphone, ArrowLeftRight } from "lucide-react";
import type { Sucursal } from "@/types";

type Props = {
  marcaId: string;
  sucursales: Sucursal[];
  onClose: () => void;
  onSaved: () => void;
};

const CATEGORIAS = [
  { value: "alquiler",     label: "Alquiler",     icon: Home },
  { value: "productos",    label: "Productos",    icon: Package },
  { value: "servicios",    label: "Servicios",    icon: Zap },
  { value: "sueldos",      label: "Sueldos",      icon: Users },
  { value: "impuestos",    label: "Impuestos",    icon: Receipt },
  { value: "marketing",    label: "Marketing",    icon: Megaphone },
  { value: "mantenimiento",label: "Mantenimiento",icon: Wrench },
  { value: "otros",        label: "Otros",        icon: MoreHorizontal },
];

const METODOS = [
  { value: "efectivo",      label: "Efectivo",      icon: Banknote },
  { value: "transferencia", label: "Transferencia", icon: ArrowLeftRight },
  { value: "tarjeta",       label: "Tarjeta",       icon: CreditCard },
  { value: "mercadopago",   label: "MercadoPago",   icon: Smartphone },
];

export function GastosForm({ marcaId, sucursales, onClose, onSaved }: Props) {
  const [monto, setMonto]           = useState("");
  const [categoria, setCategoria]   = useState<string>("alquiler");
  const [metodo, setMetodo]         = useState<string>("efectivo");
  const [asignarA, setAsignarA]     = useState<"marca" | "sucursal">("marca");
  const [sucursalId, setSucursalId] = useState<string>(sucursales[0]?.id ?? "");
  const [fecha, setFecha]           = useState<string>(new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto.replace(",", "."));
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto valido mayor a 0.");
      return;
    }

    setSaving(true);

    const payload: any = {
      monto: montoNum,
      categoria,
      metodo_pago: metodo,
      fecha,
      descripcion: descripcion.trim() || null,
    };

    if (asignarA === "marca") {
      payload.marca_id = marcaId;
    } else {
      if (!sucursalId) {
        setError("Elegi una sucursal.");
        setSaving(false);
        return;
      }
      payload.sucursal_id = sucursalId;
    }

    const { error: insertError } = await supabase.from("gastos").insert(payload);

    if (insertError) {
      setError("No se pudo guardar: " + insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#2a2a2a] px-5 py-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">Nuevo gasto</h2>
          <button onClick={onClose} className="text-[#888] hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] font-semibold">$</span>
              <input type="text" inputMode="decimal" autoFocus value={monto}
                onChange={e => setMonto(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="0" required
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-8 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#1ed760]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-2">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS.map(c => {
                const Icon = c.icon;
                const active = categoria === c.value;
                return (
                  <button type="button" key={c.value} onClick={() => setCategoria(c.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition ${
                      active ? "bg-[#0a1a0a] border-[#1ed760] text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa] hover:border-[#3a3a3a]"
                    }`}>
                    <Icon size={14} /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-2">Asignar a</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setAsignarA("marca")}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-sm transition ${
                  asignarA === "marca" ? "bg-[#0a1a0a] border-[#1ed760] text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa]"
                }`}>
                Marca completa
              </button>
              <button type="button" onClick={() => setAsignarA("sucursal")}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-sm transition ${
                  asignarA === "sucursal" ? "bg-[#0a1a0a] border-[#1ed760] text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa]"
                }`}>
                Sucursal especifica
              </button>
            </div>
            {asignarA === "sucursal" && (
              <select value={sucursalId} onChange={e => setSucursalId(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]">
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-2">Metodo de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS.map(m => {
                const Icon = m.icon;
                const active = metodo === m.value;
                return (
                  <button type="button" key={m.value} onClick={() => setMetodo(m.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition ${
                      active ? "bg-[#0a1a0a] border-[#1ed760] text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa]"
                    }`}>
                    <Icon size={14} /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1.5">Descripcion (opcional)</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Alquiler abril sucursal centro" maxLength={200}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760]"
            />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-[#aaa] font-semibold hover:bg-[#1a1a1a]">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#1ed760] text-black font-bold hover:bg-[#1ed760]/90 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}