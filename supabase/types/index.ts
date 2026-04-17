export type UserType = "barbero" | "salon" | "cliente";

export interface Profile {
  id: string;
  tipo: UserType;
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
