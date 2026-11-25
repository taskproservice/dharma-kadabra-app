import type { ReactElement } from "react";
import { Resend } from "resend";

const initialApiKey = (process.env.RESEND_API_KEY ?? "").trim();

/**
 * Instancia del cliente de Resend inicializada con `process.env.RESEND_API_KEY`.
 * Si la variable no está configurada (p. ej. desarrollo local o CI), se mantiene
 * en `null` para evitar errores al importar el módulo y activar el modo Mock.
 */
export const resend: Resend | null = initialApiKey ? new Resend(initialApiKey) : null;

let cachedApiKey: string | null = initialApiKey || null;
let cachedClient: Resend | null = resend;

function getResendClient(): Resend | null {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey) return null;
  if (cachedClient && cachedApiKey === apiKey) return cachedClient;
  cachedApiKey = apiKey;
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export function fromEmail(): string {
  return (process.env.RESEND_FROM_EMAIL ?? "").trim() || "Dharma Kadabra <hola@dharmakadabra.mx>";
}

/**
 * URL pública del sitio para construir enlaces absolutos en correos.
 * Prioriza `NEXT_PUBLIC_APP_URL`, luego `NEXTAUTH_URL`, el origen de la
 * petición actual y finalmente `http://localhost:3000`.
 */
export function appBaseUrl(requestOrigin?: string): string {
  const configured =
    (process.env.NEXT_PUBLIC_APP_URL ?? "").trim() || (process.env.NEXTAUTH_URL ?? "").trim();
  const base = configured || (requestOrigin ?? "").trim() || "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  mocked: boolean;
  id?: string;
}

/**
 * Función genérica para enviar correos transaccionales con React Email y Resend.
 *
 * - Si `RESEND_API_KEY` no está configurada, imprime en consola
 *   `[Mock Resend] Enviando correo a...` y resuelve sin error para pruebas locales.
 * - Si `RESEND_API_KEY` está activa, envía el correo real mediante el SDK de Resend.
 */
export async function sendEmail({
  to,
  subject,
  react,
  from,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  const recipient = Array.isArray(to) ? to.join(", ") : to;
  const client = getResendClient();

  if (!client) {
    console.log(`[Mock Resend] Enviando correo a ${recipient} | Asunto: "${subject}"`);
    return { ok: true, mocked: true };
  }

  const { data, error } = await client.emails.send({
    from: from ?? fromEmail(),
    to,
    subject,
    react,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error(`[Resend] Error al enviar correo a ${recipient}:`, error);
    throw new Error(error.message || "No fue posible enviar el correo con Resend.");
  }

  return { ok: true, mocked: false, id: data?.id };
}
