"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Flower2,
  Gift,
  Home,
  ShoppingBag,
  Sparkles,
  UsersRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { BrandLockup } from "./brand-logo";

/**
 * Enlaces principales del header flotante.
 *
 * `href` puede ser una ruta real (`/tienda`) o una ancla de la landing
 * (`#equipo`). Las anclas se prefijan con "/" al navegar desde otra página,
 * para que funcionen tanto en la landing como en la tienda.
 */
const NAV_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Tienda", href: "/tienda", icon: ShoppingBag },
  { label: "Servicios", href: "#servicios", icon: Sparkles },
  { label: "Agenda Digital", href: "#servicios", icon: CalendarDays },
  { label: "Colaboradores", href: "#equipo", icon: UsersRound },
  { label: "Pilares", href: "#nosotros", icon: Flower2 },
  { label: "Beneficios", href: "#beneficios", icon: Gift },
];

/** `/tienda` es ruta propia; el resto son anclas de la landing. */
const isRouteHref = (href: string) => href.startsWith("/");

/**
 * Resuelve el destino de un enlace: en la landing las anclas navegan en la
 * misma página; desde cualquier otra ruta (p. ej. /tienda) se vuelve a la
 * landing con el ancla.
 */
function resolveHref(href: string, onLanding: boolean): string {
  if (isRouteHref(href)) return href;
  return onLanding ? href : `/${href}`;
}

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // En la landing (`/`) las anclas se resuelven en la misma página.
  const onLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b text-[#f7f2e7] transition-all duration-500 ${
        scrolled
          ? "border-[#c7a45a]/25 bg-[#080c16]/92 shadow-[0_18px_50px_-24px_rgba(0,0,0,.9)] backdrop-blur-2xl"
          : "border-[#c7a45a]/15 bg-[#080c16]/55 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-2.5 sm:px-8">
        <Link href="/" aria-label="Dharma Kadabra · Inicio" className="shrink-0">
          <BrandLockup size={58} />
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden min-w-0 items-stretch gap-0.5 text-[10.5px] font-medium tracking-[.05em] text-[#e9e2d2]/75 lg:flex xl:gap-1 xl:text-[11px]" aria-label="Navegación principal">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const target = resolveHref(href, onLanding);
            const active =
              href === "/" ? pathname === "/" : isRouteHref(href) ? pathname === href : false;
            return (
              <Link
                key={label}
                href={target}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-w-0 flex-col items-center gap-1.5 rounded-sm px-2 py-2.5 transition-colors lg:px-2.5 xl:min-w-[88px] xl:px-3 ${
                  active ? "text-[#f7f2e7]" : "hover:text-[#e3c57c]"
                }`}
              >
                <Icon size={17} strokeWidth={1.35} className="text-[#d8bc7f]/85 transition group-hover:text-[#e3c57c]" />
                <span className="whitespace-nowrap">{label}</span>
                {active && (
                  <>
                    <span className="absolute inset-x-2 -bottom-[11px] h-[2px] bg-gradient-to-r from-transparent via-[#d8bc7f] to-transparent shadow-[0_0_10px_rgba(216,188,127,.9)]" />
                    <span className="absolute -bottom-[13px] left-1/2 size-1 -translate-x-1/2 rotate-45 bg-[#d8bc7f]" aria-hidden="true" />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Mi Cuenta */}
          <Link
            href="/mi-cuenta"
            className="group flex items-center gap-2 rounded-full border border-[#c7a45a]/35 bg-white/[0.03] py-1.5 pl-2 pr-2 text-[11px] font-medium text-[#f7f2e7] transition hover:border-[#c7a45a]/70 hover:bg-[#c7a45a]/10 sm:pl-2.5 sm:pr-3.5"
          >
            <span className="grid size-7 place-items-center rounded-full border border-[#c7a45a]/30 bg-[#c7a45a]/10 text-[#d8bc7f]">
              <UserRound size={14} strokeWidth={1.6} />
            </span>
            <span className="hidden sm:inline">Mi Cuenta</span>
            <ChevronDown size={12} className="hidden text-[#d8bc7f]/70 transition group-hover:translate-y-0.5 sm:block" />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="grid size-9 place-items-center rounded-full border border-[#c7a45a]/30 text-[#f7f2e7] transition hover:border-[#c7a45a]/70 lg:hidden"
          >
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        id="public-mobile-nav"
        className={`overflow-hidden border-t border-[#c7a45a]/15 bg-[#080c16]/97 transition-[max-height,opacity] duration-300 lg:hidden ${
          menuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="grid grid-cols-2 gap-1 px-4 py-4 text-sm text-[#e9e2d2]/80" aria-label="Navegación móvil">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={resolveHref(href, onLanding)}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-white/[0.05] hover:text-[#e3c57c]"
            >
              <Icon size={15} strokeWidth={1.5} className="text-[#d8bc7f]/80" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
