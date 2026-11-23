import { redirect } from "next/navigation";
import { IngenieriaClient } from "../../../components/dashboard/ingenieria-client";
import type { StaffUser } from "../../../components/dashboard/user-management";
import { prisma } from "../../../lib/prisma";
import { DASHBOARD_HOME_BY_ROLE, getStaffPrincipal, parseRole } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Panel Ingeniería · Solo soporte (ENGINEER) y administración.
 * Health check, variables de entorno, enlaces a Vercel/Supabase, botón de
 * Modo Mantenimiento y Gestión de Usuarios (crear cuentas, asignar roles y
 * activar/desactivar; también disponible en el Panel Admin).
 */
async function loadUsers(): Promise<StaffUser[]> {
  try {
    const rows = await prisma.user.findMany({
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return rows.map((row) => ({
      ...row,
      role: parseRole(row.role) ?? "COLLABORATOR",
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error al cargar usuarios en el Panel Ingeniería:", error);
    return [];
  }
}

export default async function IngenieriaPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/ingenieria");
  if (staff.role !== "ENGINEER" && staff.role !== "ADMIN") {
    redirect(DASHBOARD_HOME_BY_ROLE[staff.role]);
  }

  const users = await loadUsers();

  return <IngenieriaClient initialUsers={users} />;
}
