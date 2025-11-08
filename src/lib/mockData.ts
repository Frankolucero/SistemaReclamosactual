import { User, Claim, ClaimStatus, ClaimCategory, UrgencyLevel } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '+54 266 123-4567',
    email: 'juan.perez@villamercedes.gob.ar',
    role: 'moderador',
    accountStatus: 'active'
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    telefono: '+54 266 234-5678',
    email: 'maria.gonzalez@villamercedes.gob.ar',
    role: 'externo',
    area: 'Obras Públicas',
    accountStatus: 'active'
  },
  {
    id: '3',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    telefono: '+54 266 345-6789',
    email: 'carlos.rodriguez@villamercedes.gob.ar',
    role: 'externo',
    area: 'Servicios Públicos',
    accountStatus: 'active'
  }
];

export const mockClaims: Claim[] = [
  {
    id: '001',
    numeroSeguimiento: 'VM-2025-001',
    categoria: 'luminaria',
    descripcion: 'Farola sin funcionar en esquina',
    calle1: 'Av. Mitre',
    calle2: 'Sarmiento',
    altura: '850',
    barrio: 'Centro',
    nivelUrgencia: 'alta',
    estado: 'en_proceso',
    asignadoA: '3',
    areaAsignada: 'Servicios Públicos',
    fechaCreacion: '2025-10-15',
    fechaActualizacion: '2025-10-25',
    actividades: [
      {
        id: 'a1',
        descripcion: 'Inspección realizada, se requiere cambio de lámpara',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-20 10:30'
      }
    ],
    archivos: [],
    comentarios: []
  },
  {
    id: '002',
    numeroSeguimiento: 'VM-2025-002',
    categoria: 'bache',
    descripcion: 'Bache de grandes dimensiones afectando el tránsito',
    calle1: 'San Martín',
    altura: '1234',
    barrio: 'Barrio Norte',
    nivelUrgencia: 'urgente',
    estado: 'asignado',
    asignadoA: '2',
    areaAsignada: 'Obras Públicas',
    fechaCreacion: '2025-10-28',
    fechaActualizacion: '2025-10-28',
    actividades: [],
    archivos: [],
    comentarios: []
  },
  {
    id: '003',
    numeroSeguimiento: 'VM-2025-003',
    categoria: 'maleza',
    descripcion: 'Lote baldío con maleza alta',
    calle1: 'Belgrano',
    calle2: 'Rivadavia',
    altura: '634',
    barrio: 'Barrio Sur',
    nivelUrgencia: 'media',
    estado: 'pendiente',
    fechaCreacion: '2025-10-29',
    fechaActualizacion: '2025-10-29',
    actividades: [],
    archivos: [],
    comentarios: []
  },
  {
    id: '004',
    numeroSeguimiento: 'VM-2025-004',
    categoria: 'basura',
    descripcion: 'Contenedor desbordado, basura en la calle',
    calle1: 'Libertad',
    altura: '456',
    barrio: 'Villa Lourdes',
    nivelUrgencia: 'alta',
    estado: 'resuelto',
    asignadoA: '3',
    areaAsignada: 'Servicios Públicos',
    fechaCreacion: '2025-10-20',
    fechaActualizacion: '2025-10-27',
    actividades: [
      {
        id: 'a2',
        descripcion: 'Se retiró la basura acumulada',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-25 14:00'
      },
      {
        id: 'a3',
        descripcion: 'Se reemplazó contenedor por uno de mayor capacidad',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-27 09:15'
      }
    ],
    archivos: [],
    comentarios: []
  },
  {
    id: '005',
    numeroSeguimiento: 'VM-2025-005',
    categoria: 'luminaria',
    descripcion: 'Múltiples farolas sin funcionar en la cuadra',
    calle1: '25 de Mayo',
    altura: '789',
    barrio: 'Centro',
    nivelUrgencia: 'alta',
    estado: 'pendiente',
    fechaCreacion: '2025-10-30',
    fechaActualizacion: '2025-10-30',
    actividades: [],
    archivos: [],
    comentarios: []
  },
  {
    id: '006',
    numeroSeguimiento: 'VM-2025-006',
    categoria: 'bache',
    descripcion: 'Hundimiento en asfalto peligroso para vehículos',
    calle1: 'Av. España',
    calle2: 'Pedernera',
    altura: '1580',
    barrio: 'Barrio Aeroclub',
    nivelUrgencia: 'urgente',
    estado: 'en_proceso',
    asignadoA: '2',
    areaAsignada: 'Obras Públicas',
    fechaCreacion: '2025-10-26',
    fechaActualizacion: '2025-10-29',
    actividades: [
      {
        id: 'a4',
        descripcion: 'Se delimitó la zona con conos de seguridad',
        personal: 'María González',
        fecha: '2025-10-27 08:00'
      },
      {
        id: 'a5',
        descripcion: 'Se solicitó asfalto para reparación',
        personal: 'María González',
        fecha: '2025-10-29 11:30'
      }
    ],
    archivos: [],
    comentarios: []
  },
  {
    id: '007',
    numeroSeguimiento: 'VM-2025-007',
    categoria: 'señalizacion',
    descripcion: 'Cartel de PARE faltante en cruce peligroso',
    calle1: 'Junín',
    calle2: 'Colón',
    altura: '945',
    barrio: 'Centro',
    nivelUrgencia: 'urgente',
    estado: 'asignado',
    asignadoA: '2',
    areaAsignada: 'Obras Públicas',
    fechaCreacion: '2025-10-28',
    fechaActualizacion: '2025-10-28',
    actividades: [],
    archivos: [],
    comentarios: []
  },
  {
    id: '008',
    numeroSeguimiento: 'VM-2025-008',
    categoria: 'señalizacion',
    descripcion: 'Semáforo intermitente, funciona solo en amarillo',
    calle1: 'Av. Mitre',
    calle2: '9 de Julio',
    altura: '1020',
    barrio: 'Centro',
    nivelUrgencia: 'alta',
    estado: 'en_proceso',
    asignadoA: '3',
    areaAsignada: 'Servicios Públicos',
    fechaCreacion: '2025-10-24',
    fechaActualizacion: '2025-10-28',
    actividades: [
      {
        id: 'a6',
        descripcion: 'Técnico revisó sistema eléctrico del semáforo',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-26 15:45'
      }
    ],
    archivos: [],
    comentarios: []
  },
  {
    id: '009',
    numeroSeguimiento: 'VM-2025-009',
    categoria: 'maleza',
    descripcion: 'Maleza obstaculiza visibilidad en esquina',
    calle1: 'Lafinur',
    calle2: 'Ayacucho',
    altura: '523',
    barrio: 'Barrio Jardín',
    nivelUrgencia: 'media',
    estado: 'resuelto',
    asignadoA: '3',
    areaAsignada: 'Servicios Públicos',
    fechaCreacion: '2025-10-18',
    fechaActualizacion: '2025-10-23',
    actividades: [
      {
        id: 'a7',
        descripcion: 'Cuadrilla realizó poda y limpieza del área',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-22 09:00'
      },
      {
        id: 'a8',
        descripcion: 'Se retiró material vegetal del lugar',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-23 10:30'
      }
    ],
    archivos: [],
    comentarios: ['Muy buen trabajo, muchas gracias por la rápida respuesta']
  },
  {
    id: '010',
    numeroSeguimiento: 'VM-2025-010',
    categoria: 'basura',
    descripcion: 'Microbasural en terreno público',
    calle1: 'Constitución',
    altura: '678',
    barrio: 'Barrio EVA',
    nivelUrgencia: 'media',
    estado: 'asignado',
    asignadoA: '3',
    areaAsignada: 'Servicios Públicos',
    fechaCreacion: '2025-10-29',
    fechaActualizacion: '2025-10-29',
    actividades: [],
    archivos: [],
    comentarios: []
  },
  {
    id: '011',
    numeroSeguimiento: 'VM-2025-011',
    categoria: 'otros',
    descripcion: 'Pérdida de agua en red domiciliaria afectando vereda',
    calle1: 'Independencia',
    altura: '892',
    barrio: 'Barrio Trapiche',
    nivelUrgencia: 'alta',
    estado: 'en_proceso',
    asignadoA: '3',
    areaAsignada: 'Servicios Públicos',
    fechaCreacion: '2025-10-27',
    fechaActualizacion: '2025-10-29',
    actividades: [
      {
        id: 'a9',
        descripcion: 'Se cortó el suministro temporalmente en la zona',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-28 13:00'
      },
      {
        id: 'a10',
        descripcion: 'Cuadrilla trabajando en reparación de caño',
        personal: 'Carlos Rodríguez',
        fecha: '2025-10-29 08:30'
      }
    ],
    archivos: [],
    comentarios: []
  },
  {
    id: '012',
    numeroSeguimiento: 'VM-2025-012',
    categoria: 'otros',
    descripcion: 'Árbol caído obstaculizando paso peatonal',
    calle1: 'Balcarce',
    calle2: 'Chacabuco',
    altura: '445',
    barrio: 'Villa Lourdes',
    nivelUrgencia: 'urgente',
    estado: 'resuelto',
    asignadoA: '2',
    areaAsignada: 'Obras Públicas',
    fechaCreacion: '2025-10-25',
    fechaActualizacion: '2025-10-26',
    actividades: [
      {
        id: 'a11',
        descripcion: 'Se despejó el árbol caído con equipo especializado',
        personal: 'María González',
        fecha: '2025-10-25 16:00'
      },
      {
        id: 'a12',
        descripcion: 'Se limpió completamente el área afectada',
        personal: 'María González',
        fecha: '2025-10-26 10:00'
      }
    ],
    archivos: [],
    comentarios: ['Excelente respuesta ante la emergencia']
  }
];

export const categoryLabels: Record<ClaimCategory, string> = {
  luminaria: 'Luminarias',
  bache: 'Baches',
  maleza: 'Maleza',
  basura: 'Basura',
  señalizacion: 'Señalización',
  otros: 'Otros'
};

export const statusLabels: Record<ClaimStatus, string> = {
  pendiente: 'Pendiente',
  asignado: 'Asignado',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado'
};

export const urgencyLabels: Record<UrgencyLevel, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente'
};

export const statusColors: Record<ClaimStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  asignado: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-purple-100 text-purple-800',
  resuelto: 'bg-green-100 text-green-800',
  cerrado: 'bg-gray-100 text-gray-800'
};

export const urgencyColors: Record<UrgencyLevel, string> = {
  baja: 'bg-green-100 text-green-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800'
};