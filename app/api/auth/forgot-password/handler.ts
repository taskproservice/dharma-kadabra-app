import { NextResponse } from "next/server";
import { z } from "zod";
import { requestCustomerPasswordReset } from "../../customer-auth/handler";

export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Escribe un correo electrónico válido.").max(180),
});

/**
 * POST /api/auth/forgot-password
 * Genera un token criptográfico real en Prisma (`Customer`) y envía el correo
 * `PasswordReset` mediante Resend con la URL base de `NEXT_PUBLIC_APP_URL`.
 */
export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Escribe un correo electrónico válido." },
      { status: 400 },
    );
  }

  return requestCustomerPasswordReset(parsed.data.email, new URL(request.url).origin);
}
