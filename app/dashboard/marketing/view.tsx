import { redirect } from "next/navigation";
import { MarketingClient } from "../../../components/dashboard/marketing-client";
import { prisma } from "../../../lib/prisma";
import { DASHBOARD_HOME_BY_ROLE, getStaffPrincipal } from "../../../lib/rbac";
import { getAnalyticsSummary, type AnalyticsSummary } from "../../../modules/holistic-store/data";
import type { AdminProduct, StoreAvailability, StoreCategory } from "../../../modules/holistic-store/types";

export const dynamic = "force-dynamic";

/**
 * Panel Marketing · Community Manager.
 * Inventario con SKU, visibilidad On/Off, alta y edición de productos con
 * imagen (Vercel Blob), exportación del catálogo a CSV para Meta Commerce
 * Manager y KPIs de visitas / productos más vistos.
 */
async function loadProducts(): Promise<AdminProduct[]> {
  try {
    const rows = await prisma.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
    return rows.map((row) => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      price: row.price,
      currency: row.currency === "USD" ? "USD" : "MXN",
      imageUrl: row.imageUrl,
      category: row.category as StoreCategory,
      availability: (row.availability === "out_of_stock" ? "out_of_stock" : "available") as StoreAvailability,
      cost: row.cost,
      profitMargin: row.profitMargin,
      published: row.published,
      isVisible: row.isVisible,
      stock: row.stock,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error al cargar el inventario de Marketing:", error);
    return [];
  }
}

async function loadAnalytics(): Promise<AnalyticsSummary> {
  return getAnalyticsSummary();
}

export default async function MarketingPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/marketing");
  if (staff.role !== "MARKETING" && staff.role !== "ADMIN") {
    redirect(DASHBOARD_HOME_BY_ROLE[staff.role]);
  }

  const [products, analytics] = await Promise.all([loadProducts(), loadAnalytics()]);

  return <MarketingClient initialProducts={products} initialAnalytics={analytics} />;
}
