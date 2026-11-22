import { NextResponse } from "next/server";
import { isValidMonthKey, getBlockedDatesForMonth } from "../../../lib/availability";

export const dynamic = "force-dynamic";

/**
 * Disponibilidad pública de la agenda: solo devuelve los horarios ocupados
 * por citas activas (PENDING/CONFIRMED) en los días del mes indicado.
 * No expone ningún dato personal: el frontend calcula qué slots quedan libres.
 *
 * Query: ?month=YYYY-MM
 * 200 → { month, blocked: [ISO strings] }
 * 400 → mes inválido | 503 → disponibilidad no disponible (base de datos caída)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";

  if (!isValidMonthKey(month)) {
    return NextResponse.json({ error: "Parámetro 'month' inválido. Usa el formato YYYY-MM." }, { status: 400 });
  }

  try {
    const blocked = await getBlockedDatesForMonth(month);
    return NextResponse.json({ month, blocked });
  } catch (error) {
    console.error("Error al consultar la disponibilidad:", error);
    return NextResponse.json(
      { error: "La disponibilidad no está disponible en este momento. Intenta de nuevo en unos minutos." },
      { status: 503 },
    );
  }
}
