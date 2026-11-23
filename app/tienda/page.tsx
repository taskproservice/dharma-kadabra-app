import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";
import { PublicHeader } from "../../components/landing/public-header";
import { CozyWidget } from "../../components/landing/cozy-widget";
import { PremiumFooter } from "../../components/landing/premium-footer";
import { getPrincipal } from "../../lib/rbac";
import { isMaintenanceMode } from "../../lib/maintenance";
import { DEFAULT_CATEGORY } from "../../modules/holistic-store/constants";
import { getStorefrontData, recordStoreVisit, type StorefrontData } from "../../modules/holistic-store/data";
import { StoreBanner } from "../../modules/holistic-store/components/StoreBanner";
import { StoreErrorPanel } from "../../modules/holistic-store/components/StoreErrorPanel";
import { StoreExplorer } from "../../modules/holistic-store/components/StoreExplorer";

export const metadata: Metadata = {
  title: "La Tienda Holística · Dharma Kadabra",
  description:
    "Pulseras, cadenas, runas y piedras elegidas con intención. Consulta cada pieza por WhatsApp y recíbela en tu altar.",
};

// El catálogo cambia con el inventario: siempre se consulta en vivo.
export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  // El Panel de Ingeniería puede retirar la tienda temporalmente.
  const maintenance = await isMaintenanceMode().catch(() => false);
  // Cada visita alimenta los KPIs del Panel de Marketing.
  void (await recordStoreVisit("/tienda"));

  let storefront: StorefrontData = { products: [], counts: {}, templates: {}, error: null };
  let isAuthenticated = false;
  if (!maintenance) {
    const [data, principal] = await Promise.all([
      getStorefrontData(DEFAULT_CATEGORY),
      getPrincipal().catch(() => null),
    ]);
    storefront = data;
    isAuthenticated = Boolean(principal);
  }
  const { products, counts, templates, error } = storefront;

  return (
    <>
      <main className="relative min-h-screen bg-obsidian text-papyrus">
        <PublicHeader />

        {/* Resplandor dorado ambiental sobre el fondo nocturno */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] overflow-hidden">
          <span className="absolute left-1/2 top-[-14rem] size-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.16),transparent_68%)] blur-3xl" />
        </div>

        <div className="relative pt-24">
          {/* Enlace sutil de regreso al inicio */}
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.28em] text-papyrus/45 transition hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <ArrowLeft size={13} className="transition group-hover:-translate-x-1" aria-hidden="true" />
              Volver al inicio
            </Link>
          </div>

          {/* Encabezado editorial */}
          <header className="mx-auto max-w-7xl px-5 pb-10 pt-8 text-center sm:px-8 sm:pt-12">
            <p className="flex items-center justify-center gap-4 text-[10px] font-medium uppercase tracking-[.42em] text-gold">
              <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
              Holistic Store
              <span aria-hidden="true" className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
            </p>
            <h1 className="mt-6 font-cormorant text-[clamp(2.6rem,6.4vw,4.6rem)] font-normal leading-[1.03] tracking-[-0.01em] text-papyrus">
              La Tienda{" "}
              <em className="italic text-gold">Holística</em>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-7 text-papyrus/60 sm:text-base">
              Objetos con intención para acompañar tus rituales. Cada pieza se elige a mano y se
              consulta por WhatsApp: sin prisa, con presencia.
            </p>
          </header>

          {/* Banner comercial · 3 colecciones en rotación */}
          <StoreBanner />

          {/* Catálogo por categorías */}
          <section aria-label="Catálogo de la tienda" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-18">
            {maintenance ? (
              <div className="grid place-items-center rounded-2xl border border-gold/25 bg-papyrus/[0.02] px-6 py-20 text-center">
                <div>
                  <Hammer size={28} className="mx-auto text-gold" />
                  <p className="mt-4 font-display text-3xl text-papyrus">Tienda en mantenimiento</p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-papyrus/55">
                    Estamos ajustando detalles para cuidar tu experiencia. Vuelve en unos minutos o
                    escríbenos por WhatsApp y te atendemos con gusto.
                  </p>
                </div>
              </div>
            ) : error ? (
              <StoreErrorPanel title="No pudimos cargar la tienda" message={error.message} detail={error.detail} />
            ) : (
              <StoreExplorer
                initialCategory={DEFAULT_CATEGORY}
                initialProducts={products}
                initialCounts={counts}
                templates={templates}
                isAuthenticated={isAuthenticated}
              />
            )}
          </section>
        </div>

        <PremiumFooter />
      </main>

      {/* Cozy: embudo de ventas de la tienda (abre desde cada tarjeta) */}
      <CozyWidget />
    </>
  );
}
