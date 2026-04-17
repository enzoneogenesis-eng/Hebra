"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CiudadSelector } from "@/components/CiudadSelector";
import { Heart, Clock, Bell, Scissors, Building2, User, Check } from "lucide-react";
import type { UserType } from "@/types";

const TIPOS = [
  {
    value: "barbero" as UserType,
    label: "Barbero",
    icon: <Scissors size={18} />,
    desc: "Mostrá tu portfolio y conectá con clientes",
    beneficios: ["Perfil con portfolio de fotos", "Aparecés en el buscador", "Clientes te contactan por WhatsApp"],
  },
  {
    value: "salon" as UserType,
    label: "Salón",
    icon: <Building2 size={18} />,
    desc: "Publicá ofertas y encontrá profesionales",
    beneficios: ["Publicás ofertas de trabajo", "Equipo visible en la plataforma", "Barberos te contactan directamente"],
  },
  {
    value: "cliente" as UserType,
    label: "Cliente",
    icon: <User size={18} />,
    desc: "Encontrá y guardá tus barberos favoritos",
    beneficios: ["Guardás barberos favoritos", "Historial de perfiles visitados", "Alertas cuando llega un barbero a tu ciudad"],
  },
];

const CLIENTE_BENEFICIOS = [
  { icon: <Heart size={16} className="text-[#e4405f]" />, titulo: "Guardá favoritos", desc: "Accedé rápido a tus barberos preferidos sin tener que buscarlos de nuevo." },
  { icon: <Clock size={16} className="text-[#0a0a0a]" />, titulo: "Historial de visitas", desc: "Recordá todos los perfiles que viste y volvé a contactarlos fácil." },
  { icon: <Bell size={16} className="text-[#f59e0b]" />,  titulo: "Alertas por ciudad", desc: "Te avisamos cuando un nuevo barbero se registra en tu zona." },
];

export default function RegisterPage() {
  const [tipo, setTipo]           = useState<UserType>("barbero");
  const [nombre, setNombre]       = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [telefono, setTelefono]   = useState("");
  const [instagram, setInstagram] = useState("");
  const [ciudad, setCiudad]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { tipo, nombre } },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Error al registrarse.");
      setLoading(false);
      return;
    }

    await supabase.from("profiles").upsert({
      id: data.user.id, tipo, nombre,
      telefono:  telefono  || null,
      instagram: instagram || null,
      ubicacion: ciudad    || null,
    });

    await supabase.auth.signInWithPassword({ email, password });
    window.location.replace("/dashboard");
  }

  const tipoActivo = TIPOS.find(t => t.value === tipo)!;

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0a0a0a] p-12">
        <span className="font-['Bebas_Neue'] text-3xl text-white tracking-widest">HEBRA</span>
        <div>
          <h2 className="font-['Bebas_Neue'] text-6xl text-white leading-none mb-6">
            CREÁ TU<br />PERFIL HOY.
          </h2>

          {/* Beneficios según tipo seleccionado */}
          <div className="space-y-4">
            {tipo === "cliente" ? (
              CLIENTE_BENEFICIOS.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{b.titulo}</p>
                    <p className="text-[#555] text-xs leading-relaxed mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              tipoActivo.beneficios.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <p className="text-[#555] text-sm">{b}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <p className="text-[#333] text-xs">© 2025 Hebra</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <span className="font-['Bebas_Neue'] text-3xl text-[#0a0a0a] tracking-widest">HEBRA</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-4xl text-[#0a0a0a] mb-1 tracking-wide">REGISTRARSE</h1>
          <p className="text-sm text-[#999] mb-8">Gratis. Sin tarjeta de crédito.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de tipo */}
            <div>
              <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-2">Soy un…</label>
              <div className="space-y-2">
                {TIPOS.map(t => (
                  <button key={t.value} type="button" onClick={() => setTipo(t.value)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all bg-transparent ${
                      tipo === t.value ? "border-[#22c55e] bg-[#0a1a0a]" : "border-[#1e1e1e] hover:border-[#2a2a2a]"
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all ${
                      tipo === t.value ? "border-[#0a0a0a] bg-[#0a0a0a]" : "border-[#ddd]"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{t.label}</p>
                      </div>
                      <p className="text-xs text-[#444]">{t.desc}</p>
                      {/* Mostrar beneficios de cliente inline en mobile */}
                      {t.value === "cliente" && tipo === "cliente" && (
                        <div className="mt-2 space-y-1 lg:hidden">
                          {CLIENTE_BENEFICIOS.map((b, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="text-[10px]">{b.icon}</span>
                              <p className="text-[10px] text-[#888]">{b.titulo}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">
                {tipo === "salon" ? "Nombre del salón" : tipo === "cliente" ? "Tu nombre" : "Tu nombre"}
              </label>
              <input className="input" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder={tipo === "salon" ? "Barbería El Rey" : "Juan Pérez"} required />
            </div>

            {/* Contacto — solo para barberos y salones */}
            {tipo !== "cliente" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">WhatsApp</label>
                  <input className="input" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+54 11..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Instagram</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] text-sm">@</span>
                    <input className="input pl-8" value={instagram}
                      onChange={e => setInstagram(e.target.value.replace("@", ""))} placeholder="usuario" />
                  </div>
                </div>
              </div>
            )}

            {/* Ciudad */}
            <div>
              <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">
                {tipo === "cliente" ? "Tu ciudad (para recibir alertas)" : "Ciudad"}
              </label>
              <CiudadSelector value={ciudad} onChange={setCiudad} />
              {tipo === "cliente" && ciudad && (
                <p className="text-[10px] text-[#444] mt-1 flex items-center gap-1">
                  <Bell size={10} /> Te avisamos cuando llegue un barbero a {ciudad}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com" required />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-1.5">Contraseña</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" minLength={6} required />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-2.5 rounded-2xl">{error}</p>}

            <button type="submit" className="btn-primary w-full py-3.5 text-sm" disabled={loading}>
              {loading ? "Creando cuenta…" : tipo === "cliente" ? "Crear cuenta y guardar mis barberos →" : "Crear cuenta gratis →"}
            </button>
          </form>

          <p className="text-center text-sm text-[#444] mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#22c55e] font-semibold">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
