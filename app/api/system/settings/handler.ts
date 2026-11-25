import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { isMaintenanceMode, setMaintenanceMode } from "../../../../lib/maintenance";
import { authorize } from "../../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Panel de Ingeniería · Salud del sistema y configuración operativa.
 * GET → estado de la base de datos, variables configuradas y modo mantenimiento.
 * PATCH → activa/desactiva el Modo Mantenimiento (oculta la tienda pública).
 */

function configured(value: string | undefined): boolean {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 && !trimmed.includes("usuario:contraseña@host") && !trimmed.includes("placeholder");
}

async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number; detail?: string }> {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - started, detail: "ok" };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function GET() {
  try {
    const auth = await authorize("system", "GET");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar la salud del sistema:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }

  const [database, maintenance] = await Promise.all([checkDatabase(), isMaintenanceMode().catch(() => false)]);

  return NextResponse.json({
    status: database.ok ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    nodeEnv: process.env.NODE_ENV ?? "development",
    database,
    maintenance,
    env: {
      DATABASE_URL: configured(process.env.DATABASE_URL),
      DATABASE_URL_UNPOOLED: configured(process.env.DATABASE_URL_UNPOOLED),
      AUTH_SECRET: Boolean((process.env.AUTH_SECRET ?? "").trim()),
      CRON_SECRET: Boolean((process.env.CRON_SECRET ?? "").trim()),
      RESEND_API_KEY: Boolean((process.env.RESEND_API_KEY ?? "").trim()),
      BLOB_READ_WRITE_TOKEN: Boolean((process.env.BLOB_READ_WRITE_TOKEN ?? "").trim()),
      NEXT_PUBLIC_APP_URL: configured(process.env.NEXT_PUBLIC_APP_URL),
      NEXT_PUBLIC_STORE_WHATSAPP: configured(process.env.NEXT_PUBLIC_STORE_WHATSAPP),
      OPENAI_API_KEY: Boolean((process.env.OPENAI_API_KEY ?? "").trim()),
    },
  });
}

const patchSchema = z.object({ maintenance: z.boolean() });

export async function PATCH(request: Request) {
  try {
    const auth = await authorize("system", "PATCH");
    if (!auth.ok) return auth.response;
  } catch (error) {
    console.error("Error al autorizar el modo mantenimiento:", error);
    return NextResponse.json({ error: "No fue posible verificar tu sesión. Inténtalo de nuevo." }, { status: 500 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pide el modo mantenimiento con un valor booleano." }, { status: 400 });
  }

  try {
    await setMaintenanceMode(parsed.data.maintenance);
    return NextResponse.json({ maintenance: parsed.data.maintenance });
  } catch (error) {
    console.error("Error al cambiar el modo mantenimiento:", error);
    return NextResponse.json({ error: "No fue posible guardar el modo mantenimiento." }, { status: 500 });
  }
}
