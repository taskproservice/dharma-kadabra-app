import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "../../components/dashboard/dashboard-shell";
import { DASHBOARD_HOME_BY_ROLE, ROLE_PREVIEW_COOKIE, getStaffPrincipal, parseRole, type Role } from "../../lib/rbac";

/**
 * Layout del dashboard · RBAC.
 *
 * El rol real sale de la sesión de NextAuth y se revalida contra la base de
 * datos en cada petición. Ese rol decide el punto de entrada (`home`) y el
 * menú lateral: `DashboardSidebar` recibe `currentRole` y filtra
 * `getNavigationForRole`, por lo que ADMIN, ENGINEER, COLLABORATOR y
 * MARKETING ven cada uno solo sus módulos permitidos.
 *
 * Una ADMIN puede además previsualizar la navegación de otro rol (solo UI;
 * la API siempre autoriza con el rol verdadero de la sesión).
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Rol REAL: sale de la sesión de NextAuth, revalidada contra la base de datos.
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard");
  const isRealAdmin = staff.role === "ADMIN";

  // Una ADMIN real puede previsualizar la navegación de otro rol (solo UI).
  const cookieStore = await cookies();
  const previewRole = isRealAdmin ? parseRole(cookieStore.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const currentRole: Role = previewRole ?? staff.role;

  // Destino del logo / redirecciones cuando un rol abre una ruta que no le pertenece.
  const home = DASHBOARD_HOME_BY_ROLE[currentRole] ?? DASHBOARD_HOME_BY_ROLE[staff.role];

  return (
    <DashboardShell staffName={staff.name} currentRole={currentRole} isRealAdmin={isRealAdmin} homeHref={home}>
      {children}
    </DashboardShell>
  );
}
