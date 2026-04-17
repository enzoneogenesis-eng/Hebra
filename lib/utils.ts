export const tipoLabel: Record<string, string> = {
  barbero: "Barbero",
  salon: "Salón",
  cliente: "Cliente",
};

export const tipoBadgeColor: Record<string, string> = {
  barbero: "bg-brand-100 text-brand-800",
  salon: "bg-ink-100 text-ink-800",
  cliente: "bg-blue-100 text-blue-800",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric", month: "short", year: "numeric",
  });
}
