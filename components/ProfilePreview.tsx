'use client'

import { MapPin, Instagram, MessageCircle } from 'lucide-react'

interface ProfilePreviewProps {
      profile?: {
              name?: string
              role?: string
              location?: string
              bio?: string
              specialties?: string[]
              instagram?: string
              avatar_url?: string
              portfolio?: { url: string; caption?: string }[]
      }
}

const DEFAULT = {
      name: 'Andres Torres',
      role: 'BARBERO',
      location: 'Rosario, Santa Fe',
      bio: 'Especialista en coloracion masculina.',
      specialties: ['Mechas', 'Balayage', 'Color fantasia'],
      instagram: 'andres.color.barber',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      portfolio: [
          { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=300&h=300&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1621605815971-8f26e24fcc4a?w=300&h=300&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300&h=300&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&h=300&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&h=300&fit=crop' },
            ],
}

export default function ProfilePreview({ profile }: ProfilePreviewProps) {
      const p = { ...DEFAULT, ...profile }
            const port = p.portfolio ?? []
                  return (
                          <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 w-full max-w-2xl mx-auto">
                                <div className="bg-neutral-800 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                                        <div className="flex gap-1.5">
                                                  <div className="w-3 h-3 rounded-full bg-white/20" />
                                                  <div className="w-3 h-3 rounded-full bg-white/20" />
                                                  <div className="w-3 h-3 rounded-full bg-white/20" />
                                        </div>div>
                                        <span className="text-xs text-white/40 font-mono">hebra.app/profile/andres-torres</span>span>
                                </div>div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                                  <div className="flex items-center gap-4">
                                                              <img src={p.avatar_url} alt={p.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-green-500/30" />
                                                              <div>
                                                                            <p className="text-xs text-green-400 uppercase tracking-widest font-semibold">{p.role}</p>p>
                                                                            <h2 className="text-lg font-bold text-white uppercase">{p.name}</h2>h2>
                                                                            <div className="flex items-center gap-1 mt-1">
                                                                                            <MapPin className="w-3 h-3 text-white/40" />
                                                                                            <span className="text-xs text-white/50">{p.location}</span>span>
                                                                            </div>div>
                                                              </div>div>
                                                  </div>div>
                                                  <p className="text-sm text-white/60">{p.bio}</p>p>
                                                  <div className="flex flex-wrap gap-1.5">
                                                      {p.specialties.map((s) => (
                                            <span key={s} className="px-2.5 py-1 rounded-full border border-white/20 text-xs text-white/70">{s}</span>span>
                                          ))}
                                                  </div>div>
                                                  <div className="space-y-2">
                                                              <button className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl text-sm">
                                                                            <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
                                                              </button>button>
                                                              <button className="w-full flex items-center justify-center gap-2 border border-white/20 text-white/70 py-3 rounded-xl text-sm">
                                                                            <Instagram className="w-4 h-4" /> @{p.instagram}
                                                              </button>button>
                                                  </div>div>
                                        </div>div>
                                        <div>
                                                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Portfolio</p>p>
                                                  <div className="grid grid-cols-3 gap-1.5">
                                                      {port.slice(0, 6).map((item, i) => (
                                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                                                            <img src={item.url} alt={"T" + String(i)} className="w-full h-full object-cover" loading="lazy" />
                                            </div>div>
                                          ))}
                                                  </div>div>
                                                  <p className="text-xs text-white/40 text-center mt-2">{port.length} trabajos</p>p>
                                        </div>div>
                                </div>div>
                                <p className="text-xs text-white/40 text-center pb-4">Tu perfil puede verse asi en minutos.</p>p>
                          </div>div>
                        )
                      }</div>
