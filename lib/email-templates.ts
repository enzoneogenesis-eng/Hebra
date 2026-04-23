// Templates de emails transaccionales de Hebra.
// Cada funcion recibe los datos y devuelve el HTML listo para enviar.

export type DatosMail = {
  nombreBarbero: string;
  nombreCliente: string;
  fechaBonita: string; // "25/04/2026"
  horaBonita: string;  // "15:00"
  servicioNombre?: string | null;
  servicioPrecio?: number | null;
  sucursalNombre?: string | null;
  mensajeCliente?: string | null;
};

const BASE_URL = "https://hebrabarbers.app";

function bloqueDatosTurno(d: DatosMail): string {
  return `
    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 20px;">
      <p style="margin: 0 0 6px;"><b>Fecha:</b> ${d.fechaBonita}</p>
      <p style="margin: 0 0 6px;"><b>Hora:</b> ${d.horaBonita}</p>
      ${d.servicioNombre ? `<p style="margin: 0 0 6px;"><b>Servicio:</b> ${d.servicioNombre}</p>` : ""}
      ${d.sucursalNombre ? `<p style="margin: 0 0 6px;"><b>Sucursal:</b> ${d.sucursalNombre}</p>` : ""}
      ${d.mensajeCliente ? `<p style="margin: 0;"><b>Mensaje:</b> ${d.mensajeCliente}</p>` : ""}
    </div>
  `;
}

function botonDashboard(texto: string, href: string = "/dashboard"): string {
  return `
    <a href="${BASE_URL}${href}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">${texto}</a>
  `;
}

function pie(): string {
  return `<p style="margin: 28px 0 0; font-size: 12px; color: #888;">Este mail fue enviado automaticamente por Hebra.</p>`;
}

function layout(contenido: string): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">${contenido}</div>`;
}

// === TEMPLATE 1: reserva_cliente ===
// Para el cliente cuando reserva. Es un "recibo" inmediato, antes de confirmacion.
export function templateReservaCliente(d: DatosMail): string {
  return layout(`
    <h2 style="margin: 0 0 12px;">Reserva recibida</h2>
    <p style="margin: 0 0 20px; color: #444;">Hola ${d.nombreCliente}, recibimos tu reserva con <b>${d.nombreBarbero}</b>. Te avisamos por mail cuando la confirme.</p>
    ${bloqueDatosTurno(d)}
    ${botonDashboard("Ver mis turnos", "/turnos")}
    ${pie()}
  `);
}

// === TEMPLATE 2: pendiente_barbero ===
// Para el barbero cuando un cliente le reserva.
export function templatePendienteBarbero(d: DatosMail): string {
  return layout(`
    <h2 style="margin: 0 0 12px;">Nuevo turno pendiente</h2>
    <p style="margin: 0 0 20px; color: #444;">Hola ${d.nombreBarbero}, <b>${d.nombreCliente}</b> te reservo un turno.</p>
    ${bloqueDatosTurno(d)}
    ${botonDashboard("Ver y confirmar")}
    ${pie()}
  `);
}

// === TEMPLATE 3: confirmado ===
// Para el cliente cuando el barbero confirma.
export function templateConfirmado(d: DatosMail): string {
  return layout(`
    <h2 style="margin: 0 0 12px; color: #166534;">Tu turno fue confirmado</h2>
    <p style="margin: 0 0 20px; color: #444;">Hola ${d.nombreCliente}, <b>${d.nombreBarbero}</b> confirmo tu reserva. Te esperamos.</p>
    ${bloqueDatosTurno(d)}
    ${botonDashboard("Ver mi turno", "/turnos")}
    ${pie()}
  `);
}

// === TEMPLATE 4: rechazado ===
// Para el cliente cuando el barbero rechaza.
export function templateRechazado(d: DatosMail): string {
  return layout(`
    <h2 style="margin: 0 0 12px; color: #991b1b;">Turno no disponible</h2>
    <p style="margin: 0 0 20px; color: #444;">Hola ${d.nombreCliente}, lamentamos avisarte que <b>${d.nombreBarbero}</b> no pudo confirmar tu reserva para el ${d.fechaBonita} a las ${d.horaBonita}. Podes elegir otro horario.</p>
    ${botonDashboard("Elegir otro horario", `/profile/`)}
    ${pie()}
  `);
}

// === TEMPLATE 5: recordatorio ===
// Para el cliente 24hs antes del turno.
export function templateRecordatorio(d: DatosMail): string {
  return layout(`
    <h2 style="margin: 0 0 12px;">Recordatorio de turno</h2>
    <p style="margin: 0 0 20px; color: #444;">Hola ${d.nombreCliente}, te recordamos que manana tenes turno con <b>${d.nombreBarbero}</b>.</p>
    ${bloqueDatosTurno(d)}
    ${botonDashboard("Ver detalles", "/turnos")}
    ${pie()}
  `);
}