/**
 * Dharma Kadabra · Configuración tipada de la navegación del Dashboard.
 *
 * Única fuente de verdad para el menú lateral. Cada entrada declara su ruta,
 * icono y, opcionalmente, `roles` (una restricción *de presentación* extra).
 *
 * La autorización real NUNCA depende de este archivo: el `middleware.ts` y
 * `lib/rbac-config.ts` deciden qué rutas puede abrir cada rol, y las rutas de
 * API validan la sesión en el servidor. Aquí solo curamos qué se muestra.
 */
import {
  AudioLines,
  BookOpen,
  CalendarDays,
  CreditCard,
  Film,
  Flame,
  Headphones,
  LayoutDashboard,
  Megaphone,
  MoonStar,
  Package,
  Palette,
  Settings,
  Share2,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Users,
  Video,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { DASHBOARD_HOME_BY_ROLE, ROLE_PERMISSIONS, type Role } from "./rbac-config";

export { DASHBOARD_HOME_BY_ROLE };

export interface NavItem {
  /** Etiqueta visible en el menú. */
  label: string;
  /** Ruta del App Router. */
  href: string;
  icon: LucideIcon;
  /** Descripción breve usada en el topbar / tooltips. */
  description?: string;
  /** Etiqueta corta adicional (p. ej. contador o estado). */
  badge?: string;
  /** Restricción de presentación: si se define, solo estos roles lo ven. */
  roles?: Role[];
}

export interface NavGroup {
  /** Título de la sección en la barra lateral. */
  title: string;
  items: NavItem[];
}

/**
 * Menú maestro. El orden de los grupos y de las entradas define la jerarquía
 * visual de la barra lateral.
 */
export const DASHBOARD_NAVIGATION: NavGroup[] = [
  {
    title: "Inicio",
    items: [
      {
        label: "Centro de comando",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "KPIs, accesos rápidos y actividad del día.",
        roles: ["ADMIN", "ENGINEER"],
      },
    ],
  },
  {
    title: "Operación",
    items: [
      {
        label: "Punto de Venta",
        href: "/dashboard/pos",
        icon: ShoppingCart,
        description: "Terminal de cobro y catálogo de piezas.",
      },
      {
        label: "Inventario",
        href: "/dashboard/inventario",
        icon: Package,
        description: "Stock, plantillas, venta rápida y video IA.",
        roles: ["ADMIN"],
      },
      {
        label: "Agenda",
        href: "/dashboard/agenda",
        icon: CalendarDays,
        description: "Citas, disponibilidad y recordatorios.",
      },
      {
        label: "Eventos",
        href: "/dashboard/eventos",
        icon: MoonStar,
        description: "Calendario lunar y encuentros especiales.",
      },
      {
        label: "Colaboradores",
        href: "/dashboard/colaboradores",
        icon: Users,
        description: "Equipo, especialidades y guías.",
      },
    ],
  },
  {
    title: "Contenido",
    items: [
      {
        label: "Redes Sociales",
        href: "/dashboard/redes",
        icon: Share2,
        description: "Publicaciones y calendario editorial.",
      },
      {
        label: "Audios",
        href: "/dashboard/audio",
        icon: AudioLines,
        description: "Meditaciones y pistas de audio.",
      },
      {
        label: "Video",
        href: "/dashboard/video",
        icon: Video,
        description: "Recursos visuales y clases grabadas.",
      },
      {
        label: "Tour de marca",
        href: "/dashboard/tour",
        icon: Film,
        description: "Video inmersivo y capítulos del Hero.",
        roles: ["ADMIN", "ENGINEER"],
      },
      {
        label: "Diseño base",
        href: "/dashboard/diseno",
        icon: Palette,
        description: "Identidad visual del negocio.",
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        label: "Finanzas",
        href: "/dashboard/ventas",
        icon: ShoppingBag,
        description: "Transacciones, importes y conciliación.",
        roles: ["ADMIN"],
      },
      {
        label: "Pasarela de Pagos",
        href: "/dashboard/pagos",
        icon: CreditCard,
        description: "Métodos de cobro y actividad de pagos.",
        roles: ["ADMIN"],
      },
      {
        label: "Runas",
        href: "/dashboard/runas",
        icon: BookOpen,
        description: "Programa de recompensas para clientes.",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        label: "Panel administrativo",
        href: "/dashboard/admin",
        icon: Settings,
        description: "Preferencias del negocio y del equipo.",
      },
      {
        label: "Información general",
        href: "/dashboard/info",
        icon: Headphones,
        description: "Datos de contacto y marca.",
      },
    ],
  },
  {
    title: "Agentes IA",
    items: [
      {
        label: "Cozy (Chatbot)",
        href: "/dashboard/cozy",
        icon: Flame,
        description: "Asistente espiritual del sitio.",
      },
      {
        label: "Agente de Ventas",
        href: "/dashboard/agente-ventas",
        icon: WandSparkles,
        description: "Prospectos y seguimiento comercial.",
      },
      {
        label: "Agente de Marketing",
        href: "/dashboard/agente-marketing",
        icon: Megaphone,
        description: "Campañas y alcance de contenidos.",
      },
    ],
  },
  {
    title: "Mi espacio",
    items: [
      {
        label: "Mi perfil",
        href: "/dashboard/perfil",
        icon: UserRound,
        description: "Tu información pública y de contacto.",
      },
    ],
  },
];

/**
 * Etiquetas específicas por rol. Permiten que el mismo módulo se lea como
 * "Mi Agenda" para una colaboradora y "Agenda" para administración.
 */
const ROLE_LABEL_OVERRIDES: Partial<Record<Role, Record<string, string>>> = {
  COLLABORATOR: {
    "/dashboard/perfil": "Mi Perfil",
    "/dashboard/agenda": "Mi Agenda",
    "/dashboard/audio": "Audios",
  },
};

/**
 * Curación del menú por rol, además de los permisos de `rbac-config`.
 * Ambas condiciones deben cumplirse para que una entrada se muestre.
 */
const ROLE_NAV_EXCLUSIONS: Partial<Record<Role, string[]>> = {
  // La colaboradora no necesita una sección "Inicio": su home es su agenda.
  COLLABORATOR: ["/dashboard", "/dashboard/redes", "/dashboard/video", "/dashboard/diseno"],
  // Social media no usa el centro de comando financiero.
  SOCIAL_MEDIA: ["/dashboard", "/dashboard/agenda", "/dashboard/eventos", "/dashboard/colaboradores"],
  // El cliente de tienda solo navega a su perfil.
  CLIENT: ["/dashboard"],
};

function isItemVisibleForRole(item: NavItem, role: Role): boolean {
  if (item.roles && !item.roles.includes(role)) return false;
  if (ROLE_NAV_EXCLUSIONS[role]?.includes(item.href)) return false;
  return ROLE_PERMISSIONS[role].isAllowed(item.href);
}

/**
 * Construye el menú del rol: filtra entradas por permisos + curación,
 * aplica etiquetas por rol y descarta los grupos vacíos.
 */
export function getNavigationForRole(role: Role): NavGroup[] {
  const labels = ROLE_LABEL_OVERRIDES[role] ?? {};
  return DASHBOARD_NAVIGATION.map((group) => ({
    title: group.title,
    items: group.items
      .filter((item) => isItemVisibleForRole(item, role))
      .map((item) => ({ ...item, label: labels[item.href] ?? item.label })),
  })).filter((group) => group.items.length > 0);
}

/** Marca la entrada activa (coincidencia exacta o prefijo de subruta). */
export function isNavItemActive(pathname: string, href: string): boolean {
  const clean = pathname.split("?")[0].replace(/\/$/, "") || "/dashboard";
  if (href === "/dashboard") return clean === "/dashboard";
  return clean === href || clean.startsWith(`${href}/`);
}

/** Devuelve la entrada del menú que corresponde a la ruta actual (o null). */
export function findActiveNavItem(role: Role, pathname: string): NavItem | null {
  for (const group of getNavigationForRole(role)) {
    for (const item of group.items) {
      if (isNavItemActive(pathname, item.href)) return item;
    }
  }
  return null;
}
