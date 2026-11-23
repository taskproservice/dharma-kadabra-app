import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "../../../lib/password";
import { prisma } from "../../../lib/prisma";
import { authorize, parseRole, ROLES, type Role } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Gestión de usuarios del equipo · Panel Admin.
 * - GET /api/users → listado sin contraseñas (solo ADMIN).
 * - POST /api/users → crea un colaborador y le asigna un rol (solo ADMIN).
 */

const STAFF_ROLES = ROLES.filter((role) => role !== "CLIENT");
const roleEnum = z.enum(STAFF_ROLES as [Role, ...Role[]]);

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(128),
  role: roleEnum.default("COLLABORATOR"),
});

export async function GET() {
  try {
    const auth = await authorize("users", "GET");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar el listado de usuarios:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error al consultar los usuarios:", error);
    return NextResponse.json({ error: "No fue posible consultar los usuarios. Inténtalo de nuevo." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize("users", "POST");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la creación de usuario:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos del usuario inválidos." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const role = parseRole(parsed.data.role) ?? "COLLABORATOR";

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: hashPassword(parsed.data.password),
        role,
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
    }
    console.error("Error al crear el usuario:", error);
    return NextResponse.json({ error: "No fue posible crear el usuario. Inténtalo de nuevo." }, { status: 500 });
  }
}
