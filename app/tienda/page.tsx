import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";
import { PublicHeader } from "../../components/landing/public-header";
import { PremiumFooter } from "../../components/landing/premium-footer";
import { DEFAULT_CATEGORY, STORE_PALETTE } from "../../modules/holistic-store/constants";
import { getStorefrontData } from "../../modules/holistic-store/data";
import { StoreBanner } from "../../modules/holistic-store/components/StoreBanner";
import { StoreErrorPanel } from "../../modules/holistic-store/components/StoreErrorPanel";
import { StoreExplorer } from "../../modules/holistic-store/components/StoreExplorer";

/** Tipografía editorial de la tienda (Cormorant Garamond, servida en local). */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

export const metadata: Metadata = {
  title: "La Tienda Holística · Dharma Kadabra",
  description:
    "Pulseras, cadenas, runas y piedras elegidas con intención. Consulta cada pieza por WhatsApp y recíbela en tu altar.",
};

// El catálogo cambia con el inventario: siempre se consulta en vivo.
export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const { products, counts, templates, error } = await getStorefrontData(DEFAULT_CATEGORY);

  return (
    <div className={cormorant.variable}>
      <main
        className="relative min-h-screen text-[#F7F3EA]"
        style={{ backgroundColor: STORE_PALETTE.nocturno }}
      >
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
              className="group inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.28em] text-[#F7F3EA]/45 transition hover:text-[#C5A059] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059]"
            >
              <ArrowLeft size={13} className="transition group-hover:-translate-x-1" aria-hidden="true" />
              Volver al inicio
            </Link>
          </div>

          {/* Encabezado editorial */}
          <header className="mx-auto max-w-7xl px-5 pb-10 pt-8 text-center sm:px-8 sm:pt-12">
            <p className="flex items-center justify-center gap-4 text-[10px] font-medium uppercase tracking-[.42em] text-[#C5A059]">
              <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-transparent to-[#C5A059]/70" />
              Holistic Store
              <span aria-hidden="true" className="h-px w-10 bg-gradient-to-l from-transparent to-[#C5A059]/70" />
            </p>
            <h1
              className="mt-6 font-normal leading-[1.03] text-[#F7F3EA]"
              style={{
                fontFamily: "var(--font-cormorant-garamond), Georgia, 'Times New Roman', serif",
                fontSize: "clamp(2.6rem, 6.4vw, 4.6rem)",
                letterSpacing: "-.01em",
              }}
            >
              La Tienda{" "}
              <em className="italic text-[#C5A059]">Holística</em>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-7 text-[#F7F3EA]/60 sm:text-base">
              Objetos con intención para acompañar tus rituales. Cada pieza se elige a mano y se
              consulta por WhatsApp: sin prisa, con presencia.
            </p>
          </header>

          {/* Banner comercial · 3 colecciones en rotación */}
          <StoreBanner />

          {/* Catálogo por categorías */}
          <section aria-label="Catálogo de la tienda" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-18">
            {error ? (
              <StoreErrorPanel title="No pudimos cargar la tienda" message={error.message} detail={error.detail} />
            ) : (
              <StoreExplorer
                initialCategory={DEFAULT_CATEGORY}
                initialProducts={products}
                initialCounts={counts}
                templates={templates}
              />
            )}
          </section>
        </div>

        <PremiumFooter />
      </main>
    </div>
  );
}
