import { redirect } from "next/navigation";
import AgendaClient, { type AppointmentItem, type CollaboratorOption } from "../../../components/dashboard/agenda-client";
import { prisma } from "../../../lib/prisma";
import { getStaffPrincipal } from "../../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Panel Colaboradores · /dashboard/agenda
 * - COLLABORATOR: solo ve SUS citas (assigneeId = su usuario) y administra su
 *   parrilla semanal de disponibilidad desde el mismo panel.
 * - ADMIN / ENGINEER: ven todas las citas y pueden asignar responsable.
 */
export default async function AgendaPage() {
  const staff = await getStaffPrincipal();
  if (!staff) redirect("/login?callbackUrl=/dashboard/agenda");

  // Sin base de datos o con error de conexión: agenda vacía en lugar de fallar.
  let appointments: Awaited<ReturnType<typeof prisma.appointment.findMany>> = [];
  let collaborators: { id: string; name: string }[] = [];
  try {
    const where = staff.role === "COLLABORATOR" ? { assigneeId: staff.id } : {};
    [appointments, collaborators] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { date: "asc" },
        include: { assignee: { select: { id: true, name: true } } },
      }),
      staff.role === "COLLABORATOR"
        ? []
        : prisma.user.findMany({
            where: { role: "COLLABORATOR", active: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
          }),
    ]);
  } catch {
    appointments = [];
    collaborators = [];
  }

  const initialAppointments: AppointmentItem[] = appointments.map((appointment: {
    id: string;
    clientName: string;
    clientPhone: string;
    date: Date;
    service: string;
    modality: "IN_PERSON" | "VIDEO_CALL";
    status: AppointmentItem["status"];
    notificationsSent: unknown;
    assignee?: { id: string; name: string } | null;
  }) => ({
    id: appointment.id,
    clientName: appointment.clientName,
    clientPhone: appointment.clientPhone,
    date: appointment.date.toISOString(),
    service: appointment.service,
    modality: appointment.modality,
    status: appointment.status,
    notificationsSent: Array.isArray(appointment.notificationsSent)
      ? appointment.notificationsSent.filter((item): item is "7_DAYS" | "1_DAY" | "1_HOUR" => ["7_DAYS", "1_DAY", "1_HOUR"].includes(item))
      : [],
    assigneeId: appointment.assignee?.id ?? null,
    assigneeName: appointment.assignee?.name ?? null,
  }));

  const collaboratorOptions: CollaboratorOption[] = collaborators;

  return (
    <AgendaClient
      initialAppointments={initialAppointments}
      viewerRole={staff.role}
      viewerId={staff.id}
      collaborators={collaboratorOptions}
    />
  );
}
