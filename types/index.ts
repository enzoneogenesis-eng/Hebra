export type UserType = "barbero" | "salon" | "cliente" | "dueno";

export interface Profile {
  id: string;
  tipo: UserType;
  // Roles múltiples (nuevo modelo)
  is_cliente: boolean;
  is_barbero: boolean;
  is_dueno: boolean;
  is_admin: boolean;
  nombre: string;
  bio: string | null;
  ubicacion: string | null;
  foto_url: string | null;
  telefono: string | null;
  instagram: string | null;
  skills: string[] | null;
  created_at?: string;
}

export interface Trabajo {
  id: string;
  user_id: string;
  imagen_url: string;
  descripcion: string | null;
  created_at: string;
}



export interface Favorito {
  id: string;
  cliente_id: string;
  barbero_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface Historial {
  id: string;
  cliente_id: string;
  barbero_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface Notificacion {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  data: Record<string, string> | null;
  created_at: string;
}

export interface Oferta {
  id: string;
  salon_id: string;
  titulo: string;
  descripcion: string | null;
  ciudad: string | null;
  skills: string[] | null;
  tipo_empleo: string | null;
  activa: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Postulacion {
  id: string;
  oferta_id: string;
  barbero_id: string;
  mensaje: string | null;
  estado: "pendiente" | "vista" | "aceptada" | "rechazada";
  created_at: string;
  profiles?: Profile;
  ofertas?: Oferta;
}

export interface Disponibilidad {
  id: string;
  user_id: string;
  dias_semana: number[];
  hora_inicio: string;
  hora_fin: string;
  duracion_min: number;
  creado_en?: string;
  actualizado_en?: string;
}

export type EstadoTurno = "pendiente" | "confirmado" | "rechazado" | "cancelado" | "completado";

export interface Turno {
  id: string;
  barbero_id: string;
  cliente_id: string;
  fecha: string;
  hora: string;
  duracion_min: number;
  estado: EstadoTurno;
  mensaje: string | null;
    sucursal_id?: string | null;
    servicio_id?: string | null;
  creado_en?: string;
  actualizado_en?: string;
  barbero?: Profile;
  cliente?: Profile;
}
// =====================================================
// Finanzas (Fase 8 — modelo con sucursales)
// =====================================================

export interface Marca {
  id: string;
  owner_id: string;
  nombre: string;
  logo_url: string | null;
  creada_en?: string;
  owner?: Profile;
}

export interface Sucursal {
  id: string;
  marca_id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  horario_texto: string | null;
  foto_url: string | null;
  activa: boolean;
  creada_en?: string;
  marca?: Marca;
}

export type ServicioOwnerType = "marca" | "barbero";

export interface Servicio {
  id: string;
  owner_type: ServicioOwnerType;
  owner_id: string;
  nombre: string;
  precio: number;
  duracion_min: number;
  activo: boolean;
  creado_en?: string;
}

export interface SucursalBarbero {
  id: string;
  sucursal_id: string;
  barbero_id: string;
  porcentaje_barbero: number;
  desde: string;
  hasta: string | null;
  activo: boolean;
  creado_en?: string;
  sucursal?: Sucursal;
  barbero?: Profile;
}

export interface Ingreso {
  id: string;
  barbero_id: string;
  sucursal_id: string | null;
  servicio_id: string | null;
  turno_id: string | null;
  monto: number;
  porcentaje_barbero: number | null;
  monto_barbero: number | null;
  monto_salon: number | null;
  fecha: string;
  cliente_nombre: string | null;
  notas: string | null;
  metodo_pago: MetodoPago;
  creado_en?: string;
  servicio?: Servicio;
  barbero?: Profile;
  sucursal?: Sucursal;
}

export type MetodoPago = "efectivo" | "mercadopago" | "transferencia" | "otro";

export type CategoriaGasto =
  | "alquiler"
  | "servicios"
  | "productos"
  | "sueldos"
  | "marketing"
  | "otro";

export interface Gasto {
  id: string;
  sucursal_id: string | null;
  marca_id: string | null;
  barbero_id: string | null;
  categoria: CategoriaGasto;
  descripcion: string | null;
  monto: number;
  fecha: string;
  creado_en?: string;
}