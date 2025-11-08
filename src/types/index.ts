export type UserRole = 'moderador' | 'externo' | 'usuario';

export type ClaimStatus = 'pendiente' | 'asignado' | 'en_proceso' | 'resuelto' | 'cerrado';

export type ClaimCategory = 
  | 'luminaria' 
  | 'bache' 
  | 'maleza' 
  | 'basura' 
  | 'señalizacion' 
  | 'otros';

export type UrgencyLevel = 'baja' | 'media' | 'alta' | 'urgente';

export type AccountStatus = 'pending' | 'active' | 'rejected';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  role: UserRole;
  area?: string; // Para usuarios externos
  accountStatus?: AccountStatus; // Estado de la cuenta (pending, active, rejected)
}

export interface Activity {
  id: string;
  descripcion: string;
  personal: string;
  fecha: string;
}

export interface Claim {
  id: string;
  numeroSeguimiento: string;
  categoria: ClaimCategory;
  descripcion: string;
  calle1: string;
  calle2?: string;
  calle3?: string;
  altura: string;
  barrio: string;
  nivelUrgencia: UrgencyLevel;
  estado: ClaimStatus;
  asignadoA?: string;
  areaAsignada?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  actividades: Activity[];
  archivos?: string[];
  comentarios?: string[];
}
