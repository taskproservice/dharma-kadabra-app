/**
 * Correos transaccionales con Resend.
 *
 * - Con `RESEND_API_KEY` configurada envía correos reales.
 * - Sin key (desarrollo local) registra el correo en consola y devuelve
 *   `skipped: true`: el flujo de negocio nunca se rompe por falta de email.
 *
 * El remitente se configura con `RESEND_FROM_EMAIL`
 * (por defecto: `Dharma Kadabra <hola@dharmakadabra.mx>`; el dominio debe
 * estar verificado en Resend).
 */
import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey) return null;
  client ??= new Resend(apiKey);
  return client;
}

export function fromEmail(): string {
  return (process.env.RESEND_FROM_EMAIL ?? "").trim() || "Dharma Kadabra <hola@dharmakadabra.mx>";
}

/**
 * URL pública del sitio para construir enlaces en los correos.
 * Prefiere `NEXT_PUBLIC_APP_URL`; si no, usa `NEXTAUTH_URL` y, como último
 * recurso, el origen de la petición actual.
 */
export function appBaseUrl(requestOrigin?: string): string {
  const configured =
    (process.env.NEXT_PUBLIC_APP_URL ?? "").trim() || (process.env.NEXTAUTH_URL ?? "").trim();
  const base = configured || (requestOrigin ?? "").trim();
  return base.replace(/\/+$/, "");
}

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
}

export interface SendResult {
  ok: boolean;
  /** true cuando no hay RESEND_API_KEY y el correo solo se registró en consola. */
  skipped?: boolean;
}

/**
 * Envía un correo transaccional. Nunca lanza: un fallo de email no debe
 * tumbar la reserva ni el flujo de recuperación.
 */
export async function sendTransactionalEmail(email: TransactionalEmail): Promise<SendResult> {
  const resend = getClient();
  if (!resend) {
    console.log(`[email:dev] (sin RESEND_API_KEY) → ${email.to} · ${email.subject}`);
    return { ok: false, skipped: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail(),
      to: email.to,
      subject: email.subject,
      html: email.html,
    });
    if (error) {
      console.error(`[email] Resend rechazó el envío a ${email.to}:`, error);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error(`[email] Error al enviar correo a ${email.to}:`, error);
    return { ok: false };
  }
}
