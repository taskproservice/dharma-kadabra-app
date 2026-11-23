import { redirect } from "next/navigation";
import { IngenieriaClient } from "../../../components/dashboard/ingenieria-client";
import { DASHBOARD_HOME_BY_ROLE, getStaffPrincipal } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Panel Ingeniería · Solo soporte (ENGINEER) y administración.
 * Health check, variables de entorno, enlaces a Vercel/Supabase y el botón
 * de Modo Mantenimiento que oculta la tienda temporalmente.
 */
export default async function IngenieriaPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/ingenieria");
  if (staff.role !== "ENGINEER" && staff.role !== "ADMIN") {
    redirect(DASHBOARD_HOME_BY_ROLE[staff.role]);
  }

  return <IngenieriaClient />;
}
