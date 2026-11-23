import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "../../../../src/generated/prisma";
import { prisma } from "../../../../lib/prisma";
import { authorize } from "../../../../lib/rbac";
import { normalizeAvailability, type AvailabilitySlot } from "../../../../lib/availability-settings";

export const dynamic = "force-dynamic";

/**
 * Disponibilidad semanal propia.
 * GET /api/availability/me → parrilla del colaborador con sesión.
 * PUT /api/availability/me → reemplaza la parrilla (solo datos propios).
 * ADMIN puede gestionar la de otro colaborador con ?userId=<id>.
 */

const putSchema = z.object({
  availability: z.array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      hour: z.number().int().min(9).max(17),
    }),
  ),
});

async function resolveTargetId(
  auth: Awaited<ReturnType<typeof authorize>>,
  requestedUserId: string | null,
): Promise<{ ok: true; targetId: string } | { ok: false; response: NextResponse }> {
  if (!auth.ok || auth.principal.kind !== "staff") {
    return { ok: false, response: NextResponse.json({ error: "Sesión no válida." }, { status: 401 }) };
  }

  if (requestedUserId && requestedUserId !== auth.principal.id) {
    if (auth.principal.role !== "ADMIN") {
      return { ok: false, response: NextResponse.json({ error: "Solo una administradora puede cambiar la disponibilidad de otra persona." }, { status: 403 }) };
    }
    return { ok: true, targetId: requestedUserId };
  }
  return { ok: true, targetId: auth.principal.id };
}

export async function GET(request: Request) {
  const auth = await authorize("availability", "GET");
  if (!auth.ok) return auth.response;

  const requestedUserId = new URL(request.url).searchParams.get("userId");
  const target = await resolveTargetId(auth, requestedUserId);
  if (!target.ok) return target.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: target.targetId },
      select: { id: true, name: true, role: true, weeklyAvailability: true },
    });
    if (!user) return NextResponse.json({ error: "El colaborador no existe." }, { status: 404 });
    return NextResponse.json({
      user: { id: user.id, name: user.name, role: user.role },
      availability: normalizeAvailability(user.weeklyAvailability),
    });
  } catch (error) {
    console.error("Error al consultar la disponibilidad:", error);
    return NextResponse.json({ error: "No fue posible consultar la disponibilidad." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await authorize("availability", "PUT");
  if (!auth.ok) return auth.response;

  const requestedUserId = new URL(request.url).searchParams.get("userId");
  const target = await resolveTargetId(auth, requestedUserId);
  if (!target.ok) return target.response;

  const parsed = putSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La disponibilidad debe ser una lista de bloques día/hora (lunes–domingo, 09:00–17:00)." },
      { status: 400 },
    );
  }

  const availability: AvailabilitySlot[] = normalizeAvailability(parsed.data.availability);

  try {
    const user = await prisma.user.update({
      where: { id: target.targetId },
      data: { weeklyAvailability: availability as unknown as Prisma.InputJsonValue },
      select: { id: true, name: true, weeklyAvailability: true },
    });
    return NextResponse.json({
      user: { id: user.id, name: user.name },
      availability: normalizeAvailability(user.weeklyAvailability),
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "El colaborador no existe." }, { status: 404 });
    }
    console.error("Error al guardar la disponibilidad:", error);
    return NextResponse.json({ error: "No fue posible guardar la disponibilidad." }, { status: 500 });
  }
}
