"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Flower2,
  Gift,
  Home,
  ShoppingBag,
  Sparkles,
  UsersRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { CartDrawer } from "../../modules/holistic-store/components/CartDrawer";
import { useCartStore } from "../../stores/cart";
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
  { label: "Agenda Digital", href: "/agenda", icon: CalendarDays },
  { label: "Colaboradores", href: "#equipo", icon: UsersRound },
  { label: "Pilares", href: "#nosotros", icon: Flower2 },
  { label: "Beneficios", href: "#beneficios", icon: Gift },
];

/* Premium Orgánico: el enlace activo se subraya con Dorado (#C5A059). */
const ACTIVE_LINK_UNDERLINE =
  "relative after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-gold";

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

/** Determina si un enlace del header corresponde a la ruta actual. */
function isNavLinkActive(label: string, href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (isRouteHref(href)) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (label === "Servicios") {
    return pathname.startsWith("/servicios") || pathname.startsWith("/registros-akashicos");
  }
  return false;
}

/**
 * Header Premium Orgánico: Marfil Sólido (#FCFAF5) en todas las páginas,
 * con borde inferior sutil (stone), menú en Café Oscuro, acentos en Dorado
 * y acciones de búsqueda + carrito + Mi Cuenta a la derecha.
 *
 * La prop `tone` se conserva por compatibilidad con vistas existentes
 * (p. ej. /agenda); ambas variantes son ahora luminosas.
 */
export function PublicHeader({ tone = "dark" }: { tone?: "dark" | "papyrus" } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-stone-200 bg-[#FCFAF5] text-[#2C241B] transition-all duration-500 ${
          scrolled ? "shadow-[0_10px_30px_-18px_rgba(44,36,27,0.20)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-2.5 sm:px-8">
          <Link href="/" aria-label="Dharma Kadabra · Inicio" className="shrink-0">
            <BrandLockup size={58} tone="papyrus" />
          </Link>

          {/* Navegación de escritorio */}
          <nav
            className="hidden min-w-0 items-stretch gap-0.5 text-[10.5px] font-medium tracking-[.05em] text-[#2C241B] lg:flex xl:gap-1 xl:text-[11px]"
            aria-label="Navegación principal"
          >
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const target = resolveHref(href, onLanding);
              const active = isNavLinkActive(label, href, pathname);
              return (
                <Link
                  key={label}
                  href={target}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-w-0 flex-col items-center gap-1.5 rounded-sm px-2 py-2.5 text-[#2C241B] transition-colors lg:px-2.5 xl:min-w-[88px] xl:px-3 ${
                    active
                      ? `font-semibold text-[#2C241B] ${ACTIVE_LINK_UNDERLINE}`
                      : "relative hover:text-bronze"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.35}
                    className={
                      active
                        ? "text-[#C5A059] transition"
                        : "text-sanctuary-gold-leaf transition group-hover:text-bronze"
                    }
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {/* Carrito */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrito (${cartCount} ${cartCount === 1 ? "pieza" : "piezas"})`}
              className="relative grid size-9 place-items-center rounded-full border border-stone-200 bg-white text-[#2C241B] transition hover:border-gold/60 hover:text-bronze"
            >
              <ShoppingBag size={15} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="cart-pop absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-[#C5A059] px-1 text-[10px] font-bold leading-[18px] text-[#2C241B] shadow-[0_2px_8px_rgba(197,160,89,0.5)]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mi Cuenta · texto oscuro y borde dorado sobre fondo dorado suave */}
            <Link
              href="/mi-cuenta"
              aria-current={pathname?.startsWith("/mi-cuenta") ? "page" : undefined}
              className={`group flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-2 text-[11px] font-medium text-[#2C241B] transition sm:pl-2.5 sm:pr-3.5 ${
                pathname?.startsWith("/mi-cuenta")
                  ? "border-[#C5A059] bg-[#C5A059]/25 text-[#2C241B]"
                  : "border-[#C5A059] bg-[#C5A059]/15 text-[#2C241B] hover:bg-[#C5A059]/25"
              }`}
            >
              <span className="grid size-7 place-items-center rounded-full border border-[#C5A059]/50 bg-[#FCFAF5] text-bronze">
                <UserRound size={14} strokeWidth={1.6} />
              </span>
              <span className="hidden sm:inline">Mi Cuenta</span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="public-mobile-nav"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="grid size-9 place-items-center rounded-full border border-stone-200 bg-white text-[#2C241B] transition hover:border-gold/60 hover:text-bronze lg:hidden"
            >
              <span className="flex flex-col gap-[3px]" aria-hidden="true">
                <span className="h-px w-4 bg-current" />
                <span className="h-px w-4 bg-current" />
                <span className="h-px w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>

        {/* Menú móvil · marfil con acentos dorados */}
        <div
          id="public-mobile-nav"
          className={`overflow-hidden border-t border-stone-200 bg-[#FCFAF5] transition-[max-height,opacity] duration-300 lg:hidden ${
            menuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav
            className="grid grid-cols-2 gap-1 px-4 py-4 text-sm text-[#2C241B]"
            aria-label="Navegación móvil"
          >
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const active = isNavLinkActive(label, href, pathname);
              return (
                <Link
                  key={label}
                  href={resolveHref(href, onLanding)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[#2C241B] transition ${
                    active
                      ? "bg-[#C5A059]/15 font-medium text-[#2C241B]"
                      : "hover:bg-[#F4EFE6] hover:text-bronze"
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.5}
                    className={active ? "text-[#C5A059]" : "text-sanctuary-gold-leaf"}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
