'use client'

export default function ProfilePreview() {
  return (
    <div className="bg-neutral-900 rounded-2xl border border-white/10 w-full max-w-2xl mx-auto p-6">
      <h2 className="text-white text-xl font-bold">Andres Torres</h2>
      <p className="text-green-400 text-xs uppercase tracking-widest">BARBERO</p>
      <p className="text-white/60 text-sm mt-2">Rosario, Santa Fe</p>
      <p className="text-white/50 text-sm mt-2">Especialista en coloracion masculina.</p>
      <button className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl text-sm font-semibold">Contactar por WhatsApp</button>
    </div>
  )
}
