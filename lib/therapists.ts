/**
 * Equipo agendable de la Agenda Digital.
 *
 * La fuente de verdad son las cuentas activas del modelo `User` con rol
 * `ADMIN` (dirección / guía principal) y `COLLABORATOR` (terapeutas). Este
 * módulo es intencionalmente puro (sin Prisma, sin Next) para poder usarse
 * tanto en el route handler `/api/collaborators` como en componentes cliente.
 *
 * El esquema de `User` todavía no guarda una foto: `avatarUrlForName` resuelve
 * el retrato público del equipo (`lib/data/collaborators.ts`) por nombre, de
 * modo que la UI muestra avatares reales sin inventar IDs ni datos.
 */
import { getInitials, collaborators } from "./data/collaborators";

/** Roles que pueden recibir una sesión en la Agenda Digital. */
export type TherapistRole = "ADMIN" | "COLLABORATOR";

/** Forma pública de un miembro agendable (nunca incluye correo ni rol interno). */
export type PublicCollaborator = {
  id: string;
  name: string;
  role: TherapistRole;
  /** Retrato público; `null` cuando no hay foto (la UI usa iniciales). */
  avatarUrl: string | null;
};

export const THERAPIST_ROLES: readonly TherapistRole[] = ["ADMIN", "COLLABORATOR"];

/** Etiqueta editorial del rol mostrada bajo el nombre en el selector. */
export const THERAPIST_ROLE_LABEL: Record<TherapistRole, string> = {
  ADMIN: "Fundadora · Guía principal",
  COLLABORATOR: "Terapeuta",
};

export function isTherapistRole(value: unknown): value is TherapistRole {
  return value === "ADMIN" || value === "COLLABORATOR";
}

/** Minúsculas y sin acentos: «Lucía Moreno» → «lucia moreno». */
export function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Retratos conocidos del equipo, indexados por nombre normalizado. */
const AVATAR_BY_NAME: Record<string, string> = {
  "paola hernandez": "/images/equipo/paola-hernandez.jpg",
  ...Object.fromEntries(collaborators.map((person) => [normalizeName(person.name), person.photoUrl])),
};

/** Retrato público del equipo a partir del nombre, o `null` si no hay foto. */
export function avatarUrlForName(name: string): string | null {
  return AVATAR_BY_NAME[normalizeName(name)] ?? null;
}

/** Recorta los datos privados de una cuenta y la convierte en opción agendable. */
export function toPublicCollaborator(user: {
  id: string;
  name: string;
  role: string;
}): PublicCollaborator | null {
  if (!isTherapistRole(user.role)) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: avatarUrlForName(user.name),
  };
}

/**
 * Orden estable del selector: primero la dirección (ADMIN) y después el resto
 * del equipo por nombre. No muta el arreglo recibido.
 */
export function sortCollaborators<T extends { name: string; role: string }>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => {
    const weight = (role: string) => (role === "ADMIN" ? 0 : 1);
    return weight(a.role) - weight(b.role) || a.name.localeCompare(b.name, "es");
  });
}

export { getInitials };
