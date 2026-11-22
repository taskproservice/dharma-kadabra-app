"use client";

import Link from "next/link";
import { BrandLockup } from "../landing/brand-logo";
import { AkashicBookingCTA } from "./akashic-booking-cta";

const NAV_LINKS = [
  { href: "#introduccion", label: "Introducción" },
  { href: "#metodo", label: "Método" },
  { href: "#proceso", label: "Proceso" },
  { href: "#faq", label: "FAQ" },
] as const;

export function AkashicHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#C5A059]/30 bg-[#F4EFE6]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Volver al inicio de Dharma Kadabra" className="shrink-0">
          <BrandLockup size={40} />
        </Link>
        <nav aria-label="Secciones de la lectura" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#2C2C2C]/75 transition hover:text-[#9E7B2F]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <AkashicBookingCTA
          className="shrink-0 rounded-full bg-[#C5A059] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[.2em] text-[#1A1A1A] transition hover:bg-[#b58e45] sm:px-6"
          label="Reservar sesión de Lectura de Registros Akáshicos"
        >
          Reservar sesión
        </AkashicBookingCTA>
      </div>
    </header>
  );
}
