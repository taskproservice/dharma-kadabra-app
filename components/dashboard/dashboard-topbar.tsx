"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Sparkles } from "lucide-react";
import { DASHBOARD_HOME_BY_ROLE, findActiveNavItem } from "../../lib/navigation";
import { ROLE_PERMISSIONS, type Role } from "../../lib/rbac-config";
import { RoleSelector } from "./role-selector";
import { SignOutButton } from "./sign-out-button";

/**
 * Barra superior del dashboard: contexto de la sección actual, notificaciones,
 * cambio de rol (solo ADMIN) y cierre de sesión.
 */
export function DashboardTopbar({
  name,
  currentRole,
  isRealAdmin,
  onMenuClick,
}: {
  name: string;
  currentRole: Role;
  isRealAdmin: boolean;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const firstName = name.trim().split(/\s+/)[0] || "Paola";
  const roleConfig = ROLE_PERMISSIONS[currentRole];
  const activeItem = findActiveNavItem(currentRole, pathname);
  const homeHref = DASHBOARD_HOME_BY_ROLE[currentRole];
  const isHome = pathname.split("?")[0].replace(/\/$/, "") === homeHref;
  const initial = (firstName.charAt(0) || "D").toUpperCase();
  const today = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-gold/12 bg-obsidian/85 backdrop-blur-xl">
      <div className="flex min-h-[68px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onMenuClick}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-gold/25 text-papyrus/80 transition hover:border-gold/60 hover:text-gold lg:hidden"
        >
          <Menu size={17} />
        </button>

        <div className="min-w-0 flex-1">
          <nav aria-label="Ruta actual" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.2em] text-papyrus/40">
            <span>Dharma Kadabra</span>
            <ChevronRight size={11} className="text-gold/50" aria-hidden="true" />
            <span className="truncate text-gold/85">{isHome ? roleConfig.label : activeItem?.label ?? roleConfig.label}</span>
          </nav>
          <h1 className="mt-0.5 truncate font-display text-[19px] leading-tight text-papyrus">
            Hola, {firstName}
            <span className="ml-2 hidden align-middle text-[11px] font-sans normal-case tracking-normal text-papyrus/40 sm:inline">
              · {today}
            </span>
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isRealAdmin && <RoleSelector currentRole={currentRole} />}
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Notificaciones (Próximamente)"
            title="Centro de notificaciones · Próximamente"
            className="relative grid size-9 cursor-not-allowed place-items-center rounded-full border border-gold/20 text-papyrus/45 opacity-60"
          >
            <Bell size={16} strokeWidth={1.7} />
          </button>
          <span
            aria-hidden="true"
            className="hidden size-9 place-items-center rounded-full border border-gold/35 bg-gradient-to-br from-gold/25 to-transparent font-display text-sm text-gold-bright sm:grid"
            title={`${name} · ${roleConfig.label}`}
          >
            {initial}
          </span>
          <SignOutButton />
        </div>
      </div>

      {/* Hilo dorado inferior con acento central */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent">
        <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold" aria-hidden="true" />
      </div>
      <span className="sr-only">
        <Sparkles /> Sesión de {roleConfig.label}
      </span>
    </header>
  );
}
