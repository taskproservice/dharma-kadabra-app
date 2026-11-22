"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { getNavigationForRole, isNavItemActive } from "../../lib/navigation";
import { ROLE_PERMISSIONS, type Role } from "../../lib/rbac-config";
import { BrandLockup } from "./brand-lockup";

/**
 * Barra lateral del dashboard: fija en escritorio, cajón (drawer) en móvil · Tema Papyrus.
 */
export function DashboardSidebar({
  currentRole,
  homeHref,
  open,
  onClose,
}: {
  currentRole: Role;
  homeHref: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const sections = getNavigationForRole(currentRole);
  const roleConfig = ROLE_PERMISSIONS[currentRole];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[272px] max-w-[86vw] flex-col border-r border-[#C5A059]/35 bg-[#FCFAF5]/95 backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Navegación del dashboard"
    >
      {/* Resplandor superior */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(197,160,89,.18),transparent_70%)] blur-2xl"
      />

      <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-6">
        <Link href={homeHref} onClick={onClose} className="flex items-center" aria-label="Dharma Kadabra · Dashboard">
          <BrandLockup size={42} />
        </Link>
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg border border-[#2C2C2C]/25 text-[#2C2C2C]/75 transition hover:border-[#C5A059] hover:text-[#1A1A1A] lg:hidden"
        >
          <X size={15} />
        </button>
      </div>

      {/* Rol activo */}
      <div className="mx-4 mb-4 rounded-xl border border-[#C5A059]/35 bg-[#F4EFE6] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#2C2C2C]/65">
            Rol activo
          </span>
          <span className="rounded-full border border-[#C5A059]/50 bg-[#C5A059]/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.12em] text-[#6B4E24]">
            {roleConfig.badge}
          </span>
        </div>
        <p className="mt-1.5 font-display text-[15px] leading-tight text-[#1A1A1A]">{roleConfig.label}</p>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6" aria-label="Navegación principal">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <h2 className="mb-2 flex items-center gap-2.5 px-3 text-[9px] font-semibold uppercase tracking-[.26em] text-[#8B6914]">
              <span className="h-px w-3 bg-[#C5A059]" aria-hidden="true" />
              {section.title}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = isNavItemActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                        active
                          ? "bg-gradient-to-r from-[#C5A059]/25 to-transparent font-medium text-[#1A1A1A]"
                          : "text-[#2C2C2C]/75 hover:bg-[#F4EFE6] hover:text-[#1A1A1A]"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1.5 left-0 w-[2.5px] rounded-full bg-[#C5A059]"
                        />
                      )}
                      <Icon
                        size={17}
                        strokeWidth={1.6}
                        className={active ? "text-[#8B6914]" : "text-[#2C2C2C]/55 transition-colors group-hover:text-[#8B6914]"}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#C5A059]/25 px-6 py-4">
        <p className="font-display text-[13px] italic text-[#2C2C2C]/60">
          Conecta · Transforma · Armoniza
        </p>
      </div>
    </aside>
  );
}
