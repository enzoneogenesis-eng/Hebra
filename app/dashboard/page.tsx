"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import { DashboardBarbero } from "@/components/DashboardBarbero";
import { DashboardSalon } from "@/components/DashboardSalon";
import { DashboardCliente } from "@/components/DashboardCliente";
import { DashboardDueno } from "@/components/DashboardDueno";
import { Store, Calendar, User, UserCog, Receipt, Users, Wallet, type LucideIcon } from "lucide-react";
import { EditProfileForm } from "@/components/EditProfileForm";
import { DashboardGastos } from "@/components/DashboardGastos";
import { DashboardEquipo } from "@/components/DashboardEquipo";
import { DashboardLiquidacion } from "@/components/DashboardLiquidacion";

type TabKey = "marca" | "agenda" | "turnos" | "cliente" | "salon" | "perfil" | "gastos" | "equipo" | "liquidacion";

interface Tab {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);

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

  // Determinar tabs disponibles según roles
  const tabs: Tab[] = [];
  if (profile) {
    if (profile.is_dueno) {
      tabs.push({ key: "marca", label: "Mi marca", icon: Store });
      tabs.push({ key: "gastos", label: "Gastos", icon: Receipt });
      tabs.push({ key: "equipo", label: "Equipo", icon: Users });
      tabs.push({ key: "liquidacion", label: "Liquidacion", icon: Wallet });
    }
    if (profile.is_barbero) {
      tabs.push({ key: "agenda", label: "Turnos recibidos", icon: Calendar });
    }
    if (profile.is_cliente) {
      tabs.push({ key: "cliente", label: "Mis reservas", icon: User });
    }
    // Perfil siempre disponible
    tabs.push({ key: "perfil", label: "Perfil", icon: UserCog });
    // Fallback para perfiles tipo "salon" viejos sin booleans migrados
    if (tabs.length === 0 && profile.tipo === "salon") {
      tabs.push({ key: "salon", label: "Salón", icon: Store });
    }
  }

  // Seteo de tab activa inicial: de localStorage o la primera disponible
  useEffect(() => {
    if (!profile || activeTab) return;
    const saved = typeof window !== "undefined" ? localStorage.getItem("hebra_active_tab") : null;
    const valid = tabs.find(t => t.key === saved);
    setActiveTab(valid?.key ?? tabs[0]?.key ?? null);
  }, [profile]);

  // Persistir tab activa
  useEffect(() => {
    if (activeTab && typeof window !== "undefined") {
      localStorage.setItem("hebra_active_tab", activeTab);
    }
  }, [activeTab]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-pulse">
      <div className="h-8 w-48 bg-[#f0f0f0] rounded-xl mb-2" />
      <div className="h-4 w-32 bg-[#f0f0f0] rounded-xl mb-10" />
      <div className="h-64 bg-[#f0f0f0] rounded-3xl" />
    </div>
  );

  if (!profile) return null;

  const nombreDisplay = (profile.nombre ?? "").toUpperCase() || "HOLA";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header con saludo responsive */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-['Bebas_Neue'] text-3xl sm:text-4xl text-white tracking-wide mb-1 leading-tight break-words">
          HOLA, {nombreDisplay} 👋
        </h1>
        <p className="text-[#888] text-xs sm:text-sm">Tu panel de control en Hebra.</p>
      </div>

      {/* Tabs navigation (solo si hay más de 1 tab) */}
      {tabs.length > 1 && (
        <div className="mb-6 sm:mb-8 border-b border-[#1a1a1a] -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? "text-white border-[#1ed760]"
                      : "text-[#666] border-transparent hover:text-[#aaa]"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenido de la tab activa */}
      {activeTab === "marca"   && <DashboardDueno   profile={profile} />}
      {activeTab === "gastos"  && <DashboardGastos  profile={profile} />}
      {activeTab === "equipo"  && <DashboardEquipo  profile={profile} />}
      {activeTab === "liquidacion" && <DashboardLiquidacion profile={profile} />}
      {activeTab === "agenda"  && <DashboardBarbero profile={profile} />}
      {activeTab === "cliente" && <DashboardCliente profile={profile} />}
      {activeTab === "salon"   && <DashboardSalon   profile={profile} />}
      {activeTab === "perfil"  && <EditProfileForm   profile={profile} />}
    </div>
  );
}