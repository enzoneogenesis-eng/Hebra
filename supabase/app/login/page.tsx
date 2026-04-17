"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { setError("Email o contraseña incorrectos."); setLoading(false); return; }
    window.location.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#0a0a0a" }}>
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 border-r border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#1e1e1e]">
            <Image src="/logo-original.png" alt="Hebra" width={32} height={32} className="w-full h-full object-cover" style={{ objectPosition: "center 35%" }} />
          </div>
          <span className="font-['Bebas_Neue'] text-2xl text-white tracking-widest">HEBRA</span>
        </div>
        <div>
          <h2 className="font-['Bebas_Neue'] text-6xl text-white leading-none mb-4">BIENVENIDO<br />DE VUELTA.</h2>
          <p className="text-[#444] text-sm">La red profesional del corte.</p>
        </div>
        <p className="text-[#222] text-xs">© 2025 Hebra</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#1e1e1e]">
              <Image src="/logo-original.png" alt="Hebra" width={36} height={36} className="w-full h-full object-cover" style={{ objectPosition: "center 35%" }} />
            </div>
            <span className="font-['Bebas_Neue'] text-2xl text-white tracking-widest">HEBRA</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">INGRESAR</h1>
          <p className="text-sm text-[#444] mb-8">Iniciá sesión para continuar.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="vos@ejemplo.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Contraseña</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" required autoComplete="current-password" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-2xl">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Ingresando…" : "Iniciar sesión →"}
            </button>
          </form>
          <p className="text-center text-sm text-[#444] mt-6">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-[#22c55e] font-semibold">Registrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
