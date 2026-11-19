import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dk_customer_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 30;
const getSecret = () => process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-only-dharma-kadabra-secret");

export type CustomerSession = { id: string; email: string; name: string; expiresAt: number };

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function signature(value: string) {
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET_MISSING");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(customer: { id: string; email: string; name: string }) {
  const payload: CustomerSession = { ...customer, expiresAt: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function verifySessionToken(token?: string): CustomerSession | null {
  if (!token) return null;
  try {
    const [encoded, suppliedSignature] = token.split(".");
    if (!encoded || !suppliedSignature) return null;
    const expected = Buffer.from(signature(encoded));
    const supplied = Buffer.from(suppliedSignature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as CustomerSession;
    if (!session.id || !session.email || session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export const customerSessionCookie = COOKIE_NAME;
export const customerSessionMaxAge = SESSION_LIFETIME_SECONDS;
