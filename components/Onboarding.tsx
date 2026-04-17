"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, MapPin, Scissors, Check } from "lucide-react";
import type { Profile } from "@/types";

const PASOS = [
  {
    numero: 1,
    icon: <Camera size={24} />,
    titulo: "Subí tu foto de perfil",
    desc: "Los perfiles con foto reciben 3x más visitas. Usá una foto profesional o de tu trabajo.",
    accion: "Subir foto",
  },
  {
    numero: 2,
    icon: <Scissors size={24} />,
    titulo: "Elegí tus especialidades",
    desc: "Tus skills ayudan a los clientes a encontrarte cuando buscan un barbero específico.",
    accion: "Agregar skills",
  },
  {
    numero: 3,
    icon: <MapPin size={24} />,
    titulo: "Confirmá tu ciudad",
    desc: "Asegurate que tu ubicación esté correcta para aparecer en las búsquedas locales.",
    accion: "Confirmar ciudad",
  },
];

interface Props {
  profile: Profile;
  onDone: () => void;
}

export function Onboarding({ profile, onDone }: Props) {
  const [paso, setPaso] = useState(0);
  const [cerrando, setCerrando] = useState(false);

  const completados = [
    !!profile.foto_url,
    !!(profile.skills && profile.skills.length > 0),
    !!profile.ubicacion,
  ];

  const todosCompletos = completados.every(Boolean);

  async function completarOnboarding() {
    setCerrando(true);
    await supabase.from("profiles").update({ onboarding_done: true }).eq("id", profile.id);
    onDone();
  }

  if (cerrando) return null;

  return (
    <div className="bg-[#0a1a0a] border border-[#1a3a1a] rounded-3xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-['Bebas_Neue'] text-xl text-white tracking-wide">
            COMPLETÁ TU PERFIL
          </h3>
          <p className="text-xs text-[#444]">
            {completados.filter(Boolean).length} de 3 pasos completados
          </p>
        </div>
        <button onClick={completarOnboarding} className="text-xs text-[#333] hover:text-[#555] transition"
          style={{ WebkitTapHighlightColor: "transparent" }}>
          Saltar
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="h-1 bg-[#111] rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-[#22c55e] rounded-full transition-all duration-500"
          style={{ width: `${(completados.filter(Boolean).length / 3) * 100}%` }} />
      </div>

      {/* Pasos */}
      <div className="space-y-3">
        {PASOS.map((p, i) => (
          <div key={i}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
              completados[i]
                ? "border-[#1a3a1a] bg-[#0a1a0a] opacity-60"
                : i === completados.filter(Boolean).length
                ? "border-[#22c55e]/40 bg-[#111]"
                : "border-[#1e1e1e] bg-[#0d0d0d]"
            }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              completados[i] ? "bg-[#22c55e]" : "bg-[#1a1a1a]"
            }`}>
              {completados[i]
                ? <Check size={18} className="text-black" />
                : <span className={i === completados.filter(Boolean).length ? "text-[#22c55e]" : "text-[#333]"}>
                    {p.icon}
                  </span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${completados[i] ? "text-[#333] line-through" : "text-white"}`}>
                {p.titulo}
              </p>
              <p className="text-xs text-[#444] leading-relaxed mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {todosCompletos && (
        <button onClick={completarOnboarding}
          className="btn-primary w-full mt-4 gap-2">
          <Check size={15} /> ¡Perfil completo! Continuar
        </button>
      )}
    </div>
  );
}
