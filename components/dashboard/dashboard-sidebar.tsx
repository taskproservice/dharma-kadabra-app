"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { getNavigationForRole, isNavItemActive } from "../../lib/navigation";
import { ROLE_PERMISSIONS, type Role } from "../../lib/rbac-config";
import { BrandLockup } from "./brand-lockup";

/**
 * Barra lateral del dashboard: fija en escritorio, cajón (drawer) en móvil.
 * El menú proviene de `lib/navigation.ts` y ya llega filtrado por rol.
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
      className={`fixed inset-y-0 left-0 z-40 flex w-[272px] max-w-[86vw] flex-col border-r border-[#c7a45a]/15 bg-[#0b1020]/95 backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)] lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Navegación del dashboard"
    >
      {/* Resplandor superior */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(199,164,90,.16),transparent_70%)] blur-2xl"
      />

      <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-6">
        <Link href={homeHref} onClick={onClose} className="flex items-center" aria-label="Dharma Kadabra · Dashboard">
          <BrandLockup size={42} />
        </Link>
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg border border-[#c7a45a]/20 text-[#e9e2d2]/60 transition hover:border-[#c7a45a]/50 hover:text-[#c7a45a] lg:hidden"
        >
          <X size={15} />
        </button>
      </div>

      {/* Rol activo */}
      <div className="mx-4 mb-4 rounded-xl border border-[#c7a45a]/20 bg-white/[0.03] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#e9e2d2]/45">
            Rol activo
          </span>
          <span className="rounded-full border border-[#c7a45a]/35 bg-[#c7a45a]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.12em] text-[#d8bc7f]">
            {roleConfig.badge}
          </span>
        </div>
        <p className="mt-1.5 font-display text-[15px] leading-tight text-[#f7f2e7]">{roleConfig.label}</p>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6" aria-label="Navegación principal">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <h2 className="mb-2 flex items-center gap-2.5 px-3 text-[9px] font-semibold uppercase tracking-[.26em] text-[#c7a45a]/55">
              <span className="h-px w-3 bg-[#c7a45a]/35" aria-hidden="true" />
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
                          ? "bg-gradient-to-r from-[#c7a45a]/18 to-transparent text-[#f7f2e7]"
                          : "text-[#e9e2d2]/65 hover:bg-white/[0.045] hover:text-[#f7f2e7]"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-gradient-to-b from-[#e3c57c] to-[#c7a45a] shadow-[0_0_10px_rgba(199,164,90,.8)]"
                        />
                      )}
                      <Icon
                        size={17}
                        strokeWidth={1.6}
                        className={active ? "text-[#d8bc7f]" : "text-[#e9e2d2]/45 transition-colors group-hover:text-[#d8bc7f]"}
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

      <div className="border-t border-[#c7a45a]/12 px-6 py-4">
        <p className="font-display text-[13px] italic text-[#e9e2d2]/45">
          Conecta · Transforma · Armoniza
        </p>
      </div>
    </aside>
  );
}
