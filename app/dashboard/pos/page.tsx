import { PosClient } from "../../../components/dashboard/pos-client";

export const dynamic = "force-dynamic";

/**
 * Punto de Venta — el catálogo se carga en el cliente desde
 * GET /api/products (Prisma, tabla `Product`), con Skeleton Loaders
 * mientras carga. Ver `components/dashboard/pos-client.tsx`.
 */
export default function PosPage() {
  return <PosClient />;
}
