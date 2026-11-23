/**
 * Modo Mantenimiento · Panel de Ingeniería.
 *
 * Indicador persistido en `SystemSetting` (clave `maintenance_mode`). Cuando
 * esta activa, la tienda pública muestra un aviso y el catálogo deja de
 * servirse. Se cachea unos segundos para no consultar la base en cada
 * petición; el panel siempre ve el estado más reciente tras cambiarlo.
 */
import { prisma } from "./prisma";

const KEY = "maintenance_mode";
const CACHE_TTL_MS = 5_000;

let cache: { value: boolean; at: number } | null = null;

export async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.value;
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: KEY } });
    const value = setting?.value === "true";
    cache = { value, at: now };
    return value;
  } catch {
    // Si la tabla aún no existe (primer deploy), la tienda permanece abierta.
    return false;
  }
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  const value = enabled ? "true" : "false";
  await prisma.systemSetting.upsert({
    where: { key: KEY },
    update: { value },
    create: { key: KEY, value },
  });
  cache = { value: enabled, at: Date.now() };
}
