"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setError("No pudimos enviar el mail. Revisa la direccion e intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
          <h2 className="font-['Bebas_Neue'] text-6xl text-white leading-none mb-4">RECUPERA<br />TU CUENTA.</h2>
          <p className="text-[#444] text-sm">Te enviamos un mail para que puedas volver a ingresar.</p>
        </div>
        <p className="text-[#222] text-xs">&copy; 2025 Hebra</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#1e1e1e]">
              <Image src="/logo-original.png" alt="Hebra" width={36} height={36} className="w-full h-full object-cover" style={{ objectPosition: "center 35%" }} />
            </div>
            <span className="font-['Bebas_Neue'] text-2xl text-white tracking-widest">HEBRA</span>
          </div>

          {!sent ? (
            <>
              <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">RECUPERAR ACCESO</h1>
              <p className="text-sm text-[#444] mb-8">Ingresa tu email y te mandamos el link para reiniciar la contrase&ntilde;a.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="vos@ejemplo.com" required autoComplete="email" />
                </div>
                {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-2xl">{error}</p>}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link de recuperacion →"}
                </button>
              </form>
              <p className="text-center text-sm text-[#444] mt-6">
                <Link href="/login" className="text-[#22c55e] font-semibold">&larr; Volver a ingresar</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">REVISA TU MAIL</h1>
              <p className="text-sm text-[#444] mb-8">
                Si existe una cuenta con <span className="text-white">{email}</span>, te enviamos un link para reiniciar la contrase&ntilde;a.
              </p>
              <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-5 mb-6">
                <p className="text-xs text-[#444] leading-relaxed">
                  No olvides revisar la carpeta de Spam. El link expira en 1 hora por seguridad.
                </p>
              </div>
              <Link href="/login" className="btn-primary w-full block text-center">
                Volver a ingresar
              </Link>
              <p className="text-center text-sm text-[#444] mt-6">
                &iquest;No te lleg&oacute;?{" "}
                <button onClick={() => { setSent(false); setEmail(""); }} className="text-[#22c55e] font-semibold">Intenta de nuevo</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}