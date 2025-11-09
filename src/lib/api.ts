// src/lib/api.ts
// (Versión actualizada para conectar con el backend de Hono/Supabase)

import { User, Claim } from '../types/index';

// URL base de tu función de Supabase.
// Usamos el Project ID de tu archivo info.tsx
const PROJECT_ID = 'awookjslyungvgfgvvwq';
// El nombre de la carpeta de tu función (la que desplegaste)
const FUNCTION_NAME = 'server'; 
// El prefijo de tus rutas en Hono
const ROUTE_PREFIX = 'make-server-5a662287'; 

const API_BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}/${ROUTE_PREFIX}`;

// ===== AUTH HELPERS =====

// Obtiene el token de la sesión actual (Supabase lo guarda en localStorage)
function getAuthToken(): string | null {
  // Supabase guarda la sesión bajo una clave específica
  const sessionKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
  if (!sessionKey) return null;
  
  const sessionData = localStorage.getItem(sessionKey);
  if (!sessionData) return null;
  
  try {
    const parsed = JSON.parse(sessionData);
    return parsed.access_token || null;
  } catch (e) {
    console.error("Error parsing auth token:", e);
    return null;
  }
}

// Un wrapper para fetch que añade automáticamente el token
async function fetchApi(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Intenta parsear la respuesta como JSON
  const responseData = await response.json().catch(() => {
    // Si falla el parseo (ej. 500 error), devuelve un error genérico
    return { error: `Error del servidor: ${response.statusText}` };
  });

  if (!response.ok) {
    console.error(`Error en ${options.method || 'GET'} ${path}:`, responseData);
    // Usa el mensaje de error del backend si existe, si no, usa el statusText
    throw new Error(responseData.error || `Error en el servidor: ${response.statusText}`);
  }
  
  return responseData;
}

// ===== AUTH API (Ahora usa el backend real) =====

export async function signup(data: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  role: string;
  area?: string;
}) {
  return fetchApi('/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(email: string, password: string) {
  const data = await fetchApi('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Guardar el token (Supabase ya lo hace, pero para estar seguros)
  if (data.session?.access_token) {
     const sessionKey = `sb-${PROJECT_ID}-auth-token`;
     localStorage.setItem(sessionKey, JSON.stringify(data.session));
  }
  return data; // Devuelve { session, user }
}

export async function getSession() {
  const token = getAuthToken();
  if (!token) {
    return { session: null, user: null };
  }
  
  try {
    // Usamos el endpoint /session que valida nuestro token
    return await fetchApi('/session', { method: 'GET' });
  } catch (e) {
    console.warn("Error validando sesión:", e);
    // Si el token es inválido, el backend devolverá un error.
    // Limpiamos el token viejo.
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
    return { session: null, user: null };
  }
}

export async function logout() {
  // El backend no hace nada, solo limpiamos el storage local
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Devolvemos una promesa para mantener la consistencia
  return Promise.resolve({ message: 'Sesión cerrada' });
}

// ===== USER API (Ahora usa el backend real) =====

export async function getUsers(): Promise<{ users: User[] }> {
  return fetchApi('/users', { method: 'GET' });
}

export async function updateUserStatus(userId: string, accountStatus: string) {
  return fetchApi(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ accountStatus }),
  });
}

// ===== CLAIM API (Ahora usa el backend real) =====

export async function getClaims(): Promise<{ claims: Claim[] }> {
  return fetchApi('/claims', { method: 'GET' });
}

export async function getClaimByTrackingNumber(trackingNumber: string): Promise<{ claim: Claim }> {
  return fetchApi(`/claims/tracking/${trackingNumber}`, { method: 'GET' });
}

export async function createClaim(claimData: Partial<Claim>): Promise<{ claim: Claim }> {
  return fetchApi('/claims', {
    method: 'POST',
    body: JSON.stringify(claimData),
  });
}

export async function updateClaim(claimId: string, updates: Partial<Claim>): Promise<{ claim: Claim }> {
  // El backend maneja la adición de actividades por separado.
  const claimUpdates = { ...updates };
  // No enviar el array de actividades
  delete (claimUpdates as any).actividades; 

  return fetchApi(`/claims/${claimId}`, {
    method: 'PATCH',
    body: JSON.stringify(claimUpdates),
  });
}

export async function deleteClaim(claimId: string) {
  return fetchApi(`/claims/${claimId}`, {
    method: 'DELETE',
  });
}

// Función especial para 'EditarReclamoDialog'
export async function updateClaimAndAddActivity(updatedClaim: Claim, newActivity: any | null) {
  
  // 1. Actualizar el reclamo principal (estado, etc.)
  await updateClaim(updatedClaim.id, updatedClaim);
  
  // 2. Si hay una nueva actividad, añadirla
  if (newActivity && newActivity.descripcion) {
    await fetchApi(`/claims/${updatedClaim.id}/activity`, {
      method: 'POST',
      body: JSON.stringify(newActivity),
    });
  }

  // 3. Devolver el reclamo actualizado
  // (getClaims es la forma más fácil de obtener la versión más reciente con todo)
  const { claims } = await getClaims();
  const finalClaim = claims.find(c => c.id === updatedClaim.id);
  
  if (!finalClaim) {
    throw new Error("No se pudo recargar el reclamo actualizado");
  }
  
  return { claim: finalClaim };
}


export async function addComment(claimId: string, comentario: string): Promise<{ claim: Claim }> {
  return fetchApi(`/claims/${claimId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comentario }),
  });
}

// ===== STATS API =====
export async function getStats(): Promise<{ claims: Claim[] }> {
  // Las estadísticas se calculan en el frontend,
  // así que solo necesitamos los reclamos.
  return getClaims();
}