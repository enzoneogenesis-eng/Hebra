"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [ready, setReady]           = useState(false);
  const [done, setDone]             = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Chequeo SINCRONICO del hash apenas carga la pagina.
    // Si no tiene access_token + type=recovery, es link invalido. Punto.
    const hash = window.location.hash;
    const hasValidRecoveryHash = hash.includes("access_token") && hash.includes("type=recovery");

    if (!hasValidRecoveryHash) {
      setInvalidLink(true);
      return;
    }

    // Si el hash es valido, habilitamos el form.
    // Tambien escuchamos el evento PASSWORD_RECOVERY por si Supabase lo dispara.
    setReady(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contrase\u00f1a tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contrase\u00f1as no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No pudimos actualizar la contrase\u00f1a. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    await supabase.auth.signOut();
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
          <h2 className="font-['Bebas_Neue'] text-6xl text-white leading-none mb-4">NUEVA<br />CONTRASE&Ntilde;A.</h2>
          <p className="text-[#444] text-sm">Elegi una clave segura para tu cuenta.</p>
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

          {invalidLink ? (
            <>
              <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">LINK INV&Aacute;LIDO</h1>
              <p className="text-sm text-[#444] mb-8">
                El link expir&oacute; o ya fue usado. Pedi un link nuevo para reiniciar tu contrase&ntilde;a.
              </p>
              <Link href="/forgot-password" className="btn-primary w-full block text-center">
                Pedir nuevo link
              </Link>
              <p className="text-center text-sm text-[#444] mt-6">
                <Link href="/login" className="text-[#22c55e] font-semibold">&larr; Volver a ingresar</Link>
              </p>
            </>
          ) : done ? (
            <>
              <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">LISTO</h1>
              <p className="text-sm text-[#444] mb-8">
                Actualizamos tu contrase&ntilde;a. Ya podes ingresar con la nueva clave.
              </p>
              <Link href="/login" className="btn-primary w-full block text-center">
                Ir a ingresar
              </Link>
            </>
          ) : !ready ? (
            <>
              <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">VERIFICANDO...</h1>
              <p className="text-sm text-[#444]">Validando el link, esperame un segundo.</p>
            </>
          ) : (
            <>
              <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1 tracking-wide">NUEVA CONTRASE&Ntilde;A</h1>
              <p className="text-sm text-[#444] mb-8">Elegi una clave de al menos 8 caracteres.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Nueva contrase&ntilde;a</label>
                  <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="M&iacute;nimo 8 caracteres" required autoComplete="new-password" minLength={8} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1.5">Confirmar contrase&ntilde;a</label>
                  <input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetila" required autoComplete="new-password" minLength={8} />
                </div>
                {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 px-4 py-3 rounded-2xl">{error}</p>}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar contrasena →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}