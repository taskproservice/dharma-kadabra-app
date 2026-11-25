import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DASHBOARD_HOME_BY_ROLE,
  getStaffPrincipal,
  parseRole,
  ROLE_PREVIEW_COOKIE,
} from "../../lib/rbac";

/**
 * `/dashboard` no renderiza un panel: reparte a cada rol a su panel de
 * inicio (Admin → /dashboard/admin, Ingeniería → /dashboard/ingenieria,
 * Marketing → /dashboard/marketing, Colaboradora → /dashboard/agenda).
 * El middleware ya hace esta redirección; esta es la alternativa del servidor
 * para cuando se llega a la ruta sin pasar por él.
 */
export async function redirectDashboardHome(): Promise<never> {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard");

  const cookieStore = await cookies();
  const previewRole = staff.role === "ADMIN" ? parseRole(cookieStore.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const role = previewRole ?? staff.role;

  redirect(DASHBOARD_HOME_BY_ROLE[role]);
}
