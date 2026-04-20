"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Clock, Save } from "lucide-react";
import type { Profile, Disponibilidad } from "@/types";
import { generarSlots } from "@/lib/turnos";

const DIAS = [
  { num: 1, label: "Lun" },
  { num: 2, label: "Mar" },
  { num: 3, label: "Mie" },
  { num: 4, label: "Jue" },
  { num: 5, label: "Vie" },
  { num: 6, label: "Sab" },
  { num: 7, label: "Dom" },
];

const DURACIONES = [15, 30, 45, 60];

export function AgendaBarbero({ profile }: { profile: Profile }) {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ type: "ok"|"err"; text: string } | null>(null);

  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5]);
  const [horaInicio, setHoraInicio] = useState("10:00");
  const [horaFin, setHoraFin]       = useState("20:00");
  const [duracion, setDuracion]     = useState(30);

  // Cargar disponibilidad existente
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("disponibilidad")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (data) {
        setDiasSemana(data.dias_semana);
        setHoraInicio(data.hora_inicio.substring(0, 5));
        setHoraFin(data.hora_fin.substring(0, 5));
        setDuracion(data.duracion_min);
      }
      setLoading(false);
    }
    load();
  }, [profile.id]);

  function toggleDia(num: number) {
    setDiasSemana(prev =>
      prev.includes(num) ? prev.filter(d => d !== num) : [...prev, num].sort()
    );
  }

  async function guardar() {
    if (diasSemana.length === 0) {
      setMsg({ type: "err", text: "Elegi al menos un dia de la semana" });
      return;
    }
    if (horaInicio >= horaFin) {
      setMsg({ type: "err", text: "La hora de fin debe ser despues de la de inicio" });
      return;
    }
    setSaving(true);
    setMsg(null);

    const { error } = await supabase
      .from("disponibilidad")
      .upsert({
        user_id: profile.id,
        dias_semana: diasSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        duracion_min: duracion,
        actualizado_en: new Date().toISOString(),
      }, { onConflict: "user_id" });

    setSaving(false);
    if (error) {
      setMsg({ type: "err", text: "Error al guardar: " + error.message });
    } else {
      setMsg({ type: "ok", text: "Agenda guardada correctamente" });
    }
  }

  // Preview de slots por dia
  const previewDisp: Disponibilidad = {
    id: "",
    user_id: profile.id,
    dias_semana: diasSemana,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    duracion_min: duracion,
  };
  const slotsPorDia = diasSemana.length > 0
    ? generarSlots(previewDisp, (() => {
        const d = new Date();
        while (!diasSemana.includes(d.getDay() === 0 ? 7 : d.getDay())) {
          d.setDate(d.getDate() + 1);
        }
        return d;
      })()).length
    : 0;

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl p-8 text-center text-[#666]">
        Cargando agenda...
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="text-[#1ed760]" size={24} />
        <h2 className="text-white text-xl font-bold">Configura tu agenda</h2>
      </div>

      {/* Dias de la semana */}
      <div className="mb-6">
        <label className="block text-[#888] text-xs uppercase tracking-wider mb-3">
          Dias que atendes
        </label>
        <div className="flex flex-wrap gap-2">
          {DIAS.map(d => {
            const activo = diasSemana.includes(d.num);
            return (
              <button
                key={d.num}
                onClick={() => toggleDia(d.num)}
                className={`w-12 h-12 rounded-full font-semibold text-sm transition ${
                  activo
                    ? "bg-[#1ed760] text-black"
                    : "bg-[#222] text-[#666] hover:bg-[#2a2a2a]"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horario */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#888] text-xs uppercase tracking-wider mb-2">
            Hora inicio
          </label>
          <input
            type="time"
            value={horaInicio}
            onChange={e => setHoraInicio(e.target.value)}
            className="w-full bg-[#0a0a0a] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-[#1ed760] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#888] text-xs uppercase tracking-wider mb-2">
            Hora fin
          </label>
          <input
            type="time"
            value={horaFin}
            onChange={e => setHoraFin(e.target.value)}
            className="w-full bg-[#0a0a0a] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-[#1ed760] focus:outline-none"
          />
        </div>
      </div>

      {/* Duracion */}
      <div className="mb-6">
        <label className="block text-[#888] text-xs uppercase tracking-wider mb-3">
          Duracion por turno
        </label>
        <div className="flex gap-2">
          {DURACIONES.map(min => (
            <button
              key={min}
              onClick={() => setDuracion(min)}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                duracion === min
                  ? "bg-[#1ed760] text-black"
                  : "bg-[#222] text-[#666] hover:bg-[#2a2a2a]"
              }`}
            >
              {min} min
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {diasSemana.length > 0 && (
        <div className="mb-6 p-4 bg-[#0a0a0a] rounded-xl border border-[#222]">
          <div className="flex items-start gap-2 text-[#888] text-sm">
            <Clock className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              Atendes <span className="text-white font-medium">{diasSemana.length} dias</span> por semana,
              de <span className="text-white font-medium">{horaInicio}</span> a <span className="text-white font-medium">{horaFin}</span>.
              <br />
              Aprox <span className="text-[#1ed760] font-medium">{slotsPorDia} turnos</span> por dia de {duracion} minutos.
            </div>
          </div>
        </div>
      )}

      {/* Mensaje */}
      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${
          msg.type === "ok" ? "bg-[#1ed760]/10 text-[#1ed760]" : "bg-red-500/10 text-red-400"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Boton guardar */}
      <button
        onClick={guardar}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-[#1ed760] hover:bg-[#1ed760]/90 text-black font-bold py-4 rounded-xl transition disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}