import { redirect } from "next/navigation";
import { AdminPanelClient, type AdminKpis, type StaffUser } from "../../../components/dashboard/admin-panel-client";
import { prisma } from "../../../lib/prisma";
import { DASHBOARD_HOME_BY_ROLE, getStaffPrincipal, parseRole } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

const EMPTY_KPIS: AdminKpis = { monthRevenue: 0, weekAppointments: 0, lowStockCount: 0, lowStock: [] };

/**
 * Panel Admin · Solo Paola.
 * KPIs globales (ingresos del mes, citas de la semana, productos con bajo
 * stock) y gestión de usuarios con roles. El middleware ya protege la ruta;
 * la página lo verifica de nuevo para defender por capas.
 */
async function loadAdminData(): Promise<{ kpis: AdminKpis; users: StaffUser[] }> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [monthPurchases, weekAppointments, lowStockRows, userRows] = await Promise.all([
      prisma.purchase.findMany({ where: { purchasedAt: { gte: monthStart } }, include: { product: true } }),
      prisma.appointment.count({ where: { date: { gte: now, lte: weekEnd } } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
        select: { id: true, name: true, stock: true },
        take: 5,
      }),
      prisma.user.findMany({
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
        select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      }),
    ]);

    const monthRevenue = monthPurchases.reduce((sum, purchase) => sum + (purchase.product?.price ?? 0), 0);

    return {
      kpis: {
        monthRevenue,
        weekAppointments,
        lowStockCount: lowStockRows.length,
        lowStock: lowStockRows.map((row) => ({ id: row.id, name: row.name, stock: row.stock })),
      },
      users: userRows.map((row) => ({
        ...row,
        role: parseRole(row.role) ?? "COLLABORATOR",
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error al cargar el Panel Admin:", error);
    return { kpis: EMPTY_KPIS, users: [] };
  }
}

export default async function AdminPanelPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/admin");
  if (staff.role !== "ADMIN") redirect(DASHBOARD_HOME_BY_ROLE[staff.role]);

  const { kpis, users } = await loadAdminData();

  return <AdminPanelClient initialUsers={users} initialKpis={kpis} />;
}
