"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { DashboardBarbero } from "@/components/DashboardBarbero";
import { DashboardSalon } from "@/components/DashboardSalon";
import { DashboardCliente } from "@/components/DashboardCliente";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!data) { router.replace("/register"); return; }
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 w-48 bg-[#f0f0f0] rounded-xl mb-2" />
      <div className="h-4 w-32 bg-[#f0f0f0] rounded-xl mb-10" />
      <div className="h-64 bg-[#f0f0f0] rounded-3xl" />
    </div>
  );

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-['Bebas_Neue'] text-4xl text-[#0a0a0a] tracking-wide mb-1">
          HOLA, {profile.nombre.toUpperCase()} 👋
        </h1>
        <p className="text-[#aaa] text-sm">Tu panel de control en Hebra.</p>
      </div>
      {profile.tipo === "barbero" && <DashboardBarbero profile={profile} />}
      {profile.tipo === "salon"   && <DashboardSalon   profile={profile} />}
      {profile.tipo === "cliente" && <DashboardCliente profile={profile} />}
    </div>
  );
}
