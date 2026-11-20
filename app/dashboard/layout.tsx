import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AudioLines,
  BookOpen,
  CalendarDays,
  CreditCard,
  Flame,
  Headphones,
  LayoutDashboard,
  Megaphone,
  MoonStar,
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
import { DashboardHeader } from "../../components/dashboard/dashboard-header";
import { ROLE_PERMISSIONS, ROLE_PREVIEW_COOKIE, getStaffPrincipal, parseRole, type Role } from "../../lib/rbac";

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const collaboratorLabels: Record<string, string> = {
  "/dashboard/perfil": "Mi Perfil",
  "/dashboard/agenda": "Mi Agenda",
  "/dashboard/audio": "Audios",
};

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
      { label: "Eventos Especiales", href: "/dashboard/eventos", icon: MoonStar },
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

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Rol REAL: sale de la sesión de NextAuth, revalidada contra la base de datos.
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard");
  const isRealAdmin = staff.role === "ADMIN";

  // Una ADMIN real puede previsualizar la navegación de otro rol (solo UI).
  const cookieStore = await cookies();
  const previewRole = isRealAdmin ? parseRole(cookieStore.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const currentRole: Role = previewRole ?? staff.role;
  const roleConfig = ROLE_PERMISSIONS[currentRole];

  // Filtramos las secciones visibles de acuerdo a los permisos específicos del rol
  const visibleSections = sections
    .map((section) => ({
      ...section,
      links: section.links
        .filter((link) => roleConfig.isAllowed(link.href))
        .map((link) => currentRole === "COLLABORATOR"
          ? { ...link, label: collaboratorLabels[link.href] ?? link.label }
          : link),
    }))
    .filter((section) => section.links.length > 0);


  return (
    <div className="min-h-screen bg-[#F4ECD8] text-[#3E2723]">
      {/* Barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col overflow-y-auto border-r border-[#3E2723]/10 bg-[#E8DCC0] px-5 py-6">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 group">
          <Image
            src="/images/logo.png"
            alt="Dharma Kadabra"
            width={44}
            height={44}
            priority
            className="shrink-0 border-0 bg-transparent object-contain drop-shadow-[0_0_8px_rgba(169,132,25,0.25)]"
          />
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
          <p className="mt-1 text-sm font-semibold text-[#3E2723]">{roleConfig.label}</p>
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
        <DashboardHeader
          name={staff.name}
          roleTitle={roleConfig.label}
          currentRole={currentRole}
          isRealAdmin={isRealAdmin}
        />
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
