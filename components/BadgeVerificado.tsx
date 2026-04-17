export function BadgeVerificado({ size = "sm" }: { size?: "sm" | "md" }) {
  const ismd = size === "md";
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wider
      bg-[#0a1a0a] border border-[#1a3a1a] text-[#22c55e]
      ${ismd ? "text-[11px] px-3 py-1" : "text-[9px] px-2 py-0.5"}`}>
      <svg width={ismd ? 12 : 10} height={ismd ? 12 : 10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Verificado
    </span>
  );
}
