// src/supabase/functions/server/index.tsx
// (Versión REFACTORIZADA con tabla 'profiles')
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
// ¡Ya no necesitamos kv_store.tsx!
const app = new Hono().basePath('/server');
let supabaseAdmin;
// --- Middleware (sin cambios) ---
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: [
    "Content-Type",
    "Authorization"
  ],
  allowMethods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS"
  ]
}));
app.use('/make-server-5a662287/*', async (c, next)=>{
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  }
  await next();
});
// --- Helper para obtener el usuario (¡ACTUALIZADO!) ---
async function getCurrentUser(c) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  // 1. Validar el token y obtener el usuario de Auth
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return null;
  // 2. Obtener el perfil de nuestra nueva tabla 'profiles'
  const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
  if (profileError || !profile) {
    console.error("Error: Usuario de Auth existe pero no tiene perfil en 'profiles'", user.id);
    return null;
  }
  // 3. Devolver el perfil completo
  return profile;
}
// ===================================================
// ===== ENDPOINTS DE AUTENTICACIÓN (¡ACTUALIZADOS!) =====
// ===================================================
app.get("/make-server-5a662287/health", (c)=>c.json({
    status: "ok"
  }));
// REGISTRO
app.post("/make-server-5a662287/signup", async (c)=>{
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellido, telefono, role, area } = body;
    // 1. Crear el usuario en 'auth.users'
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });
    if (authError) {
      console.error('Error en Auth signup:', authError);
      return c.json({
        error: authError.message
      }, 400);
    }
    if (!authData.user) return c.json({
      error: 'No se pudo crear la cuenta'
    }, 500);
    // 2. Crear el perfil en 'public.profiles'
    const profileData = {
      id: authData.user.id,
      nombre,
      apellido,
      telefono,
      email,
      role,
      area: area || undefined,
      accountStatus: 'pending' // Estado por defecto
    };
    const { error: profileError } = await supabaseAdmin.from('profiles').insert(profileData);
    if (profileError) {
      console.error('Error creando perfil:', profileError);
      // Opcional: Borrar el usuario de auth si falla la creación del perfil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return c.json({
        error: 'Error al crear el perfil de usuario'
      }, 500);
    }
    return c.json({
      message: 'Cuenta creada. Esperando aprobación del moderador.',
      user: profileData
    });
  } catch (error) {
    console.error('Error en signup:', error);
    return c.json({
      error: 'Error al crear cuenta'
    }, 500);
  }
});
// LOGIN
app.post("/make-server-5a662287/login", async (c)=>{
  try {
    const body = await c.req.json();
    const { email, password } = body;
    const supabaseAnon = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });
    if (authError) {
      console.error('Error de login:', authError);
      return c.json({
        error: 'Credenciales inválidas'
      }, 401);
    }
    if (!authData.session || !authData.user) return c.json({
      error: 'Credenciales inválidas'
    }, 401);
    // 2. Obtener perfil de 'profiles'
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('*').eq('id', authData.user.id).single();
    if (profileError || !profile) {
      return c.json({
        error: 'Perfil de usuario no encontrado'
      }, 404);
    }
    // 3. Comprobar estado de la cuenta (¡Tu lógica de aprobación!)
    if (profile.accountStatus !== 'active') {
      return c.json({
        error: 'Cuenta no activada. Esperando aprobación del moderador.',
        accountStatus: profile.accountStatus
      }, 403);
    }
    console.log(`✅ Login exitoso: ${email} (${profile.role})`);
    return c.json({
      session: authData.session,
      user: profile // Devolvemos el perfil completo
    });
  } catch (error) {
    console.error('Error en login:', error);
    return c.json({
      error: 'Error en el servidor'
    }, 500);
  }
});
// OBTENER SESIÓN
app.get("/make-server-5a662287/session", async (c)=>{
  try {
    const profile = await getCurrentUser(c); // Usa nuestro helper
    if (!profile) {
      return c.json({
        session: null,
        user: null
      }, 401);
    }
    return c.json({
      session: {
        access_token: 'valid'
      },
      user: profile
    });
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return c.json({
      session: null,
      user: null
    });
  }
});
app.post("/make-server-5a662287/logout", (c)=>{
  return c.json({
    message: 'Sesión cerrada'
  });
});
// OBTENER TODOS LOS USUARIOS (PARA EL MODERADOR)
app.get("/make-server-5a662287/users", async (c)=>{
  try {
    const currentUser = await getCurrentUser(c);
    if (!currentUser || currentUser.role !== 'moderador') {
      return c.json({
        error: 'Acceso denegado. Solo moderadores.'
      }, 403);
    }
    // Leemos de la tabla 'profiles'
    const { data: users, error } = await supabaseAdmin.from('profiles').select('*');
    if (error) throw error;
    return c.json({
      users
    });
  } catch (error) {
    return c.json({
      error: 'Error obteniendo usuarios'
    }, 500);
  }
});
// APROBAR/RECHAZAR USUARIO
app.patch("/make-server-5a662287/users/:userId", async (c)=>{
  try {
    const currentUser = await getCurrentUser(c);
    if (!currentUser || currentUser.role !== 'moderador') {
      return c.json({
        error: 'Acceso denegado. Solo moderadores.'
      }, 403);
    }
    const userId = c.req.param('userId');
    const { accountStatus } = await c.req.json(); // 'active' o 'rejected'
    // 1. Actualizar 'profiles'
    const { data: updatedUser, error: profileError } = await supabaseAdmin.from('profiles').update({
      accountStatus
    }).eq('id', userId).select().single();
    if (profileError) throw profileError;
    // 2. Si se activa, confirmar el email en 'auth.users'
    if (accountStatus === 'active') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
    }
    return c.json({
      message: 'Usuario actualizado',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return c.json({
      error: 'Error actualizando usuario'
    }, 500);
  }
});
// ===================================================
// ===== ENDPOINTS DE RECLAMOS (Claims) =====
// ===================================================
// (Aquí puedes pegar la lógica de reclamos que hicimos 
// en el paso anterior, ya que es 100% compatible con esto)
// ... (pegar aquí los endpoints de /claims, /claims/tracking/:trackingNumber, etc.) ...
// OBTENER TODOS LOS RECLAMOS
app.get("/make-server-5a662287/claims", async (c)=>{
  try {
    // Unimos 'claims' con 'profiles' para obtener el nombre del asignado
    const { data: claims, error } = await supabaseAdmin.from('claims').select(`
        *,
        activities ( * ),
        comments ( * ),
        profiles ( nombre, apellido, area ) 
      `).order('fechaCreacion', {
      ascending: false
    });
    if (error) throw error;
    const formattedClaims = claims.map((claim)=>({
        ...claim,
        actividades: claim.activities || [],
        comentarios: claim.comments || [],
        // 'areaAsignada' ahora puede venir del perfil del usuario
        areaAsignada: claim.areaAsignada || claim.profiles?.area,
        asignadoNombre: claim.profiles ? `${claim.profiles.nombre} ${claim.profiles.apellido}` : null
      }));
    return c.json({
      claims: formattedClaims
    });
  } catch (error) {
    console.error('Error getClaims:', error);
    return c.json({
      error: error.message
    }, 500);
  }
});
// CREAR UN NUEVO RECLAMO
app.post("/make-server-5a662287/claims", async (c)=>{
  try {
    const currentUser = await getCurrentUser(c);
    if (currentUser?.role !== 'moderador') {
      return c.json({
        error: 'Solo los moderadores pueden crear reclamos'
      }, 403);
    }
    const body = await c.req.json();
    const newClaimData = {
      categoria: body.categoria,
      descripcion: body.descripcion,
      calle1: body.calle1,
      calle2: body.calle2,
      calle3: body.calle3,
      altura: body.altura,
      barrio: body.barrio,
      nivelUrgencia: body.nivelUrgencia,
      estado: 'pendiente',
      archivos: body.archivos || []
    };
    const { data: newClaim, error: insertError } = await supabaseAdmin.from('claims').insert(newClaimData).select().single();
    if (insertError) throw insertError;
    return c.json({
      claim: {
        ...newClaim,
        actividades: [],
        comentarios: []
      }
    }, 201);
  } catch (error) {
    console.error('Error createClaim:', error);
    return c.json({
      error: error.message
    }, 500);
  }
});
// ACTUALIZAR/ASIGNAR UN RECLAMO
app.patch("/make-server-5a662287/claims/:id", async (c)=>{
  try {
    const claimId = c.req.param('id');
    const updates = await c.req.json();
    // Limpiamos campos que no van en la tabla 'claims'
    delete updates.actividades;
    delete updates.comments;
    delete updates.profiles; // Asegurarse de no mandar el perfil
    updates.fechaActualizacion = new Date().toISOString();
    // Si se asigna un usuario ('asignadoA'), también guardamos el 'area'
    if (updates.asignadoA) {
      const { data: userProfile } = await supabaseAdmin.from('profiles').select('area').eq('id', updates.asignadoA).single();
      if (userProfile) {
        updates.areaAsignada = userProfile.area;
      }
    }
    const { data: updatedClaim, error } = await supabaseAdmin.from('claims').update(updates).eq('id', claimId).select().single();
    if (error) throw error;
    return c.json({
      claim: updatedClaim
    });
  } catch (error) {
    console.error('Error updateClaim:', error);
    return c.json({
      error: error.message
    }, 500);
  }
});
// ELIMINAR UN RECLAMO
app.delete("/make-server-5a662287/claims/:id", async (c)=>{
  // (Lógica sin cambios, ya es correcta)
  try {
    const currentUser = await getCurrentUser(c);
    if (currentUser?.role !== 'moderador') {
      return c.json({
        error: 'Solo los moderadores pueden eliminar reclamos'
      }, 403);
    }
    const claimId = c.req.param('id');
    const { error } = await supabaseAdmin.from('claims').delete().eq('id', claimId);
    if (error) throw error;
    return c.json({
      message: 'Reclamo eliminado'
    });
  } catch (error) {
    return c.json({
      error: 'Error deleteClaim'
    }, 500);
  }
});
// AÑADIR UNA ACTIVIDAD
app.post("/make-server-5a662287/claims/:id/activity", async (c)=>{
  // (Lógica sin cambios, ya es correcta)
  try {
    const claimId = c.req.param('id');
    const activityData = await c.req.json();
    const { data: newActivity, error } = await supabaseAdmin.from('activities').insert({
      claim_id: claimId,
      descripcion: activityData.descripcion,
      personal: activityData.personal,
      fecha: activityData.fecha
    }).select().single();
    if (error) throw error;
    await supabaseAdmin.from('claims').update({
      fechaActualizacion: new Date().toISOString()
    }).eq('id', claimId);
    return c.json({
      activity: newActivity
    }, 201);
  } catch (error) {
    return c.json({
      error: 'Error addActivity'
    }, 500);
  }
});
// AÑADIR UN COMENTARIO
app.post("/make-server-5a662287/claims/:id/comment", async (c)=>{
  // (Lógica sin cambios, ya es correcta)
  try {
    const claimId = c.req.param('id');
    const { comentario } = await c.req.json();
    const currentUser = await getCurrentUser(c);
    const { error: insertError } = await supabaseAdmin.from('comments').insert({
      claim_id: claimId,
      texto: comentario,
      autor_id: currentUser?.id || null
    });
    if (insertError) throw insertError;
    await supabaseAdmin.from('claims').update({
      fechaActualizacion: new Date().toISOString()
    }).eq('id', claimId);
    const { data: finalClaim, error: finalFetchError } = await supabaseAdmin.from('claims').select(`*, activities (*), comments (*), profiles(nombre, apellido, area)`).eq('id', claimId).single();
    if (finalFetchError) throw finalFetchError;
    const formattedClaim = {
      ...finalClaim,
      actividades: finalClaim.activities || [],
      comentarios: finalClaim.comments || [],
      areaAsignada: finalClaim.areaAsignada || finalClaim.profiles?.area,
      asignadoNombre: finalClaim.profiles ? `${finalClaim.profiles.nombre} ${finalClaim.profiles.apellido}` : null
    };
    return c.json({
      claim: formattedClaim
    });
  } catch (error) {
    console.error('Error addComment:', error);
    return c.json({
      error: error.message
    }, 500);
  }
});
// ===== FIN =====
Deno.serve(app.fetch);
