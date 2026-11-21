"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Flame } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { Role } from "../../lib/rbac-config";
import { usePathname } from "next/navigation";

/**
 * Shell del dashboard: orquesta la barra lateral, el topbar y el contenido.
 * Tema nocturno con superficies de cristal y acentos dorados.
 */
export function DashboardShell({
  staffName,
  currentRole,
  isRealAdmin,
  homeHref,
  children,
}: {
  staffName: string;
  currentRole: Role;
  isRealAdmin: boolean;
  homeHref: string;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el cajón al navegar (móvil).
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Bloquear scroll del fondo con el cajón abierto (móvil).
  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <div className="relative min-h-screen bg-[#0b1020] text-[#e9e2d2]">
      {/* Atmósfera: halos dorados muy tenues */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <span className="absolute -left-40 top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(199,164,90,.10),transparent_70%)] blur-3xl" />
        <span className="absolute bottom-[-14rem] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(28,36,56,.9),transparent_70%)] blur-3xl" />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#05070d]/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <DashboardSidebar currentRole={currentRole} homeHref={homeHref} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative min-h-screen lg:pl-[272px]">
        <DashboardTopbar
          name={staffName}
          currentRole={currentRole}
          isRealAdmin={isRealAdmin}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* Botón flotante Cozy: fuego vivo, sin recuadro */}
      <button
        type="button"
        aria-label="Abrir asistente Cozy"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center border-0 bg-transparent p-0 text-[#ff7a1a] shadow-none transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a45a]"
      >
        <Flame className="h-11 w-11 text-[#ff7a1a] cozy-flame-live" aria-hidden="true" />
      </button>
    </div>
  );
}
