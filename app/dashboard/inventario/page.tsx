import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { InventarioClient } from "../../../components/dashboard/inventario-client";
import { getStaffPrincipal } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Holistic Store · Panel administrativo: inventario con alertas de stock,
 * plantillas visuales por categoría, venta rápida (POS del staff) y
 * generador de video comercial IA. Solo ADMIN (ver API_PERMISSIONS).
 */
export default async function InventarioPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/inventario");

  if (staff.role !== "ADMIN") {
    return (
      <div className="grid min-h-[50vh] place-items-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#c7a45a]/20 bg-[#11182b]/70 p-8 text-center backdrop-blur-xl">
          <ShieldAlert size={30} className="mx-auto text-[#d8bc7f]" />
          <h1 className="mt-4 font-display text-2xl text-[#f7f2e7]">Módulo restringido</h1>
          <p className="mt-2 text-sm leading-6 text-[#e9e2d2]/55">
            El inventario de Holistic Store solo está disponible para la administradora.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-[#c7a45a]/40 bg-[#c7a45a]/10 px-5 py-2.5 text-sm font-medium text-[#e3c57c] transition hover:bg-[#c7a45a]/20"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return <InventarioClient />;
}
