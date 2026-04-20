import type { Disponibilidad, Turno } from "@/types";

export function generarSlots(disp: Disponibilidad, fecha: Date): string[] {
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
  if (!disp.dias_semana.includes(diaSemana)) return [];

  const slots: string[] = [];
  const [hStart, mStart] = disp.hora_inicio.split(":").map(Number);
  const [hEnd, mEnd] = disp.hora_fin.split(":").map(Number);

  let current = hStart * 60 + mStart;
  const end = hEnd * 60 + mEnd;

  while (current + disp.duracion_min <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += disp.duracion_min;
  }

  return slots;
}

export function filtrarOcupados(slots: string[], turnos: Turno[]): string[] {
  const ocupados = new Set(
    turnos
      .filter(t => t.estado === "pendiente" || t.estado === "confirmado")
      .map(t => t.hora.substring(0, 5))
  );
  return slots.filter(s => !ocupados.has(s));
}

export function proximasFechas(disp: Disponibilidad, fromDate?: Date, diasAMostrar = 14): Date[] {
  const start = fromDate ?? new Date();
  start.setHours(0, 0, 0, 0);

  const fechas: Date[] = [];
  for (let i = 0; i < diasAMostrar; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const diaSemana = d.getDay() === 0 ? 7 : d.getDay();
    if (disp.dias_semana.includes(diaSemana)) {
      fechas.push(d);
    }
  }
  return fechas;
}

export function formatearFechaCorta(fecha: Date): string {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const cmp = new Date(fecha);
  cmp.setHours(0, 0, 0, 0);
  const diff = Math.round((cmp.getTime() - hoy.getTime()) / 86400000);

  if (diff === 0) return "Hoy";
  if (diff === 1) return "Manana";

  const dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const nombreDia = dias[cmp.getDay()];
  return `${nombreDia} ${cmp.getDate()}/${cmp.getMonth() + 1}`;
}

export function formatearFechaLarga(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha + "T00:00:00") : fecha;
  const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
}

export function fechaToISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function labelEstado(estado: string): string {
  switch (estado) {
    case "pendiente":   return "Pendiente";
    case "confirmado":  return "Confirmado";
    case "rechazado":   return "Rechazado";
    case "cancelado":   return "Cancelado";
    case "completado":  return "Completado";
    default:            return estado;
  }
}

export function colorEstado(estado: string): { bg: string; text: string } {
  switch (estado) {
    case "pendiente":   return { bg: "#fef3c7", text: "#92400e" };
    case "confirmado":  return { bg: "#dcfce7", text: "#166534" };
    case "rechazado":   return { bg: "#fee2e2", text: "#991b1b" };
    case "cancelado":   return { bg: "#f3f4f6", text: "#374151" };
    case "completado":  return { bg: "#dbeafe", text: "#1e40af" };
    default:            return { bg: "#f3f4f6", text: "#374151" };
  }
}