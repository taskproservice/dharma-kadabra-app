import { NextResponse } from "next/server";
import { checkUpcomingAppointments } from "../../../../lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Cron Job para Vercel (ejecución horaria)
 * Configurado en vercel.json con schedule: "0 * * * *"
 */
export async function GET(request: Request) {
  try {
    // Verificación opcional de seguridad para Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await checkUpcomingAppointments();

    return NextResponse.json({
      message: "Verificación de citas y recordatorios completada con éxito.",
      ...result,
    });
  } catch (error) {
    console.error("Error al procesar el cron job de notificaciones:", error);
    return NextResponse.json(
      {
        error: "Error interno al procesar los recordatorios de citas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint POST para permitir disparar la verificación manualmente desde el Dashboard
 */
export async function POST(request: Request) {
  try {
    const result = await checkUpcomingAppointments();
    return NextResponse.json({
      message: "Verificación manual de recordatorios ejecutada.",
      ...result,
    });
  } catch (error) {
    console.error("Error al procesar la verificación manual:", error);
    return NextResponse.json(
      {
        error: "Error al ejecutar verificación manual",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
