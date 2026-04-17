import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">✂️</p>
      <h1 className="text-3xl font-bold text-ink-900 mb-2">Página no encontrada</h1>
      <p className="text-ink-400 mb-8">Este perfil o página no existe.</p>
      <Link href="/" className="btn-primary">Volver al inicio</Link>
    </div>
  );
}
