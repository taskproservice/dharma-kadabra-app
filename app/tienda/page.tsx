import type { Metadata } from "next";
import { PublicHeader } from "../../components/landing/public-header";
import { CozyWidget } from "../../components/landing/cozy-widget";
import { PremiumFooter } from "../../components/landing/premium-footer";
import { isMaintenanceMode } from "../../lib/maintenance";
import { getStorefrontCatalog, recordStoreVisit, FALLBACK_STORE_PRODUCTS } from "../../modules/holistic-store/data";
import { StorefrontHero } from "../../modules/holistic-store/components/StorefrontHero";
import { StoreCatalog } from "../../modules/holistic-store/components/StoreCatalog";
import { StorePromoBanner } from "../../modules/holistic-store/components/StorePromoBanner";
import { TrustBadges } from "../../modules/holistic-store/components/TrustBadges";

export const metadata: Metadata = {
  title: "La Tienda Holística · Dharma Kadabra",
  description:
    "Pulseras, cadenas, runas y piedras elegidas con intención. Encuentra piezas auténticas para tu bienestar y equilibrio.",
};

// El catálogo cambia con el inventario: siempre se consulta en vivo.
export const dynamic = "force-dynamic";

function pickHeroProduct(products: { id: string; name: string }[], fallback: typeof FALLBACK_STORE_PRODUCTS) {
  const byName = products.find((p) => /ojo de tigre/i.test(p.name));
  if (byName) return byName;
  return products[0] ?? fallback[2] ?? fallback[0];
}

export default async function TiendaPage() {
  // El Panel de Ingeniería puede retirar la tienda temporalmente.
  const maintenance = await isMaintenanceMode().catch(() => false);

  if (maintenance) {
    return (
      <>
        <main className="relative min-h-screen bg-papyrus text-ink">
          <PublicHeader />
          <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 pt-28 text-center sm:px-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[.35em] text-[#8B6914]">
                Holistic Store
              </p>
              <h1 className="mt-5 font-display text-5xl text-[#2C241B]">Tienda en mantenimiento</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6B5D4A]">
                Estamos ajustando detalles para cuidar tu experiencia. Vuelve en unos minutos o
                escríbenos por WhatsApp y te atendemos con gusto.
              </p>
            </div>
          </div>
          <PremiumFooter />
        </main>
        <CozyWidget />
      </>
    );
  }

  // El catálogo completo llega con respaldo incluido: si la DB falla,
  // `error` viene normalizado y `products` trae el catálogo de respaldo.
  const catalog = await getStorefrontCatalog(35).catch((error) => {
    console.error("[Holistic Store] fallo inesperado al cargar el catálogo:", error);
    return {
      products: FALLBACK_STORE_PRODUCTS,
      error: {
        code: "STORE_UNAVAILABLE",
        message: "No pudimos cargar la tienda en este momento. Vuelve a intentarlo en unos segundos.",
      },
      isFallback: true,
      templates: {},
    };
  });

  // Registra visita sin bloquear la respuesta.
  void recordStoreVisit("/tienda");

  const products = catalog.products.length > 0 ? catalog.products : FALLBACK_STORE_PRODUCTS;
  const heroProduct = pickHeroProduct(products, FALLBACK_STORE_PRODUCTS) as typeof products[number];
  // Asegura que el hero product tenga la forma completa
  const heroFull =
    products.find((p) => p.id === heroProduct.id) ?? FALLBACK_STORE_PRODUCTS[2] ?? products[0];

  return (
    <>
      <main className="relative min-h-screen bg-[#F7F3EA] text-[#2C241B]">
        <PublicHeader />

        <div className="pt-[76px]">
          <StorefrontHero product={heroFull} />

          <div id="productos-destacados" className="scroll-mt-24">
            <StoreCatalog
              products={products}
              templates={catalog.templates}
              initialError={catalog.error ? { message: catalog.error.message } : null}
              isFallback={catalog.isFallback}
            />
          </div>

          <StorePromoBanner />

          <TrustBadges />
        </div>

        <PremiumFooter />
      </main>

      <CozyWidget />
    </>
  );
}
