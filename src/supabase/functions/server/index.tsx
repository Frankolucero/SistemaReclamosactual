// src/supabase/functions/server/index.tsx
// (Versión actualizada con rutas para RECLAMOS)
console.log("--- VERSIÓN ACTUALIZADA DEL SERVIDOR DESPLEGADA (14:37) ---"); // <-- AÑADE ESTA LÍNEA
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono().basePath('/server');

// Variable para el cliente de Supabase
let supabaseAdmin: SupabaseClient;

// Middleware
app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ===== HELPER: OBTENER CLIENTE Y USUARIO =====
// Usamos este middleware para inicializar el cliente de Supabase
// con el token del usuario que hace la petición.
app.use('/make-server-5a662287/*', async (c, next) => {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }
  await next();
});

// Función para obtener el usuario (de KV) a partir del token
async function getCurrentUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  // Usamos el cliente admin para obtener el usuario de Auth
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  
  // Usamos el KV store para obtener los detalles (rol, etc.)
  const userData = await kv.get(`user:${user.id}`);
  return userData;
}


// ===== INICIALIZACIÓN (igual que antes) =====
async function initializeModerator() {
  try {
    if (!supabaseAdmin) {
      supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
    }
    const moderatorEmail = 'juan.perez@villamercedes.gob.ar';
    const moderatorPassword = 'admin123';
    
    const existingMods = await kv.getByPrefix('user:');
    const modExists = existingMods.find(u => u.email === moderatorEmail);
    
    if (modExists) {
      console.log('Moderador ya existe');
      return;
    }
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: moderatorEmail,
      password: moderatorPassword,
      email_confirm: true,
      user_metadata: {
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+54 266 123-4567',
        role: 'moderador'
      }
    });
    
    if (authError) {
      if (authError.message.includes('Email rate limit exceeded')) {
         console.warn('Rate limit creando usuario, reintentando...');
      } else if (authError.code === 'email_exists') {
        console.log('Usuario moderador ya existe en Auth, buscando...');
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listando usuarios:', listError);
          return;
        }
        
        const existingUser = users?.find(u => u.email === moderatorEmail);
        if (existingUser) {
          await kv.set(`user:${existingUser.id}`, {
            id: existingUser.id,
            nombre: 'Juan',
            apellido: 'Pérez',
            telefono: '+54 266 123-4567',
            email: moderatorEmail,
            role: 'moderador',
            accountStatus: 'active'
          });
          console.log('Moderador guardado en KV');
        }
      } else {
        console.error('Error creando moderador:', authError);
      }
      return;
    }
    
    if (authData.user) {
      await kv.set(`user:${authData.user.id}`, {
        id: authData.user.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+54 266 123-4567',
        email: moderatorEmail,
        role: 'moderador',
        accountStatus: 'active'
      });
      console.log('✅ Moderador creado exitosamente');
    }
  } catch (error) {
    console.error('Error inicializando moderador:', error);
  }
}
initializeModerator();

// ===== ENDPOINTS DE AUTENTICACIÓN (igual que antes) =====

app.get("/make-server-5a662287/health", (c) => c.json({ status: "ok" }));

app.post("/make-server-5a662287/fix-moderator", async (c) => {
  try {
    const moderatorEmail = 'juan.perez@villamercedes.gob.ar';
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) return c.json({ error: 'Error listando usuarios' }, 500);
    const moderator = users?.find(u => u.email === moderatorEmail);
    if (!moderator) return c.json({ error: 'Moderador no encontrado en Auth' }, 404);

    await supabaseAdmin.auth.admin.updateUserById(moderator.id, { email_confirm: true });
    
    const userData = {
      id: moderator.id,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+54 266 123-4567',
      email: moderatorEmail,
      role: 'moderador',
      accountStatus: 'active'
    };
    await kv.set(`user:${moderator.id}`, userData);
    
    return c.json({ message: '✅ Moderador activado exitosamente', user: userData });
  } catch (error) {
    console.error('Error activando moderador:', error);
    return c.json({ error: 'Error activando moderador' }, 500);
  }
});

app.post("/make-server-5a662287/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellido, telefono, role, area } = body;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, 
      user_metadata: { nombre, apellido, telefono, role, area }
    });
    
    if (authError) {
      console.error('Error en signup:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    if (!authData.user) return c.json({ error: 'No se pudo crear la cuenta' }, 500);
    
    const userData = {
      id: authData.user.id,
      nombre,
      apellido,
      telefono,
      email,
      role,
      area: area || undefined,
      accountStatus: 'pending' 
    };
    
    await kv.set(`user:${authData.user.id}`, userData);
    
    return c.json({ 
      message: 'Cuenta creada. Esperando aprobación del moderador.',
      user: userData 
    });
  } catch (error) {
    console.error('Error en signup:', error);
    return c.json({ error: 'Error al crear cuenta' }, 500);
  }
});

app.post("/make-server-5a662287/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error de login:', error);
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }
    
    if (!data.session || !data.user) return c.json({ error: 'Credenciales inválidas' }, 401);
    
    const isModerator = email === 'juan.perez@villamercedes.gob.ar';
    let userData = await kv.get(`user:${data.user.id}`);
    
    if (!userData) {
      userData = {
        id: data.user.id,
        nombre: data.user.user_metadata?.nombre || 'Usuario',
        apellido: data.user.user_metadata?.apellido || '',
        telefono: data.user.user_metadata?.telefono || '',
        email: data.user.email || email,
        role: data.user.user_metadata?.role || 'usuario',
        area: data.user.user_metadata?.area,
        accountStatus: isModerator ? 'active' : (data.user.email_confirmed_at ? 'active' : 'pending')
      };
      await kv.set(`user:${data.user.id}`, userData);
    } else if (isModerator && userData.accountStatus !== 'active') {
      userData.accountStatus = 'active';
      await kv.set(`user:${data.user.id}`, userData);
      console.log('✅ Moderador activado automáticamente');
    }
    
    if (!isModerator && userData.accountStatus !== 'active') {
      return c.json({ 
        error: 'Cuenta no activada. Esperando aprobación del moderador.',
        accountStatus: userData.accountStatus 
      }, 403);
    }
    
    console.log(`✅ Login exitoso: ${email} (${userData.role})`);
    
    return c.json({
      session: data.session,
      user: userData
    });
  } catch (error) {
    console.error('Error en login:', error);
    return c.json({ error: 'Error en el servidor' }, 500);
  }
});

app.get("/make-server-5a662287/session", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ session: null, user: null });
    
    const token = authHeader.split(' ')[1];
    if (!token) return c.json({ session: null, user: null });
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return c.json({ session: null, user: null });
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) return c.json({ session: null, user: null });
    
    return c.json({
      session: { access_token: token },
      user: userData
    });
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return c.json({ session: null, user: null });
  }
});

app.post("/make-server-5a662287/logout", (c) => {
  // El logout real lo maneja el cliente borrando el token
  return c.json({ message: 'Sesión cerrada' });
});

app.get("/make-server-5a662287/users", async (c) => {
  try {
    const currentUser = await getCurrentUser(c);
    if (!currentUser || currentUser.role !== 'moderador') {
      return c.json({ error: 'Acceso denegado. Solo moderadores.' }, 403);
    }
    
    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return c.json({ error: 'Error obteniendo usuarios' }, 500);
  }
});

app.patch("/make-server-5a662287/users/:userId", async (c) => {
  try {
    const currentUser = await getCurrentUser(c);
    if (!currentUser || currentUser.role !== 'moderador') {
      return c.json({ error: 'Acceso denegado. Solo moderadores.' }, 403);
    }
    
    const userId = c.req.param('userId');
    const { accountStatus } = await c.req.json();
    const targetUser = await kv.get(`user:${userId}`);
    
    if (!targetUser) return c.json({ error: 'Usuario no encontrado' }, 404);
    
    targetUser.accountStatus = accountStatus;
    await kv.set(`user:${userId}`, targetUser);
    
    if (accountStatus === 'active') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
    }
    
    return c.json({ message: 'Usuario actualizado', user: targetUser });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return c.json({ error: 'Error actualizando usuario' }, 500);
  }
});


// ===================================================
// ===== NUEVOS ENDPOINTS PARA RECLAMOS (CLAIMS) =====
// ===================================================

// OBTENER TODOS LOS RECLAMOS (CON SUS ACTIVIDADES)
app.get("/make-server-5a662287/claims", async (c) => {
  try {
    // Usamos el cliente admin para bypass RLS y que el backend pueda leer todo
    const { data: claims, error } = await supabaseAdmin
      .from('claims')
      .select(`
        *,
        activities ( * )
      `)
      .order('fechaCreacion', { ascending: false });

    if (error) throw error;

    // Renombramos 'activities' a 'actividades' como espera tu frontend
    const formattedClaims = claims.map(claim => ({
      ...claim,
      actividades: claim.activities || []
    }));
    
    return c.json({ claims: formattedClaims });
  } catch (error) {
    console.error('Error getClaims:', error);
    return c.json({ error: error.message }, 500);
  }
});

// OBTENER UN RECLAMO POR NÚMERO DE SEGUIMIENTO
app.get("/make-server-5a662287/claims/tracking/:trackingNumber", async (c) => {
  try {
    const trackingNumber = c.req.param('trackingNumber');
    const { data: claim, error } = await supabaseAdmin
      .from('claims')
      .select(`
        *,
        activities ( * )
      `)
      .eq('numeroSeguimiento', trackingNumber)
      .single();

    if (error) throw error;
    if (!claim) return c.json({ error: 'Reclamo no encontrado' }, 404);

    const formattedClaim = {
      ...claim,
      actividades: claim.activities || []
    };

    return c.json({ claim: formattedClaim });
  } catch (error) {
    console.error('Error getClaimByTrackingNumber:', error);
    return c.json({ error: error.message }, 500);
  }
});


// CREAR UN NUEVO RECLAMO
app.post("/make-server-5a662287/claims", async (c) => {
  try {
    const currentUser = await getCurrentUser(c);
    if (currentUser?.role !== 'moderador') {
      return c.json({ error: 'Solo los moderadores pueden crear reclamos' }, 403);
    }
    
    const body = await c.req.json();
    
    // 1. Contar reclamos para generar el nuevo número de seguimiento
    const { count, error: countError } = await supabaseAdmin
      .from('claims')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    const newId = (count || 0) + 1;
    const numeroSeguimiento = `VM-2025-${String(newId).padStart(3, '0')}`;
    
    const newClaimData = {
      ...body,
      numeroSeguimiento: numeroSeguimiento,
      comentarios: body.comentarios || [],
      archivos: body.archivos || [],
    };
    
    // Quitamos campos que no van en la tabla principal
    delete newClaimData.actividades; 
    delete newClaimData.id;

    // 2. Insertar el nuevo reclamo
    const { data: newClaim, error: insertError } = await supabaseAdmin
      .from('claims')
      .insert(newClaimData)
      .select()
      .single();
      
    if (insertError) throw insertError;
    
    return c.json({ claim: { ...newClaim, actividades: [] } }, 201);
    
  } catch (error) {
    console.error('Error createClaim:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ACTUALIZAR UN RECLAMO (ESTADO, ASIGNACIÓN, ETC.)
app.patch("/make-server-5a662287/claims/:id", async (c) => {
  try {
    const claimId = c.req.param('id');
    const updates = await c.req.json();
    
    // El frontend envía 'actividades',
    // pero no queremos guardar ese array en la tabla 'claims'.
    delete updates.actividades; 
    delete updates.activities; // Por si acaso
    
    // Asegurarse de actualizar la fecha
    updates.fechaActualizacion = new Date().toISOString();

    const { data: updatedClaim, error } = await supabaseAdmin
      .from('claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single();
      
    if (error) throw error;
    
    return c.json({ claim: updatedClaim });
  } catch (error) {
    console.error('Error updateClaim:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ELIMINAR UN RECLAMO
app.delete("/make-server-5a662287/claims/:id", async (c) => {
  try {
    const currentUser = await getCurrentUser(c);
    if (currentUser?.role !== 'moderador') {
      return c.json({ error: 'Solo los moderadores pueden eliminar reclamos' }, 403);
    }
    
    const claimId = c.req.param('id');
    
    // Borrará en cascada las actividades
    const { error } = await supabaseAdmin
      .from('claims')
      .delete()
      .eq('id', claimId);
      
    if (error) throw error;
    
    return c.json({ message: 'Reclamo eliminado' });
  } catch (error) {
    console.error('Error deleteClaim:', error);
    return c.json({ error: error.message }, 500);
  }
});

// AÑADIR UNA ACTIVIDAD A UN RECLAMO
app.post("/make-server-5a662287/claims/:id/activity", async (c) => {
  try {
    const claimId = c.req.param('id');
    const activityData = await c.req.json();
    
    const { data: newActivity, error } = await supabaseAdmin
      .from('activities')
      .insert({
        claim_id: claimId,
        descripcion: activityData.descripcion,
        personal: activityData.personal,
        fecha: activityData.fecha,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Actualizar la fecha del reclamo principal
    await supabaseAdmin
      .from('claims')
      .update({ fechaActualizacion: new Date().toISOString() })
      .eq('id', claimId);
    
    return c.json({ activity: newActivity }, 201);
  } catch (error) {
    console.error('Error addActivity:', error);
    return c.json({ error: error.message }, 500);
  }
});

// AÑADIR UN COMENTARIO A UN RECLAMO
app.post("/make-server-5a662287/claims/:id/comment", async (c) => {
  try {
    const claimId = c.req.param('id');
    const { comentario } = await c.req.json();

    const { data: claim, error: fetchError } = await supabaseAdmin
      .from('claims')
      .select('comentarios')
      .eq('id', claimId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const comentariosActuales = claim.comentarios || [];
    const nuevosComentarios = [...comentariosActuales, comentario];

    const { data: updatedClaim, error: updateError } = await supabaseAdmin
      .from('claims')
      .update({ 
        comentarios: nuevosComentarios,
        fechaActualizacion: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();
      
    if (updateError) throw updateError;

    // Devolvemos el reclamo completo con sus actividades
    const { data: finalClaim, error: finalFetchError } = await supabaseAdmin
      .from('claims')
      .select(`*, activities (*)`)
      .eq('id', claimId)
      .single();
      
    if (finalFetchError) throw finalFetchError;

    return c.json({ claim: { ...finalClaim, actividades: finalClaim.activities || [] } });
  } catch (error) {
    console.error('Error addComment:', error);
    return c.json({ error: error.message }, 500);
  }
});


// ===== FIN =====
Deno.serve(app.fetch);