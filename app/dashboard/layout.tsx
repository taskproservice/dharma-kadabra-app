import Link from "next/link";
import { cookies } from "next/headers";
import {
  AudioLines,
  Bell,
  BookOpen,
  CalendarDays,
  CreditCard,
  Flame,
  Headphones,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Palette,
  Settings,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Users,
  Video,
  UserRound,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { RoleSelector } from "../../components/dashboard/role-selector";
import { ROLE_PERMISSIONS, normalizeRole, type Role } from "../../lib/rbac";

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const sections: NavSection[] = [
  {
    title: "Principal",
    links: [
      { label: "Resumen", href: "/dashboard/resumen", icon: LayoutDashboard },
      { label: "Perfil", href: "/dashboard/perfil", icon: UserRound },
    ],
  },
  {
    title: "Ventas",
    links: [
      { label: "Punto de Venta", href: "/dashboard/pos", icon: ShoppingCart },
      { label: "Módulo de Ventas", href: "/dashboard/ventas", icon: ShoppingBag },
      { label: "Agenda Electrónica", href: "/dashboard/agenda", icon: CalendarDays },
    ],
  },
  {
    title: "Contenido",
    links: [
      { label: "Redes Sociales", href: "/dashboard/redes", icon: Share2 },
      { label: "Audio", href: "/dashboard/audio", icon: AudioLines },
      { label: "Video", href: "/dashboard/video", icon: Video },
      { label: "Diseño Base", href: "/dashboard/diseno", icon: Palette },
    ],
  },
  {
    title: "Agentes IA",
    links: [
      { label: "Cozy (Chatbot)", href: "/dashboard/cozy", icon: Flame },
      { label: "Agente de Ventas", href: "/dashboard/agente-ventas", icon: WandSparkles },
      { label: "Agente de Marketing", href: "/dashboard/agente-marketing", icon: Megaphone },
    ],
  },
  {
    title: "Administración",
    links: [
      { label: "Colaboradores", href: "/dashboard/colaboradores", icon: Users },
      { label: "Runas", href: "/dashboard/runas", icon: BookOpen },
      { label: "Pasarela de Pagos", href: "/dashboard/pagos", icon: CreditCard },
      { label: "Panel Administrativo", href: "/dashboard/admin", icon: Settings },
      { label: "Información General", href: "/dashboard/info", icon: Headphones },
    ],
  },
];

/**
 * Objeto de configuración en app/dashboard/layout.tsx que define qué módulos ve cada rol:
 * - ADMIN: Ve todo.
 * - ENGINEER: Ve todo, excepto Pasarela de Pagos y Runas.
 * - SOCIAL_MEDIA: Solo ve Resumen (Métricas), Audio/Video, y Redes Sociales.
 * - COLLABORATOR: Solo ve su propio Perfil, Agenda Electrónica (solo sus citas), y Audio.
 * - CLIENT: Solo ve Perfil.
 */
const ROLE_MODULES_CONFIG: Record<Role, {
  name: string;
  allowedModules: string[];
  isAllowed: (href: string) => boolean;
}> = {
  ADMIN: {
    name: "Administradora",
    allowedModules: ["*"], // Ve todo
    isAllowed: () => true,
  },
  ENGINEER: {
    name: "Ingeniero (Soporte)",
    // Ve todo, excepto Pasarela de Pagos y Runas
    allowedModules: [
      "Resumen", "Perfil", "Punto de Venta", "Módulo de Ventas", "Agenda Electrónica",
      "Redes Sociales", "Audio", "Video", "Diseño Base",
      "Cozy (Chatbot)", "Agente de Ventas", "Agente de Marketing",
      "Colaboradores", "Panel Administrativo", "Información General"
    ],
    isAllowed: (href: string) => {
      const clean = href.split("?")[0].replace(/\/$/, "");
      return (
        clean !== "/dashboard/pagos" &&
        !clean.startsWith("/dashboard/pagos/") &&
        clean !== "/dashboard/pasarela-pagos" &&
        !clean.startsWith("/dashboard/pasarela-pagos/") &&
        clean !== "/dashboard/runas" &&
        !clean.startsWith("/dashboard/runas/")
      );
    },
  },
  SOCIAL_MEDIA: {
    name: "Social Media",
    // Solo ve Resumen (Métricas), Audio/Video, y un nuevo módulo "Redes Sociales"
    allowedModules: ["Resumen", "Redes Sociales", "Audio", "Video"],
    isAllowed: (href: string) => {
      const clean = href.split("?")[0].replace(/\/$/, "");
      if (clean === "/dashboard") return true;
      const allowedPrefixes = [
        "/dashboard/resumen",
        "/dashboard/audio",
        "/dashboard/video",
        "/dashboard/redes",
      ];
      return allowedPrefixes.some((allowed) => clean === allowed || clean.startsWith(allowed + "/"));
    },
  },
  COLLABORATOR: {
    name: "Colaboradora",
    // Solo ve su propio Perfil, Agenda Electrónica (solo sus citas), y Audio
    allowedModules: ["Perfil", "Agenda Electrónica", "Audio"],
    isAllowed: (href: string) => {
      const clean = href.split("?")[0].replace(/\/$/, "");
      if (clean === "/dashboard") return true;
      const allowedPrefixes = [
        "/dashboard/perfil",
        "/dashboard/agenda",
        "/dashboard/audio",
      ];
      return allowedPrefixes.some((allowed) => clean === allowed || clean.startsWith(allowed + "/"));
    },
  },
  CLIENT: {
    name: "Cliente",
    allowedModules: ["Perfil"],
    isAllowed: (href: string) => {
      const clean = href.split("?")[0].replace(/\/$/, "");
      if (clean === "/dashboard") return true;
      return clean === "/dashboard/perfil" || clean.startsWith("/dashboard/perfil/");
    },
  },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get("role")?.value;
  const currentRole: Role = normalizeRole(rawRole || "ADMIN");
  const roleConfig = ROLE_PERMISSIONS[currentRole] ?? ROLE_PERMISSIONS.ADMIN;

  // Filtramos las secciones visibles de acuerdo a los permisos específicos del rol
  const visibleSections = sections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => roleConfig.isAllowed(link.href)),
    }))
    .filter((section) => section.links.length > 0);

  const roleTitleMap: Record<Role, string> = {
    ADMIN: "Administradora",
    ENGINEER: "Ingeniero (Soporte)",
    SOCIAL_MEDIA: "Social Media Manager",
    COLLABORATOR: "Colaboradora",
    CLIENT: "Cliente",
  };

  return (
    <div className="min-h-screen bg-[#F4ECD8] text-[#3E2723]">
      {/* Barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col overflow-y-auto border-r border-[#3E2723]/10 bg-[#E8DCC0] px-5 py-6">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 group">
          <span className="grid size-11 place-items-center bg-transparent text-[#FF7300]">
            <Flame size={32} className="text-[#FF7300] cozy-flame-live" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            Dharma <span className="text-[#A98419]">Kadabra</span>
          </span>
        </Link>

        {/* Indicador de rol activo */}
        <div className="mb-6 rounded-2xl border border-[#D4AF37]/30 bg-white/40 p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3E2723]/60">
              Rol Activo
            </span>
            <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-semibold text-[#8B6D16]">
              {roleConfig.badge}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#3E2723]">{roleTitleMap[currentRole]}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[#3E2723]/65">{roleConfig.description}</p>
        </div>

        <nav className="space-y-6" aria-label="Navegación principal">
          {visibleSections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3E2723]/55">
                {section.title}
              </h2>
              <ul className="space-y-1">
                {section.links.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-white/60 hover:text-[#8B6D16]"
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="ml-72 min-h-screen">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#3E2723]/10 bg-[#F4ECD8]/90 px-8 backdrop-blur-md">
          {/* Selector interactivo de rol para pruebas y demostración */}
          <RoleSelector currentRole={currentRole} />

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative rounded-full p-2.5 transition hover:bg-white/70"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[#D4AF37]" />
            </button>
            <div className="h-8 w-px bg-[#3E2723]/15" />
            <div className="text-right">
              <p className="text-sm font-semibold">Paola Hernández</p>
              <p className="text-xs text-[#3E2723]/55">{roleTitleMap[currentRole]}</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#3E2723]/15 px-3.5 py-2 text-sm font-medium transition hover:bg-white/70"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>

      {/* Botón flotante Cozy: Fuego vivo puro sin recuadro ni fondo */}
      <button
        type="button"
        aria-label="Abrir asistente Cozy"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center bg-transparent border-0 shadow-none p-0 text-[#FF7300] transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:outline-none"
      >
        <Flame className="w-11 h-11 text-[#FF7300] cozy-flame-live" aria-hidden="true" />
      </button>
    </div>
  );
}
