import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, customerSessionCookie, customerSessionMaxAge, hashPassword, verifyPassword } from "../../../lib/customer-auth";
import { getAuthSecret } from "../../../lib/auth-secret";
import { burnPasswordCheck } from "../../../lib/password";
import { prisma } from "../../../lib/prisma";

/**
 * Inicio de sesión / registro / cierre de sesión de clientes.
 * Excepción explícita al RBAC: es el endpoint que EMITE la sesión, por lo que
 * no puede exigir una sesión previa. El resto de /api pasa por `authorize()`.
 */
export const dynamic = "force-dynamic";

const authSchema = z.object({
  mode: z.enum(["register", "login"]),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(10).max(128),
});

export async function POST(request: Request) {
  const parsed = authSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa tus datos. La contraseña debe tener al menos 10 caracteres." }, { status: 400 });
  if (!getAuthSecret()) return NextResponse.json({ error: "La cuenta aún no está configurada para iniciar sesión. Contacta a soporte." }, { status: 503 });

  const email = parsed.data.email.toLowerCase();
  let customer = await prisma.customer.findUnique({ where: { email } });

  if (parsed.data.mode === "register") {
    if (customer) return NextResponse.json({ error: "Ya existe una cuenta con ese correo. Inicia sesión." }, { status: 409 });
    if (!parsed.data.name) return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });
    
    try {
      customer = await prisma.customer.create({ 
        data: { 
          name: parsed.data.name, 
          email, 
          phone: parsed.data.phone || null, 
          passwordHash: hashPassword(parsed.data.password) 
        } 
      });
    } catch {
      return NextResponse.json({ error: "No fue posible crear la cuenta con ese correo." }, { status: 409 });
    }
  } else {
    // MODO LOGIN
    if (!customer) {
      // Ejecutamos la comprobación de contraseña falsa para evitar ataques de tiempo
      burnPasswordCheck(parsed.data.password);
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }
    
    if (!verifyPassword(parsed.data.password, customer.passwordHash)) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }
  }

  // Comprobación de seguridad final para TypeScript (lógicamente nunca será null aquí)
  if (!customer) {
    return NextResponse.json({ error: "Error interno de autenticación." }, { status: 500 });
  }

  const response = NextResponse.json({ customer: { name: customer.name, email: customer.email } });
  response.cookies.set(customerSessionCookie, createSessionToken({ id: customer.id, email: customer.email, name: customer.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: customerSessionMaxAge,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(customerSessionCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}