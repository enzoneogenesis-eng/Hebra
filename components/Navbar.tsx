"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Home, Search, Briefcase, User } from "lucide-react";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setLoggedIn(!!s));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <>
      {/* TOP NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#1e1e1e]"
        style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)",
                 paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            style={{ WebkitTapHighlightColor: "transparent" }}>
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#1e1e1e] flex-shrink-0">
              <Image src="/logo-original.png" alt="Hebra" width={32} height={32}
                className="w-full h-full object-cover" style={{ objectPosition: "center 35%" }} />
            </div>
            <span className="font-['Bebas_Neue'] text-xl tracking-widest text-white">HEBRA</span>
          </Link>

          <div className="flex items-center gap-2">
            {loggedIn ? (
              <button onClick={signOut}
                className="text-xs font-medium text-[#666] px-3 py-2 rounded-full border border-[#1e1e1e] active:scale-95 transition"
                style={{ WebkitTapHighlightColor: "transparent", minHeight: "36px" }}>
                Salir
              </button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="text-xs font-medium text-[#888] px-3 py-2 rounded-full border border-[#1e1e1e] active:scale-95 transition"
                  style={{ WebkitTapHighlightColor: "transparent", minHeight: "36px", display: "flex", alignItems: "center" }}>
                  Ingresar
                </Link>
                <Link href="/register" className="text-xs font-bold text-black px-3 py-2 rounded-full bg-[#22c55e] active:scale-95 transition"
                  style={{ WebkitTapHighlightColor: "transparent", minHeight: "36px", display: "flex", alignItems: "center" }}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BOTTOM TAB BAR */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-[#1e1e1e]"
        style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)",
                 paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        <div className="grid grid-cols-4 h-14">
          {[
            { href: "/",          icon: Home,      label: "Inicio"   },
            { href: "/search",    icon: Search,    label: "Explorar" },
            { href: loggedIn ? "/dashboard" : "/register", icon: Briefcase, label: "Trabajo" },
            { href: loggedIn ? "/dashboard" : "/login",    icon: User,      label: "Perfil"  },
          ].map((item, i) => {
            const Icon = item.icon;
            const isOn = isActive(item.href);
            return (
              <Link key={i} href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <Icon size={22} strokeWidth={isOn ? 2.5 : 1.8}
                  color={isOn ? "#22c55e" : "#333"} />
                <span className="text-[10px] font-medium" style={{ color: isOn ? "#22c55e" : "#333" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
