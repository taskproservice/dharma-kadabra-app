import * as React from "react";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PasswordReset } from "../../../emails/PasswordReset";
import { createSessionToken, customerSessionCookie, customerSessionMaxAge, hashPassword, verifyPassword } from "../../../lib/customer-auth";
import { getAuthSecret } from "../../../lib/auth-secret";
import { burnPasswordCheck } from "../../../lib/password";
import { prisma } from "../../../lib/prisma";
import { appBaseUrl, sendEmail } from "../../../lib/resend";

/**
 * Inicio de sesión / registro / recuperación / cierre de sesión de clientes.
 * Excepción explícita al RBAC: es el endpoint que EMITE la sesión, por lo que
 * no puede exigir una sesión previa. El resto de /api pasa por `authorize()`.
 *
 * - `recover`: solicita el enlace de restablecimiento. Responde siempre con
 *   éxito genérico (sin revelar si el correo existe).
 * - `reset`: canjea el token del correo por una contraseña nueva.
 */
export const dynamic = "force-dynamic";

const authSchema = z.object({
  mode: z.enum(["register", "login", "recover", "reset"]),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(180).optional(),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(10).max(128).optional(),
  token: z.string().trim().min(16).max(256).optional(),
});

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Genera el token real de recuperación en Prisma y envía la plantilla
 * `PasswordReset` vía Resend usando `NEXT_PUBLIC_APP_URL` como URL base.
 */
export async function requestCustomerPasswordReset(rawEmail: string, requestOrigin?: string) {
  const email = rawEmail.trim().toLowerCase();
  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (customer) {
      const token = randomBytes(32).toString("hex");
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          resetTokenHash: hashResetToken(token),
          resetTokenExpiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      const baseUrl = appBaseUrl(requestOrigin);
      const resetUrl = `${baseUrl}/mi-cuenta/restablecer?token=${token}`;

      await sendEmail({
        to: customer.email,
        subject: "Restablece tu contraseña · Dharma Kadabra",
        react: React.createElement(PasswordReset, {
          resetUrl,
          userName: customer.name,
          expiresInLabel: "1 hora",
        }),
      });
    }
  } catch (error) {
    // Respuesta genérica siempre: nunca revelar si el correo existe ni si falló el envío.
    console.error("Error al solicitar recuperación de contraseña:", error);
  }
  return NextResponse.json({ ok: true });
}

async function handleReset(token: string, password: string) {
  const tokenHash = hashResetToken(token);
  let customer: { id: string; resetTokenExpiresAt: Date | null } | null = null;
  try {
    customer = await prisma.customer.findFirst({
      where: { resetTokenHash: tokenHash },
      select: { id: true, resetTokenExpiresAt: true },
    });
  } catch (error) {
    console.error("Error al validar el token de recuperación:", error);
    return NextResponse.json({ error: "No fue posible validar el enlace. Inténtalo de nuevo." }, { status: 500 });
  }

  if (!customer || !customer.resetTokenExpiresAt || customer.resetTokenExpiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "El enlace no es válido o ya expiró. Solicita uno nuevo desde Mi Cuenta." },
      { status: 400 },
    );
  }

  try {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash: hashPassword(password),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return NextResponse.json({ error: "No fue posible restablecer tu contraseña. Inténtalo de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const parsed = authSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa tus datos. La contraseña debe tener al menos 10 caracteres." }, { status: 400 });

  const { mode } = parsed.data;

  if (mode === "recover") {
    if (!parsed.data.email) return NextResponse.json({ error: "Escribe tu correo electrónico." }, { status: 400 });
    return requestCustomerPasswordReset(parsed.data.email, new URL(request.url).origin);
  }

  if (mode === "reset") {
    if (!parsed.data.token || !parsed.data.password) {
      return NextResponse.json({ error: "Escribe tu contraseña nueva." }, { status: 400 });
    }
    return handleReset(parsed.data.token, parsed.data.password);
  }

  if (!getAuthSecret()) return NextResponse.json({ error: "La cuenta aún no está configurada para iniciar sesión. Contacta a soporte." }, { status: 503 });
  if (!parsed.data.email || !parsed.data.password) {
    return NextResponse.json({ error: "Revisa tus datos. La contraseña debe tener al menos 10 caracteres." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  let customer = await prisma.customer.findUnique({ where: { email } });

  if (mode === "register") {
    if (customer) return NextResponse.json({ error: "Ya existe una cuenta con ese correo. Inicia sesión." }, { status: 409 });
    if (!parsed.data.name) return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });

    try {
      customer = await prisma.customer.create({
        data: {
          name: parsed.data.name,
          email,
          phone: parsed.data.phone || null,
          passwordHash: hashPassword(passwordSafe(parsed.data.password))
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

function passwordSafe(value: string): string {
  return value;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(customerSessionCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
