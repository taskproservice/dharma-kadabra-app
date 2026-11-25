import { NextResponse } from "next/server";
import { getBlockedDatesForMonth, isValidMonthKey, parseAssigneeId } from "../../../lib/availability";

export const dynamic = "force-dynamic";

/**
 * Disponibilidad pública de la agenda: solo devuelve los horarios ocupados
 * por citas activas (PENDING/CONFIRMED) en los días del mes indicado.
 * No expone ningún dato personal: el frontend calcula qué slots quedan libres.
 *
 * Query: ?month=YYYY-MM[&assigneeId=<id>]
 * - `assigneeId` (FASE 1): limita el cálculo a las citas de ese terapeuta.
 *   Sin el parámetro (o con `assigneeId=all`) se restan las citas de toda la casa.
 * 200 → { month, assigneeId, blocked: [ISO strings] }
 * 400 → mes o terapeuta inválido | 503 → disponibilidad no disponible
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";
  const assigneeId = parseAssigneeId(searchParams.get("assigneeId"));

  if (!isValidMonthKey(month)) {
    return NextResponse.json({ error: "Parámetro 'month' inválido. Usa el formato YYYY-MM." }, { status: 400 });
  }
  if (assigneeId === undefined) {
    return NextResponse.json({ error: "Parámetro 'assigneeId' inválido." }, { status: 400 });
  }

  try {
    const blocked = await getBlockedDatesForMonth(month, assigneeId);
    return NextResponse.json({ month, assigneeId, blocked });
  } catch (error) {
    console.error("Error al consultar la disponibilidad:", error);
    return NextResponse.json(
      { error: "La disponibilidad no está disponible en este momento. Intenta de nuevo en unos minutos." },
      { status: 503 },
    );
  }
}
