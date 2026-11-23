/**
 * Reserva atómica de horarios.
 *
 * FASE 1 · Agenda por terapeuta: el conflicto se evalúa SIEMPRE dentro de la
 * agenda del colaborador seleccionado (`assigneeId`). Dos terapeutas pueden
 * tener sesión a la misma hora; una misma persona no puede tener dos.
 *
 * Tres capas anti-colisión:
 * 1. `findSlotConflict` consulta la base de datos inmediatamente antes de
 *    escribir para rechazar rápido ese horario exacto, aunque la otra
 *    reserva se haya hecho hace unos segundos. Devuelve 409 en el flujo HTTP.
 * 2. `withSlotLock` mantiene la garantía autoritativa: la verificación y la
 *    escritura ocurren dentro de una transacción Prisma con aislamiento
 *    SERIALIZABLE. Si dos clientes reservan exactamente el mismo horario con
 *    el mismo terapeuta a la vez, PostgreSQL aborta una de las dos
 *    transacciones (error P2034) o la segunda ve la cita ya creada; en ambos
 *    casos se lanza `SlotUnavailableError` y la segunda reserva queda bloqueada.
 * 3. Dentro de la transacción se toma un advisory lock de PostgreSQL por
 *    agenda (`assigneeId`), de modo que las reservas del mismo terapeuta se
 *    serializan en la base de datos y las de terapeutas distintos no se
 *    estorban entre sí.
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

export type SlotScope = {
  /**
   * Agenda que se evalúa: solo las citas de este colaborador.
   * `null`/`undefined` = disponibilidad de toda la casa (sin responsable).
   */
  assigneeId?: string | null;
  /** Cita que se está reagendando: no compite consigo misma. */
  excludeAppointmentId?: string | null;
};

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
 * Fila de `Appointment` que ocupa horario. Con `assigneeId` solo cuentan las
 * citas de esa persona; sin él, las de toda la casa.
 */
export function slotBlockingWhere(assigneeId?: string | null) {
  return {
    status: { in: [...SLOT_BLOCKING_STATUSES] },
    ...(assigneeId ? { assigneeId } : {}),
  };
}

function slotConflictWhere(date: Date, { assigneeId, excludeAppointmentId }: SlotScope) {
  return {
    date: minuteWindow(date),
    ...slotBlockingWhere(assigneeId),
    ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
  };
}

/** Clave del advisory lock de una agenda (la casa completa usa la raíz). */
export const HOUSE_SLOT_LOCK = "agenda-house";

async function acquireAgendaLock(tx: any, assigneeId?: string | null) {
  // Las reservas de un terapeuta esperan a las de ese terapeuta; las de la
  // casa completa (sin responsable) excluyen a todas. El orden (compartido y
  // luego exclusivo) evita deadlocks entre scopes.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock_shared(hashtext(${HOUSE_SLOT_LOCK})::bigint)`;
  if (assigneeId) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`agenda:${assigneeId}`})::bigint)`;
  } else {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${HOUSE_SLOT_LOCK})::bigint)`;
  }
}

/**
 * Consulta rápida pre-escritura: ¿existe alguna cita bloqueando ese horario
 * en la agenda del colaborador indicado? Devuelve la cita en conflicto (o
 * null). No usa transacción: el guard atómico es `withSlotLock`.
 */
export async function findSlotConflict(date: Date, scope: SlotScope = {}) {
  return prisma.appointment.findFirst({
    where: slotConflictWhere(date, scope),
    select: { id: true },
  });
}

export async function withSlotLock<T>(
  date: Date,
  scope: SlotScope,
  write: (tx: any) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx: any) => {
      await acquireAgendaLock(tx, scope.assigneeId);

      const conflict = await tx.appointment.findFirst({
        where: slotConflictWhere(date, scope),
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
