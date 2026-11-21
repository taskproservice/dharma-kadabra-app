import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "../../components/dashboard/dashboard-shell";
import { DASHBOARD_HOME_BY_ROLE, ROLE_PREVIEW_COOKIE, getStaffPrincipal, parseRole, type Role } from "../../lib/rbac";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Rol REAL: sale de la sesión de NextAuth, revalidada contra la base de datos.
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard");
  const isRealAdmin = staff.role === "ADMIN";

  // Una ADMIN real puede previsualizar la navegación de otro rol (solo UI).
  const cookieStore = await cookies();
  const previewRole = isRealAdmin ? parseRole(cookieStore.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const currentRole: Role = previewRole ?? staff.role;
  const home = DASHBOARD_HOME_BY_ROLE[currentRole];

  return (
    <DashboardShell staffName={staff.name} currentRole={currentRole} isRealAdmin={isRealAdmin} homeHref={home}>
      {children}
    </DashboardShell>
  );
}
