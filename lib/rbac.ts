/**
 * Dharma Kadabra - Sistema de Control de Acceso Basado en Roles (RBAC)
 * Production-ready Role & Permission management.
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
    description: "Acceso a todo el sistema excepto pasarelas de pago y runas.",
    allowedHrefs: [
      "/dashboard",
      "/dashboard/resumen",
      "/dashboard/perfil",
      "/dashboard/pos",
      "/dashboard/ventas",
      "/dashboard/agenda",
      "/dashboard/audio",
      "/dashboard/video",
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
    // Ve todo, excepto Pasarela de Pagos y Runas
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
      const isForbidden =
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
    description: "Solo ve Resumen (Métricas), Audio/Video, y Redes Sociales.",
    // Solo ve Resumen (Métricas), Audio/Video, y un nuevo módulo "Redes Sociales" (donde pueda programar posts)
    allowedHrefs: [
      "/dashboard",
      "/dashboard/resumen",
      "/dashboard/audio",
      "/dashboard/video",
      "/dashboard/redes",
    ],
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
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
    role: "COLLABORATOR",
    label: "Colaboradora",
    badge: "Terapeuta / Guía",
    description: "Solo ve su propio Perfil, Agenda Electrónica (solo sus citas), y Audio.",
    // Solo ve su propio Perfil, Agenda Electrónica (solo sus citas), y Audio
    allowedHrefs: [
      "/dashboard",
      "/dashboard/perfil",
      "/dashboard/agenda",
      "/dashboard/audio",
    ],
    isAllowed: (path: string) => {
      const clean = path.split("?")[0].replace(/\/$/, "");
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
 * Normaliza y valida una cadena de texto como un Rol válido del sistema.
 */
export function normalizeRole(raw?: string | null): Role {
  if (!raw) return "ADMIN";
  const upper = raw.trim().toUpperCase();
  if (upper === "ENGINEER" || upper === "SOPORTE") return "ENGINEER";
  if (upper === "SOCIAL_MEDIA" || upper === "SOCIAL" || upper === "MARKETING") return "SOCIAL_MEDIA";
  if (upper === "COLLABORATOR" || upper === "COLABORADOR" || upper === "COLABORADORA") return "COLLABORATOR";
  if (upper === "CLIENT" || upper === "CLIENTE") return "CLIENT";
  if (upper === "ADMIN" || upper === "ADMINISTRADOR" || upper === "ADMINISTRADORA") return "ADMIN";
  return "ADMIN";
}

/**
 * Verifica si un rol tiene autorización para acceder a una ruta determinada.
 */
export function isRouteAllowedForRole(role: Role, path: string): boolean {
  const config = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.ADMIN;
  return config.isAllowed(path);
}
