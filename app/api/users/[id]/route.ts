import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { authorize, parseRole, ROLES, type Role } from "../../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Panel Admin e Ingeniería · actualizar un miembro del equipo.
 * PATCH /api/users/:id → nombre, rol y estado activo/inactivo (solo ADMIN e ENGINEER).
 * Nadie puede desactivarse o cambiarse el rol a sí mismo.
 */

const STAFF_ROLES = ROLES.filter((role) => role !== "CLIENT");
const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(STAFF_ROLES as [Role, ...Role[]]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let auth: Awaited<ReturnType<typeof authorize>>;
  try {
    auth = await authorize("users", "PATCH");
  } catch (error) {
    console.error("Error al autorizar la edición de usuario:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }
  if (!auth.ok) return auth.response;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay cambios válidos que aplicar." }, { status: 400 });
  }

  const { id } = await params;
  const selfId = auth.principal.kind === "staff" ? auth.principal.id : "";
  if (id === selfId && (parsed.data.active === false || parsed.data.role !== undefined)) {
    // Se evita el bloqueo accidental de la propia cuenta administradora.
    return NextResponse.json(
      { error: "No puedes cambiar tu propio rol ni desactivar tu cuenta." },
      { status: 400 },
    );
  }

  const data: { name?: string; role?: Role; active?: boolean } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.role !== undefined) data.role = parseRole(parsed.data.role) ?? undefined;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "El usuario ya no existe." }, { status: 404 });
    }
    console.error("Error al actualizar el usuario:", error);
    return NextResponse.json({ error: "No fue posible actualizar el usuario." }, { status: 500 });
  }
}
