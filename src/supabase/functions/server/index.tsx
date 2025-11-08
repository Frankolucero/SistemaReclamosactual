import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
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

// ===== INICIALIZACIÓN =====

// Crear cuenta moderador de prueba si no existe
async function initializeModerator() {
  try {
    const moderatorEmail = 'juan.perez@villamercedes.gob.ar';
    const moderatorPassword = 'admin123';
    
    // Verificar si ya existe en KV
    const existingMods = await kv.getByPrefix('user:');
    const modExists = existingMods.find(u => u.email === moderatorEmail);
    
    if (modExists) {
      console.log('Moderador ya existe');
      return;
    }
    
    // Crear usuario en Supabase Auth
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
      if (authError.code === 'email_exists') {
        console.log('Usuario moderador ya existe en Auth, buscando...');
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listando usuarios:', listError);
          return;
        }
        
        const existingUser = users?.find(u => u.email === moderatorEmail);
        if (existingUser) {
          // Guardar en KV
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
      // Guardar en KV con estado activo
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

// Ejecutar inicialización al arrancar
initializeModerator();

// ===== ENDPOINTS =====

// Health check
app.get("/make-server-5a662287/health", (c) => {
  return c.json({ status: "ok" });
});

// Forzar inicialización del moderador (debugging)
app.post("/make-server-5a662287/fix-moderator", async (c) => {
  try {
    const moderatorEmail = 'juan.perez@villamercedes.gob.ar';
    
    // Buscar usuario en Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return c.json({ error: 'Error listando usuarios' }, 500);
    }
    
    const moderator = users?.find(u => u.email === moderatorEmail);
    
    if (!moderator) {
      return c.json({ error: 'Moderador no encontrado en Auth' }, 404);
    }
    
    // Forzar confirmación de email
    await supabaseAdmin.auth.admin.updateUserById(moderator.id, {
      email_confirm: true
    });
    
    // Actualizar/crear en KV con estado activo
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
    
    return c.json({ 
      message: '✅ Moderador activado exitosamente',
      user: userData 
    });
  } catch (error) {
    console.error('Error activando moderador:', error);
    return c.json({ error: 'Error activando moderador' }, 500);
  }
});

// REGISTRO DE CUENTA
app.post("/make-server-5a662287/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellido, telefono, role, area } = body;
    
    // Crear usuario en Supabase Auth (sin confirmar email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // No confirmado automáticamente
      user_metadata: { nombre, apellido, telefono, role, area }
    });
    
    if (authError) {
      console.error('Error en signup:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    if (!authData.user) {
      return c.json({ error: 'No se pudo crear la cuenta' }, 500);
    }
    
    // Guardar en KV con estado PENDING
    const userData = {
      id: authData.user.id,
      nombre,
      apellido,
      telefono,
      email,
      role,
      area: area || undefined,
      accountStatus: 'pending' // Requiere aprobación del moderador
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

// INICIO DE SESIÓN
app.post("/make-server-5a662287/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    // Intentar login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error de login:', error);
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }
    
    if (!data.session || !data.user) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }
    
    // Verificar si es el moderador de prueba
    const isModerator = email === 'juan.perez@villamercedes.gob.ar';
    
    // Obtener datos del usuario desde KV
    let userData = await kv.get(`user:${data.user.id}`);
    
    if (!userData) {
      // Si no existe en KV, crear entrada
      userData = {
        id: data.user.id,
        nombre: data.user.user_metadata?.nombre || 'Usuario',
        apellido: data.user.user_metadata?.apellido || '',
        telefono: data.user.user_metadata?.telefono || '',
        email: data.user.email || email,
        role: data.user.user_metadata?.role || 'usuario',
        area: data.user.user_metadata?.area,
        // El moderador SIEMPRE es active
        accountStatus: isModerator ? 'active' : (data.user.email_confirmed_at ? 'active' : 'pending')
      };
      await kv.set(`user:${data.user.id}`, userData);
    } else if (isModerator && userData.accountStatus !== 'active') {
      // Si es moderador pero no está activo, activarlo automáticamente
      userData.accountStatus = 'active';
      await kv.set(`user:${data.user.id}`, userData);
      console.log('✅ Moderador activado automáticamente');
    }
    
    // Verificar si la cuenta está activa (el moderador siempre pasa)
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

// OBTENER SESIÓN ACTUAL
app.get("/make-server-5a662287/session", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ session: null, user: null });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return c.json({ session: null, user: null });
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ session: null, user: null });
    }
    
    // Obtener datos del usuario desde KV
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ session: null, user: null });
    }
    
    return c.json({
      session: { access_token: token },
      user: userData
    });
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return c.json({ session: null, user: null });
  }
});

// CERRAR SESIÓN
app.post("/make-server-5a662287/logout", async (c) => {
  try {
    await supabase.auth.signOut();
    return c.json({ message: 'Sesión cerrada' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return c.json({ error: 'Error al cerrar sesión' }, 500);
  }
});

// OBTENER LISTA DE USUARIOS (solo moderadores)
app.get("/make-server-5a662287/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ error: 'No autorizado' }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }
    
    const currentUser = await kv.get(`user:${user.id}`);
    
    if (!currentUser || currentUser.role !== 'moderador') {
      return c.json({ error: 'Acceso denegado. Solo moderadores.' }, 403);
    }
    
    // Obtener todos los usuarios
    const users = await kv.getByPrefix('user:');
    
    return c.json({ users });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return c.json({ error: 'Error obteniendo usuarios' }, 500);
  }
});

// ACTIVAR/RECHAZAR USUARIO (solo moderadores)
app.patch("/make-server-5a662287/users/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ error: 'No autorizado' }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }
    
    const currentUser = await kv.get(`user:${user.id}`);
    
    if (!currentUser || currentUser.role !== 'moderador') {
      return c.json({ error: 'Acceso denegado. Solo moderadores.' }, 403);
    }
    
    const userId = c.req.param('userId');
    const { accountStatus } = await c.req.json();
    
    const targetUser = await kv.get(`user:${userId}`);
    
    if (!targetUser) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    // Actualizar estado
    targetUser.accountStatus = accountStatus;
    await kv.set(`user:${userId}`, targetUser);
    
    // Si se activa, confirmar email en Auth
    if (accountStatus === 'active') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
    }
    
    return c.json({ 
      message: 'Usuario actualizado',
      user: targetUser 
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return c.json({ error: 'Error actualizando usuario' }, 500);
  }
});

Deno.serve(app.fetch);
