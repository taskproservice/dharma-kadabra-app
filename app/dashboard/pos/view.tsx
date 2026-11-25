import { redirect } from "next/navigation";
import { PosClient } from "../../../components/dashboard/pos-client";
import { DASHBOARD_HOME_BY_ROLE, getStaffPrincipal } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Punto de Venta — el catálogo se carga en el cliente desde
 * GET /api/products (Prisma, tabla `Product`), con Skeleton Loaders
 * mientras carga. Ver `components/dashboard/pos-client.tsx`.
 *
 * Solo ADMIN y ENGINEER cobran en terminal (coincide con la API `pos`).
 * El middleware ya protege la ruta; la página lo verifica de nuevo.
 */
export default async function PosPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/pos");
  if (staff.role !== "ADMIN" && staff.role !== "ENGINEER") {
    redirect(DASHBOARD_HOME_BY_ROLE[staff.role]);
  }

  return <PosClient />;
}
