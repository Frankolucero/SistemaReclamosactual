// ✅ FUNCION COMPLETA DE LOGIN Y REGISTRO CON CORS ✅
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
const app = new Hono().basePath("/server");
let supabaseAdmin;
// ---------------------
// 🧩 MIDDLEWARE GLOBAL
// ---------------------
app.use("*", cors({
  origin: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://awookjslyungvgfgvvwq.supabase.co"
  ],
  allowMethods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS"
  ],
  allowHeaders: [
    "Content-Type",
    "Authorization"
  ],
  exposeHeaders: [
    "Content-Length"
  ],
  credentials: true,
  maxAge: 600
}));
app.use("*", logger());
// ---------------------
// 🧠 CLIENTE ADMIN
// ---------------------
app.use("/make-server-5a662287/*", async (c, next)=>{
  if (!supabaseAdmin) {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  await next();
});
// ---------------------
// 🧾 RUTA: REGISTRO
// ---------------------
app.post("/make-server-5a662287/register", async (c)=>{
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({
    error: "Faltan campos obligatorios"
  }, 400);
  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password
  });
  if (error) return c.json({
    error: error.message
  }, 400);
  return c.json({
    message: "Usuario registrado con éxito",
    data
  }, 200);
});
// ---------------------
// 🔑 RUTA: LOGIN
// ---------------------
app.post("/make-server-5a662287/login", async (c)=>{
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({
    error: "Faltan credenciales"
  }, 400);
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error("Error de login:", error);
    return c.json({
      error: "Credenciales inválidas"
    }, 401);
  }
  return c.json({
    message: "Login exitoso",
    data
  }, 200);
});
// ---------------------
// 🧭 DEFAULT
// ---------------------
app.get("/", (c)=>c.text("Servidor funcionando correctamente 🚀"));
export default app;
