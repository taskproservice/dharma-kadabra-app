/**
 * Reserva atómica de horarios.
 *
 * La verificación de disponibilidad y la escritura se ejecutan dentro de una
 * transacción Prisma con aislamiento SERIALIZABLE. Si dos clientes reservan
 * exactamente el mismo horario a la vez, PostgreSQL aborta una de las dos
 * transacciones (error P2034) o la segunda ve la cita ya creada; en ambos
 * casos se lanza `SlotUnavailableError` y la segunda reserva queda bloqueada.
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

export async function withSlotLock<T>(date: Date, excludeAppointmentId: string | null, write: (tx: any) => Promise<T>): Promise<T> {
  try {
    return await prisma.$transaction(async (tx: any) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          date,
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
