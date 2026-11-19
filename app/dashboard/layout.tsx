import Link from "next/link";
import {
  AudioLines,
  BookOpen,
  CalendarDays,
  CreditCard,
  Flame,
  Headphones,
  LayoutDashboard,
  Megaphone,
  Palette,
  Settings,
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

const sections: {
  title: string;
  links: { label: string; href: string; icon: LucideIcon }[];
}[] = [
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

// Fuente del rol: conectar a la sesión real cuando se habilite autenticación.
// Paola tiene acceso administrativo en la experiencia actual del Dashboard.
const currentUser = { name: "Paola Hernández", role: "ADMIN" as "ADMIN" | "COLLABORATOR" };
const visibleSections = currentUser.role === "ADMIN" ? sections : sections.filter((section) => section.title !== "Administración");

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4ECD8] text-[#3E2723]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col overflow-y-auto border-r border-[#3E2723]/10 bg-[#E8DCC0] px-5 py-6">
        <Link href="/dashboard/resumen" className="mb-8 flex items-center gap-3 px-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#3E2723] text-[#D4AF37]"><Flame size={24} /></span>
          <span className="text-xl font-semibold tracking-tight">Dharma <span className="text-[#A98419]">Kadabra</span></span>
        </Link>
        <nav className="space-y-6" aria-label="Navegación principal">
          {visibleSections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3E2723]/55">{section.title}</h2>
              <ul className="space-y-1">
                {section.links.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-white/60 hover:text-[#8B6D16]">
                      <Icon size={18} strokeWidth={1.8} />{label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      <div className="ml-72 min-h-screen">
        <DashboardHeader userName={currentUser.name} userRole={currentUser.role} />
        <main className="p-8">{children}</main>
      </div>

      <button
        type="button"
        aria-label="Abrir asistente Cozy"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center p-2 text-[#D4AF37] transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        <Flame className="w-10 h-10 text-[#D4AF37] filter drop-shadow-[0_0_20px_rgba(212,175,55,0.6)] animate-pulse" />
      </button>
    </div>
  );
}
