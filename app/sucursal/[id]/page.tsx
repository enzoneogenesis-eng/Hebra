"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { MapPin, Clock, Phone, MessageCircle, ArrowLeft, Calendar, Scissors, Users } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/trackWhatsAppClick";
import type { Sucursal, Marca, Profile, Servicio } from "@/types";

export default function SucursalPublicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading]       = useState(true);
  const [sucursal, setSucursal]     = useState<Sucursal | null>(null);
  const [marca, setMarca]           = useState<Marca | null>(null);
  const [barberos, setBarberos]     = useState<(Profile & { porcentaje: number })[]>([]);
  const [servicios, setServicios]   = useState<Servicio[]>([]);

  useEffect(() => {
    if (params?.id) loadData(params.id);
  }, [params?.id]);

  async function loadData(sucursalId: string) {
    setLoading(true);

    // 1) Sucursal
    const { data: suc } = await supabase.from("sucursales").select("*").eq("id", sucursalId).eq("activa", true).maybeSingle();
    if (!suc) { setLoading(false); return; }
    setSucursal(suc as Sucursal);

    // 2) Marca
    const { data: m } = await supabase.from("marcas").select("*").eq("id", suc.marca_id).maybeSingle();
    if (m) setMarca(m as Marca);

    // 3) Barberos asignados activos (via sucursales_barberos + profiles)
    const { data: asigs } = await supabase
      .from("sucursales_barberos")
      .select("porcentaje_barbero, barbero:profiles!sucursales_barberos_barbero_id_fkey(id, nombre, foto_url, bio, skills, verificado)")
      .eq("sucursal_id", sucursalId)
      .eq("activo", true);

    const bs = (asigs ?? [])
      .filter((a: any) => a.barbero)
      .map((a: any) => ({ ...(a.barbero as any), porcentaje: a.porcentaje_barbero }));
    setBarberos(bs);

    // 4) Servicios de la marca (owner_type = 'marca')
    if (m) {
      const { data: servs } = await supabase
        .from("servicios")
        .select("*")
        .eq("owner_type", "marca")
        .eq("owner_id", m.id)
        .eq("activo", true)
        .order("precio", { ascending: true });
      setServicios((servs ?? []) as Servicio[]);
    }

    setLoading(false);
  }

  function formatearARS(n: number): string {
    return "$" + Math.round(n).toLocaleString("es-AR");
  }

  function abrirWhatsApp() {
    if (!sucursal?.telefono) return;
    trackWhatsAppClick({ targetUserId: marca?.owner_id ?? "", context: "sucursal" });
    const msg = encodeURIComponent(`Hola! Te contacto desde Hebra, quiero reservar turno en ${sucursal.nombre}.`);
    const phone = sucursal.telefono.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#888]">Cargando sucursal...</p>
      </div>
    );
  }

  if (!sucursal || !marca) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-white text-2xl font-bold mb-2">Sucursal no encontrada</h1>
        <p className="text-[#888] mb-6">No pudimos encontrar esta sucursal o esta desactivada.</p>
        <Link href="/" className="text-[#1ed760] font-semibold hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const nombreCorto = sucursal.nombre.replace(/^.*?- /, "");

  return (
    <div className="min-h-screen bg-black">
      {/* Back nav */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#aaa] hover:text-white transition">
            <ArrowLeft size={18} /> <span className="text-sm">Volver</span>
          </button>
          <Link href="/" className="text-[#1ed760] text-sm font-bold tracking-wider">HEBRA</Link>
        </div>
      </div>

      {/* HERO: foto + logo flotante */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
        {sucursal.foto_url ? (
          <img src={sucursal.foto_url} alt={sucursal.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Scissors size={64} className="text-[#333]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            {marca.logo_url && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-[#1ed760] bg-black flex-shrink-0">
                <img src={marca.logo_url} alt={marca.nombre} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[#1ed760] text-xs md:text-sm font-semibold uppercase tracking-widest">{marca.nombre}</p>
              <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight">{nombreCorto}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Info + acciones */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Info rapida */}
        <div className="space-y-2.5">
          {sucursal.direccion && (
            <div className="flex items-start gap-2.5 text-[#ddd]">
              <MapPin size={18} className="flex-shrink-0 text-[#1ed760] mt-0.5" />
              <span>{sucursal.direccion}{sucursal.ciudad ? `, ${sucursal.ciudad}` : ""}</span>
            </div>
          )}
          {sucursal.horario_texto && (
            <div className="flex items-start gap-2.5 text-[#ddd]">
              <Clock size={18} className="flex-shrink-0 text-[#1ed760] mt-0.5" />
              <span>{sucursal.horario_texto}</span>
            </div>
          )}
          {sucursal.telefono && (
            <div className="flex items-start gap-2.5 text-[#ddd]">
              <Phone size={18} className="flex-shrink-0 text-[#1ed760] mt-0.5" />
              <span>{sucursal.telefono}</span>
            </div>
          )}
        </div>

        {/* Botones accion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => router.push(`/search?sucursal=${sucursal.id}`)}
            className="flex items-center justify-center gap-2 bg-[#1ed760] text-black font-bold px-6 py-4 rounded-xl hover:bg-[#1ed760]/90 transition active:scale-95">
            <Calendar size={18} /> Reservar turno
          </button>
          {sucursal.telefono && (
            <button onClick={abrirWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold px-6 py-4 rounded-xl hover:bg-[#25D366]/90 transition active:scale-95">
              <MessageCircle size={18} /> WhatsApp
            </button>
          )}
        </div>

        {/* EQUIPO */}
        {barberos.length > 0 && (
          <section className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#1ed760]" />
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">Nuestro equipo</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {barberos.map(b => (
                <Link key={b.id} href={`/profile/${b.id}`}
                  className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-3 hover:border-[#1ed760]/40 transition active:scale-95">
                  <div className="aspect-square rounded-xl bg-[#1a1a1a] overflow-hidden mb-2.5 flex items-center justify-center">
                    {b.foto_url ? (
                      <img src={b.foto_url} alt={b.nombre ?? ""} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#666] text-3xl font-bold">{(b.nombre ?? "?").slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{b.nombre}</p>
                  {b.skills && b.skills.length > 0 && (
                    <p className="text-[#666] text-[10px] truncate mt-0.5">{b.skills.slice(0, 2).join(" · ")}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SERVICIOS */}
        {servicios.length > 0 && (
          <section className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Scissors size={18} className="text-[#1ed760]" />
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">Servicios</h2>
            </div>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden">
              {servicios.map((s, i) => (
                <div key={s.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3.5 ${i !== servicios.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{s.nombre}</p>
                    <p className="text-[#666] text-xs">{s.duracion_min} min</p>
                  </div>
                  <p className="text-[#1ed760] font-bold text-lg flex-shrink-0">{formatearARS(Number(s.precio))}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* UBICACION (mapa embebido) */}
        {sucursal.direccion && (
          <section className="pt-4 pb-12">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-[#1ed760]" />
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">Ubicacion</h2>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#2a2a2a] aspect-video">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(sucursal.direccion + (sucursal.ciudad ? ", " + sucursal.ciudad : ""))}&output=embed`}
                className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}