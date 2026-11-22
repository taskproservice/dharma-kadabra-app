/**
 * Reserva atómica de horarios.
 *
 * Dos capas anti-colisión:
 * 1. `findSlotConflict` consulta la base de datos inmediatamente antes de
 *    escribir para rechazar rápido ese horario exacto, aunque la otra
 *    reserva se haya hecho hace unos segundos. Devuelve 409 en el flujo HTTP.
 * 2. `withSlotLock` mantiene la garantía autoritativa: la verificación y la
 *    escritura ocurren dentro de una transacción Prisma con aislamiento
 *    SERIALIZABLE. Si dos clientes reservan exactamente el mismo horario a la
 *    vez, PostgreSQL aborta una de las dos transacciones (error P2034) o la
 *    segunda ve la cita ya creada; en ambos casos se lanza
 *    `SlotUnavailableError` y la segunda reserva queda bloqueada.
 */
import { prisma } from "./prisma";

/** Estados que ocupan un horario. COMPLETED libera el espacio. */
export const SLOT_BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

export class SlotUnavailableError extends Error {
  constructor() {
    super("SLOT_UNAVAILABLE");
    this.name = "SlotUnavailableError";
  }
}

const TRANSACTION_OPTIONS = { isolationLevel: "Serializable", maxWait: 5_000, timeout: 10_000 } as const;

/** Prisma: P2034 = conflicto de escritura / deadlock en transacción serializable. */
function isSerializationFailure(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2034";
}

/**
 * Ventana de un minuto alrededor del instante solicitado: el "horario exacto"
 * se compara por minuto, ignorando segundos y milisegundos.
 */
function minuteWindow(date: Date) {
  const start = new Date(date);
  start.setSeconds(0, 0);
  const end = new Date(start.getTime() + 60 * 1000);
  return { gte: start, lt: end };
}

/**
 * Consulta rápida pre-escritura: ¿existe alguna cita bloqueando ese horario?
 * Devuelve la cita en conflicto (o null). No usa transacción: el guard
 * atómico es `withSlotLock`.
 */
export async function findSlotConflict(date: Date, excludeAppointmentId?: string | null) {
  return prisma.appointment.findFirst({
    where: {
      date: minuteWindow(date),
      status: { in: [...SLOT_BLOCKING_STATUSES] },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    select: { id: true },
  });
}

export async function withSlotLock<T>(date: Date, excludeAppointmentId: string | null, write: (tx: any) => Promise<T>): Promise<T> {
  try {
    return await prisma.$transaction(async (tx: any) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          date: minuteWindow(date),
          status: { in: [...SLOT_BLOCKING_STATUSES] },
          ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        },
        select: { id: true },
      });
      if (conflict) throw new SlotUnavailableError();
      return write(tx);
    }, TRANSACTION_OPTIONS);
  } catch (error) {
    if (isSerializationFailure(error)) throw new SlotUnavailableError();
    throw error;
  }
}
