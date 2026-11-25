import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sortCollaborators, toPublicCollaborator, THERAPIST_ROLES } from "../../../lib/therapists";

export const dynamic = "force-dynamic";

/**
 * GET /api/collaborators · endpoint PÚBLICO de la Agenda Digital.
 *
 * Devuelve el equipo que puede recibir una sesión: cuentas activas con rol
 * `ADMIN` (Paola) y `COLLABORATOR` (terapeutas). Por privacidad solo se
 * exponen `id`, `name`, `role` y `avatarUrl`; nunca el correo ni el hash.
 *
 * 200 → { collaborators: [{ id, name, role, avatarUrl }] }
 * 503 → base de datos no disponible
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { active: true, role: { in: [...THERAPIST_ROLES] } },
      select: { id: true, name: true, role: true },
    });

    const collaborators = sortCollaborators(
      users.map(toPublicCollaborator).filter((person): person is NonNullable<typeof person> => person !== null),
    );

    return NextResponse.json(
      { collaborators },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error al consultar el equipo agendable:", error);
    return NextResponse.json(
      { error: "El equipo no está disponible en este momento. Intenta de nuevo en unos minutos." },
      { status: 503 },
    );
  }
}
