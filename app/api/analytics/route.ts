import { NextResponse } from "next/server";
import { authorize } from "../../../lib/rbac";
import { getAnalyticsSummary } from "../../../modules/holistic-store/data";

export const dynamic = "force-dynamic";

/** Panel de Marketing · KPIs: visitas a la tienda y productos más vistos. */
export async function GET() {
  try {
    const auth = await authorize("analytics", "GET");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la analítica:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }

  const summary = await getAnalyticsSummary();
  return NextResponse.json(summary);
}
