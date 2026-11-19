/**
 * Dharma Kadabra - RBAC en el servidor.
 *
 * Extrae la sesión verificada (NextAuth para el equipo, cookie firmada para
 * clientes) y decide si el rol puede ejecutar la acción solicitada.
 *
 * Uso en un route handler:
 *
 *   const auth = await authorize("events", "POST");
 *   if (!auth.ok) return auth.response;      // 401 o 403
 *   auth.principal.role;                      // rol verificado
 *
 * Solo para código de servidor (route handlers, server components). El
 * middleware (Edge) y los componentes cliente deben importar `rbac-config`.
 */
import { timingSafeEqual } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { getCustomerSession } from "./customer-auth";
import { prisma } from "./prisma";
import { canPerform, parseRole, type ApiAction, type ApiResource, type Role } from "./rbac-config";

export * from "./rbac-config";

export type StaffPrincipal = { kind: "staff"; id: string; email: string; name: string; role: Role };
export type CustomerPrincipal = { kind: "customer"; id: string; email: string; name: string; role: "CLIENT" };
export type Principal = StaffPrincipal | CustomerPrincipal;

export type AuthorizationResult =
  | { ok: true; principal: Principal }
  | { ok: false; status: 401 | 403; response: NextResponse };

/**
 * Sesión del equipo validada contra la base de datos en cada petición:
 * si la cuenta se desactiva o cambia de rol, el efecto es inmediato aunque
 * el JWT siga vigente.
 */
export async function getStaffPrincipal(): Promise<StaffPrincipal | null> {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const role = parseRole(user?.role);
  if (!user || !user.active || !role) return null;
  return { kind: "staff", id: user.id, email: user.email, name: user.name, role };
}

/** Sesión de cliente (/mi-cuenta), tratada como rol CLIENT. */
export async function getCustomerPrincipal(): Promise<CustomerPrincipal | null> {
  const session = await getCustomerSession();
  if (!session) return null;
  return { kind: "customer", id: session.id, email: session.email, name: session.name, role: "CLIENT" };
}

/** Identidad verificada de la petición actual; el equipo tiene prioridad. */
export async function getPrincipal(): Promise<Principal | null> {
  return (await getStaffPrincipal()) ?? (await getCustomerPrincipal());
}

export function unauthorized(message = "Inicia sesión para continuar.") {
  return NextResponse.json({ error: message }, { status: 401, headers: { "WWW-Authenticate": "Session" } });
}

export function forbidden(message = "Tu rol no tiene permiso para realizar esta acción.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Verifica sesión + permiso del rol para `resource`/`action`.
 * - Sin sesión válida → 401 Unauthorized.
 * - Con sesión pero rol sin permiso → 403 Forbidden.
 */
export async function authorize(resource: ApiResource, action: ApiAction): Promise<AuthorizationResult> {
  const principal = await getPrincipal();
  if (!principal) return { ok: false, status: 401, response: unauthorized() };
  if (!canPerform(principal.role, resource, action)) return { ok: false, status: 403, response: forbidden() };
  return { ok: true, principal };
}

/**
 * Para endpoints invocados por máquinas (p. ej. Vercel Cron): acepta
 * `Authorization: Bearer <secret>` si el secreto está configurado y, si no,
 * exige una sesión con permiso para `resource`/`action`.
 */
export async function authorizeServiceOrRole(
  request: Request,
  secret: string | undefined,
  resource: ApiResource,
  action: ApiAction,
): Promise<{ ok: true; principal: Principal | { kind: "service" } } | { ok: false; status: 401 | 403; response: NextResponse }> {
  const header = request.headers.get("authorization");
  if (secret && header && safeEqual(header, `Bearer ${secret}`)) return { ok: true, principal: { kind: "service" } };
  return authorize(resource, action);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
