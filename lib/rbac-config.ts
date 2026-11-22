/**
 * Dharma Kadabra - Configuración RBAC (pura y edge-safe).
 *
 * Este módulo NO lee sesiones: solo describe qué puede hacer cada rol.
 * Lo importan el middleware (Edge), componentes cliente y `lib/rbac.ts`,
 * que es el que extrae la sesión verificada en el servidor.
 */

export type Role = "ADMIN" | "ENGINEER" | "SOCIAL_MEDIA" | "COLLABORATOR" | "CLIENT";

export interface RoleConfig {
  role: Role;
  label: string;
  badge: string;
  description: string;
  allowedHrefs: string[];
  isAllowed: (path: string) => boolean;
}

export const ROLES: Role[] = ["ADMIN", "ENGINEER", "SOCIAL_MEDIA", "COLLABORATOR", "CLIENT"];

/**
 * Página de inicio del dashboard según el rol. Se usa en el middleware para
 * devolver a cada rol a un punto de entrada que sí tenga permitido.
 */
export const DASHBOARD_HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: "/dashboard",
  ENGINEER: "/dashboard",
  SOCIAL_MEDIA: "/dashboard/redes",
  COLLABORATOR: "/dashboard/perfil",
  CLIENT: "/dashboard/perfil",
};

/**
 * Objeto de configuración de módulos y permisos por rol.
 * Define con precisión qué rutas y módulos del Dashboard puede visualizar y acceder cada rol.
 */
export const ROLE_PERMISSIONS: Record<Role, RoleConfig> = {
  ADMIN: {
    role: "ADMIN",
    label: "Administradora",
    badge: "Acceso Total",
    description: "Acceso completo a todos los módulos y herramientas del sistema.",
    allowedHrefs: ["*"],
    isAllowed: () => true, // Ve todo
  },
  ENGINEER: {
    role: "ENGINEER",
    label: "Ingeniero (Soporte)",
    badge: "Soporte Técnico",
    description: "Acceso a todo el sistema excepto Finanzas, Pasarela de Pagos y Runas.",
    allowedHrefs: [
      "/dashboard",
      "/dashboard/resumen",
      "/dashboard/perfil",
      "/dashboard/pos",
      "/dashboard/agenda",
      "/dashboard/eventos",
      "/dashboard/audio",
      "/dashboard/video",
      "/dashboard/tour",
      "/dashboard/diseno",
      "/dashboard/diseno-base",
      "/dashboard/redes",
      "/dashboard/cozy",
      "/dashboard/agente-ventas",
      "/dashboard/agente-marketing",
      "/dashboard/colaboradores",
      "/dashboard/admin",
      "/dashboard/panel-administrativo",
      "/dashboard/info",
      "/dashboard/informacion-general",
    ],
    // Ve todo, excepto Finanzas, Pasarela de Pagos y Runas
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
      const isForbidden =
        clean === "/dashboard/ventas" ||
        clean.startsWith("/dashboard/ventas/") ||
        clean === "/dashboard/pagos" ||
        clean.startsWith("/dashboard/pagos/") ||
        clean === "/dashboard/pasarela-pagos" ||
        clean.startsWith("/dashboard/pasarela-pagos/") ||
        clean === "/dashboard/runas" ||
        clean.startsWith("/dashboard/runas/");
      return !isForbidden;
    },
  },
  SOCIAL_MEDIA: {
    role: "SOCIAL_MEDIA",
    label: "Social Media Manager",
    badge: "Marketing & Redes",
    description: "Solo ve Redes Sociales y Contenido (audio y video).",
    // Solo ve Resumen (Métricas), Audio/Video, y un nuevo módulo "Redes Sociales" (donde pueda programar posts)
    allowedHrefs: [
      "/dashboard/audio",
      "/dashboard/video",
      "/dashboard/redes",
    ],
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
      const allowedPrefixes = [
        "/dashboard/audio",
        "/dashboard/video",
        "/dashboard/redes",
      ];
      return allowedPrefixes.some((allowed) => clean === allowed || clean.startsWith(allowed + "/"));
    },
  },
  COLLABORATOR: {
    role: "COLLABORATOR",
    label: "Colaboradora",
    badge: "Terapeuta / Guía",
    description: "Solo ve su propio Perfil, Agenda Electrónica (solo sus citas), y Audio.",
    // Solo ve su propio Perfil, Agenda Electrónica (solo sus citas), y Audio
    allowedHrefs: [
      "/dashboard/perfil",
      "/dashboard/agenda",
      "/dashboard/audio",
    ],
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
      const allowedPrefixes = [
        "/dashboard/perfil",
        "/dashboard/agenda",
        "/dashboard/audio",
      ];
      return allowedPrefixes.some((allowed) => clean === allowed || clean.startsWith(allowed + "/"));
    },
  },
  CLIENT: {
    role: "CLIENT",
    label: "Cliente",
    badge: "Comunidad",
    description: "Vista de cliente con acceso a su perfil personal.",
    allowedHrefs: ["/dashboard", "/dashboard/perfil"],
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
      if (clean === "/dashboard") return true;
      return clean === "/dashboard/perfil" || clean.startsWith("/dashboard/perfil/");
    },
  },
};

/**
 * Interpreta una cadena como un Rol válido del sistema.
 * Devuelve `null` si no es reconocible: nunca se asume ADMIN por defecto.
 */
export function parseRole(raw?: string | null): Role | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  return (ROLES as string[]).includes(upper) ? (upper as Role) : null;
}

/**
 * Verifica si un rol tiene autorización para acceder a una ruta del dashboard.
 */
export function isRouteAllowedForRole(role: Role, path: string): boolean {
  const config = ROLE_PERMISSIONS[role];
  return config ? config.isAllowed(path) : false;
}

/* -------------------------------------------------------------------------- */
/*                        Permisos de la API por recurso                       */
/* -------------------------------------------------------------------------- */

export type ApiAction = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiResource = "appointments" | "events" | "notifications" | "products" | "pos" | "store" | "tour";

/**
 * Matriz de autorización de la API: recurso → método HTTP → roles permitidos.
 * Un método ausente equivale a "nadie" (denegado por defecto).
 *
 * - CLIENT corresponde a una cuenta de cliente con sesión iniciada en /mi-cuenta.
 *   Los handlers deben además verificar la propiedad del recurso (sus citas).
 * - El resto de roles corresponde al equipo autenticado con NextAuth.
 */
export const API_PERMISSIONS: Record<ApiResource, Partial<Record<ApiAction, readonly Role[]>>> = {
  appointments: {
    GET: ["ADMIN", "ENGINEER", "COLLABORATOR"],
    POST: ["ADMIN", "COLLABORATOR", "CLIENT"],
    PUT: ["ADMIN", "COLLABORATOR", "CLIENT"],
    PATCH: ["ADMIN", "COLLABORATOR", "CLIENT"],
    DELETE: ["ADMIN"],
  },
  events: {
    GET: ["ADMIN", "ENGINEER", "SOCIAL_MEDIA", "COLLABORATOR"],
    POST: ["ADMIN", "ENGINEER"],
    PUT: ["ADMIN", "ENGINEER"],
    PATCH: ["ADMIN", "ENGINEER"],
    DELETE: ["ADMIN"],
  },
  notifications: {
    // GET lo ejecuta Vercel Cron (con CRON_SECRET) o una administradora.
    GET: ["ADMIN"],
    // POST es el disparo manual desde la Agenda.
    POST: ["ADMIN", "ENGINEER"],
  },
  products: {
    // Catálogo del Punto de Venta: solo el equipo que opera la terminal.
    GET: ["ADMIN", "ENGINEER"],
    // Holistic Store · altas, ediciones y bajas del inventario: solo ADMIN.
    POST: ["ADMIN"],
    PUT: ["ADMIN"],
    PATCH: ["ADMIN"],
    DELETE: ["ADMIN"],
  },
  pos: {
    // Cobro en terminal: registra la venta en la base de datos.
    POST: ["ADMIN", "ENGINEER"],
  },
  store: {
    // Holistic Store · plantillas visuales por categoría: solo ADMIN.
    PUT: ["ADMIN"],
    PATCH: ["ADMIN"],
  },
  tour: {
    // Tour de marca (video inmersivo del Hero). El GET es público (la landing
    // lo sirve a todos); la gestión del video y los capítulos es del equipo.
    GET: ["ADMIN", "ENGINEER", "SOCIAL_MEDIA", "COLLABORATOR", "CLIENT"],
    POST: ["ADMIN", "ENGINEER"],
    PUT: ["ADMIN", "ENGINEER"],
    PATCH: ["ADMIN", "ENGINEER"],
    DELETE: ["ADMIN"],
  },
};

export function canPerform(role: Role, resource: ApiResource, action: ApiAction): boolean {
  return API_PERMISSIONS[resource]?.[action]?.includes(role) ?? false;
}

/** Cookie (solo UI) con la que una ADMIN previsualiza el dashboard como otro rol. */
export const ROLE_PREVIEW_COOKIE = "dk_role_preview";
