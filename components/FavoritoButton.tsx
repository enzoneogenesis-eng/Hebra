"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  barberoId: string;
  size?: "sm" | "md";
}

export function FavoritoButton({ barberoId, size = "md" }: Props) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [clienteId, setClienteId]  = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Verificar que es cliente
      const { data: profile } = await supabase
        .from("profiles").select("id, tipo").eq("id", session.user.id).single();
      if (!profile || profile.tipo !== "cliente") return;

      setClienteId(profile.id);

      const { data } = await supabase
        .from("favoritos")
        .select("id")
        .eq("cliente_id", profile.id)
        .eq("barbero_id", barberoId)
        .single();
      setEsFavorito(!!data);
    }
    check();
  }, [barberoId]);

  if (!clienteId) return null;

  async function toggle() {
    if (!clienteId || loading) return;
    setLoading(true);
    if (esFavorito) {
      await supabase.from("favoritos")
        .delete()
        .eq("cliente_id", clienteId)
        .eq("barbero_id", barberoId);
      setEsFavorito(false);
    } else {
      await supabase.from("favoritos")
        .insert({ cliente_id: clienteId, barbero_id: barberoId });
      setEsFavorito(true);
    }
    setLoading(false);
  }

  const isSmall = size === "sm";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex items-center justify-center rounded-full border transition-all active:scale-95 ${
        esFavorito
          ? "bg-[#0a0a0a] border-[#0a0a0a] text-white"
          : "bg-white border-[#e8e8e6] text-[#aaa] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
      } ${isSmall ? "w-8 h-8" : "w-10 h-10"}`}
    >
      <svg
        width={isSmall ? 14 : 16}
        height={isSmall ? 14 : 16}
        viewBox="0 0 24 24"
        fill={esFavorito ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}
