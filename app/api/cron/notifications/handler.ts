import { NextResponse } from "next/server";
import { checkUpcomingAppointments } from "../../../../lib/notifications";
import { authorize, authorizeServiceOrRole } from "../../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Cron Job para Vercel (configurado en vercel.json).
 * Acepta `Authorization: Bearer $CRON_SECRET` (Vercel Cron) o una sesión ADMIN.
 * Sin CRON_SECRET configurado, el acceso anónimo queda bloqueado.
 */
export async function GET(request: Request) {
  const auth = await authorizeServiceOrRole(request, process.env.CRON_SECRET, "notifications", "GET");
  if (!auth.ok) return auth.response;

  try {
    const result = await checkUpcomingAppointments();
    return NextResponse.json({
      message: "Verificación de citas y recordatorios completada con éxito.",
      ...result,
    });
  } catch (error) {
    console.error("Error al procesar el cron job de notificaciones:", error);
    return NextResponse.json({ error: "Error interno al procesar los recordatorios de citas" }, { status: 500 });
  }
}

/**
 * Disparo manual de la verificación desde la Agenda del dashboard (ADMIN / ENGINEER).
 */
export async function POST() {
  const auth = await authorize("notifications", "POST");
  if (!auth.ok) return auth.response;

  try {
    const result = await checkUpcomingAppointments();
    return NextResponse.json({
      message: "Verificación manual de recordatorios ejecutada.",
      ...result,
    });
  } catch (error) {
    console.error("Error al procesar la verificación manual:", error);
    return NextResponse.json({ error: "Error al ejecutar verificación manual" }, { status: 500 });
  }
}
