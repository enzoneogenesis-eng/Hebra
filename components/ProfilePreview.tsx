'use client'

export function ProfilePreview() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-2xl mx-auto border border-white/10">
      <h2 className="text-white text-xl font-bold uppercase">Andres Torres</h2>
      <p className="text-green-400 text-xs uppercase tracking-widest mt-1">BARBERO</p>
      <p className="text-white/50 text-sm mt-2">Rosario, Santa Fe</p>
      <p className="text-white/60 text-sm mt-2">Especialista en coloracion masculina.</p>
      <button className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl text-sm font-semibold">
        Contactar por WhatsApp
      </button>
    </div>
  )
}
