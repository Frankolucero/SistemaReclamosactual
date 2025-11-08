import { User, Claim } from '../types/index';
import { mockUsers, mockClaims } from './mockData';

// Datos en memoria
let users: User[] = [...mockUsers];
let claims: Claim[] = [...mockClaims];
let claimCounter = claims.length;
let currentUser: User | null = null;

// Simular delay de red
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== AUTH API =====

export async function signup(data: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  role: string;
  area?: string;
}) {
  await delay();
  
  // Verificar si el email ya existe
  if (users.find(u => u.email === data.email)) {
    throw new Error('El email ya está registrado');
  }
  
  const newUser: User = {
    id: String(users.length + 1),
    nombre: data.nombre,
    apellido: data.apellido,
    telefono: data.telefono,
    email: data.email,
    role: data.role as any,
    area: data.area,
    accountStatus: 'pending' // Requiere aprobación
  };
  
  users.push(newUser);
  
  return {
    message: 'Cuenta creada. Esperando aprobación del moderador.',
    user: newUser
  };
}

export async function login(email: string, password: string) {
  await delay();
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  
  // Verificar credenciales hardcoded para usuarios de prueba
  const validCredentials = [
    { email: 'juan.perez@villamercedes.gob.ar', password: 'admin123' },
    { email: 'maria.gonzalez@villamercedes.gob.ar', password: 'externo123' },
    { email: 'carlos.rodriguez@villamercedes.gob.ar', password: 'externo123' }
  ];
  
  const isValidCredential = validCredentials.find(
    c => c.email === email && c.password === password
  );
  
  if (!isValidCredential && password !== 'demo123') {
    throw new Error('Credenciales inválidas');
  }
  
  // Verificar si la cuenta está activa
  if (user.accountStatus !== 'active') {
    throw new Error('Cuenta no activada. Esperando aprobación del moderador.');
  }
  
  currentUser = user;
  
  return {
    session: { access_token: 'mock-token' },
    user
  };
}

export async function getSession() {
  await delay(100);
  
  if (!currentUser) {
    return { session: null, user: null };
  }
  
  return {
    session: { access_token: 'mock-token' },
    user: currentUser
  };
}

export async function logout() {
  await delay(100);
  currentUser = null;
  return { message: 'Sesión cerrada' };
}

export function setAuthToken(token: string | null) {
  // Mock - no hace nada
}

export function getAuthToken() {
  return 'mock-token';
}

// ===== USER API =====

export async function getUsers(): Promise<{ users: User[] }> {
  await delay();
  return { users: [...users] };
}

export async function updateUserStatus(userId: string, accountStatus: string) {
  await delay();
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  user.accountStatus = accountStatus as any;
  
  return { user };
}

// ===== CLAIM API =====

export async function getClaims(): Promise<{ claims: Claim[] }> {
  await delay();
  return { claims: [...claims] };
}

export async function getClaimByTrackingNumber(trackingNumber: string): Promise<{ claim: Claim }> {
  await delay();
  
  const claim = claims.find(c => c.numeroSeguimiento === trackingNumber);
  if (!claim) {
    throw new Error('Reclamo no encontrado');
  }
  
  return { claim };
}

export async function createClaim(claimData: Partial<Claim>): Promise<{ claim: Claim }> {
  await delay();
  
  claimCounter++;
  const id = String(claimCounter).padStart(3, '0');
  const numeroSeguimiento = `VM-2025-${id}`;
  const now = new Date().toISOString().split('T')[0];
  
  const newClaim: Claim = {
    id,
    numeroSeguimiento,
    categoria: claimData.categoria!,
    descripcion: claimData.descripcion!,
    calle1: claimData.calle1!,
    calle2: claimData.calle2,
    altura: claimData.altura!,
    barrio: claimData.barrio!,
    nivelUrgencia: claimData.nivelUrgencia!,
    estado: claimData.estado || 'pendiente',
    asignadoA: claimData.asignadoA,
    areaAsignada: claimData.areaAsignada,
    fechaCreacion: now,
    fechaActualizacion: now,
    actividades: [],
    archivos: [],
    comentarios: []
  };
  
  claims.push(newClaim);
  
  return { claim: newClaim };
}

export async function updateClaim(claimId: string, updates: Partial<Claim>): Promise<{ claim: Claim }> {
  await delay();
  
  const claim = claims.find(c => c.id === claimId);
  if (!claim) {
    throw new Error('Reclamo no encontrado');
  }
  
  const now = new Date().toISOString().split('T')[0];
  
  Object.assign(claim, updates, {
    fechaActualizacion: now
  });
  
  return { claim };
}

export async function deleteClaim(claimId: string) {
  await delay();
  
  const index = claims.findIndex(c => c.id === claimId);
  if (index === -1) {
    throw new Error('Reclamo no encontrado');
  }
  
  claims.splice(index, 1);
  
  return { message: 'Reclamo eliminado' };
}

export async function addActivity(claimId: string, descripcion: string): Promise<{ claim: Claim }> {
  await delay();
  
  const claim = claims.find(c => c.id === claimId);
  if (!claim) {
    throw new Error('Reclamo no encontrado');
  }
  
  if (!currentUser) {
    throw new Error('No autorizado');
  }
  
  const activity = {
    id: `a${Date.now()}`,
    descripcion,
    personal: `${currentUser.nombre} ${currentUser.apellido}`,
    fecha: new Date().toLocaleString('es-AR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '')
  };
  
  claim.actividades.push(activity);
  claim.fechaActualizacion = new Date().toISOString().split('T')[0];
  
  return { claim };
}

export async function addComment(claimId: string, comentario: string): Promise<{ claim: Claim }> {
  await delay();
  
  const claim = claims.find(c => c.id === claimId);
  if (!claim) {
    throw new Error('Reclamo no encontrado');
  }
  
  claim.comentarios.push(comentario);
  claim.fechaActualizacion = new Date().toISOString().split('T')[0];
  
  return { claim };
}

// ===== STATS API =====

export async function getStats(): Promise<{ claims: Claim[] }> {
  await delay();
  return { claims: [...claims] };
}
