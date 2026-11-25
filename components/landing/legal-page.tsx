import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CozyWidget } from "./cozy-widget";
import { PremiumFooter } from "./premium-footer";
import { PublicHeader } from "./public-header";

/**
 * Plantilla de páginas legales (Aviso de Privacidad, Términos, Envíos).
 * Diseño Premium Orgánico: papiro (#F4EFE6), dorado (#C5A059) y café
 * (#2C241B), con header/footer públicos y Cozy.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4EFE6] text-[#2C241B]">
      <PublicHeader />

      <main className="flex-1 pt-[76px]">
        {/* Hero editorial */}
        <section className="border-b border-[#C5A059]/20 bg-[#F4EFE6]">
          <div className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[10px] font-medium text-[#6B4E1E] transition hover:text-[#2C241B]"
            >
              <ArrowLeft size={14} aria-hidden="true" /> Volver al inicio
            </Link>
            <p className="mt-7 flex items-center gap-4 font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[.3em] text-[#8B6914]">
              <span aria-hidden="true" className="h-px w-10 bg-[#C5A059]" />
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-[#2C241B] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl font-[family-name:var(--font-montserrat)] text-sm leading-7 text-[#3D352B]">
              {intro}
            </p>
            <p className="mt-4 font-[family-name:var(--font-montserrat)] text-xs uppercase tracking-[.2em] text-[#8A7F6E]">
              Última actualización: {updated}
            </p>
          </div>
        </section>

        {/* Contenido */}
        <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="space-y-10">{children}</div>

          <div className="mt-14 rounded-2xl border border-[#C5A059]/40 bg-[#FCFAF5] p-6 text-center">
            <p className="font-display text-xl italic text-[#6B4E1E]">¿Tienes dudas?</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#3D352B]">
              Escríbenos a{" "}
              <a href="mailto:hola@dharmakadabra.mx" className="font-semibold text-[#8B6914] underline decoration-[#C5A059] underline-offset-4 transition hover:text-[#2C241B]">
                hola@dharmakadabra.mx
              </a>{" "}
              y te acompañamos con gusto.
            </p>
          </div>
        </article>
      </main>

      <PremiumFooter />
      <CozyWidget />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-4 font-display text-2xl text-[#2C241B]">
        <span aria-hidden="true" className="h-px w-8 shrink-0 bg-[#C5A059]" />
        {title}
      </h2>
      <div className="mt-4 space-y-4 pl-0 font-[family-name:var(--font-montserrat)] text-sm leading-7 text-[#3D352B] sm:pl-12">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-[#C5A059]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
