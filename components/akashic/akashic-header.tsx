"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLockup } from "../landing/brand-logo";
import { AkashicBookingCTA } from "./akashic-booking-cta";

const NAV_LINKS = [
  { href: "#introduccion", label: "Introducción" },
  { href: "#metodo", label: "Método" },
  { href: "#proceso", label: "Proceso" },
  { href: "#faq", label: "FAQ" },
] as const;

export function AkashicHeader() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-sanctuary-gold/30 bg-sanctuary-parchment/85 text-sanctuary-ink backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Volver al inicio de Dharma Kadabra" className="shrink-0">
          <BrandLockup size={40} tone="papyrus" />
        </Link>
        <nav aria-label="Secciones de la lectura" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-semibold uppercase tracking-[.22em] text-sanctuary-ink-soft transition hover:text-sanctuary-gold-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        {pastHero ? (
          <AkashicBookingCTA
            className="shrink-0 cursor-pointer border border-sanctuary-gold-ink/60 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[.2em] text-sanctuary-gold-ink transition hover:bg-sanctuary-gold hover:text-sanctuary-ink sm:px-6"
            label="Reservar sesión de Lectura de Registros Akáshicos"
          >
            Reservar sesión
          </AkashicBookingCTA>
        ) : (
          <Link
            href="/agenda"
            className="inline-flex shrink-0 items-center gap-2 border border-sanctuary-gold-ink/40 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[.2em] text-sanctuary-ink-soft transition hover:border-sanctuary-gold-ink hover:text-sanctuary-gold-ink sm:px-5"
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Ver Agenda
          </Link>
        )}
      </div>
    </header>
  );
}
