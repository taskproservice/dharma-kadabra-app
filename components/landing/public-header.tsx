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

const ACTIVE_LINK_GLOW =
  "relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gold after:shadow-[0_0_12px_rgba(197,160,89,0.8)]";

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

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // En la landing (`/`) las anclas se resuelven en la misma página.
  const onLanding = pathname === "/";
  const onStore = Boolean(pathname && (pathname === "/tienda" || pathname.startsWith("/tienda/")));
  const showCartTrigger = onStore || cartCount > 0;

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
        className={`fixed inset-x-0 top-0 z-40 border-b text-papyrus transition-all duration-500 ${
          scrolled
            ? "border-gold/25 bg-obsidian/92 shadow-[0_18px_50px_-24px_rgba(0,0,0,.9)] backdrop-blur-2xl"
            : "border-gold/15 bg-obsidian/55 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-2.5 sm:px-8">
          <Link href="/" aria-label="Dharma Kadabra · Inicio" className="shrink-0">
            <BrandLockup size={58} />
          </Link>

          {/* Navegación de escritorio */}
          <nav
            className="hidden min-w-0 items-stretch gap-0.5 text-[10.5px] font-medium tracking-[.05em] text-papyrus/75 lg:flex xl:gap-1 xl:text-[11px]"
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
                  className={`group flex min-w-0 flex-col items-center gap-1.5 rounded-sm px-2 py-2.5 transition-colors lg:px-2.5 xl:min-w-[88px] xl:px-3 ${
                    active ? `text-papyrus ${ACTIVE_LINK_GLOW}` : "relative hover:text-gold-bright"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.35}
                    className={
                      active
                        ? "text-gold transition"
                        : "text-gold-light/85 transition group-hover:text-gold-bright"
                    }
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {showCartTrigger && (
              <button
                type="button"
                onClick={openCart}
                aria-label={`Abrir carrito (${cartCount} ${cartCount === 1 ? "pieza" : "piezas"})`}
                className="relative grid size-9 place-items-center rounded-full border border-gold/40 bg-papyrus/[0.03] text-gold transition hover:border-gold hover:bg-gold/15"
              >
                <ShoppingBag size={15} strokeWidth={1.6} />
                {cartCount > 0 && (
                  <span className="cart-pop absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold leading-[18px] text-obsidian shadow-[0_0_10px_rgba(197,160,89,0.7)]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mi Cuenta */}
            <Link
              href="/mi-cuenta"
              aria-current={pathname?.startsWith("/mi-cuenta") ? "page" : undefined}
              className={`group flex items-center gap-2 rounded-full border border-gold/35 bg-papyrus/[0.03] py-1.5 pl-2 pr-2 text-[11px] font-medium text-papyrus transition hover:border-gold/70 hover:bg-gold/10 sm:pl-2.5 sm:pr-3.5 ${
                pathname?.startsWith("/mi-cuenta")
                  ? "border-gold shadow-[0_0_12px_rgba(197,160,89,0.45)]"
                  : ""
              }`}
            >
              <span className="grid size-7 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold-light">
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
              className="grid size-9 place-items-center rounded-full border border-gold/30 text-papyrus transition hover:border-gold/70 lg:hidden"
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
          className={`overflow-hidden border-t border-gold/15 bg-obsidian/97 transition-[max-height,opacity] duration-300 lg:hidden ${
            menuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="grid grid-cols-2 gap-1 px-4 py-4 text-sm text-papyrus/80" aria-label="Navegación móvil">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const active = isNavLinkActive(label, href, pathname);
              return (
                <Link
                  key={label}
                  href={resolveHref(href, onLanding)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition hover:bg-papyrus/[0.05] hover:text-gold-bright ${
                    active ? `bg-papyrus/[0.04] text-papyrus ${ACTIVE_LINK_GLOW}` : ""
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.5}
                    className={active ? "text-gold" : "text-gold-light/80"}
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
