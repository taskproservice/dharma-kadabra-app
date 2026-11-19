import AgendaClient, { type AppointmentItem } from "../../../components/dashboard/agenda-client";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const appointments = await prisma.appointment.findMany({ orderBy: { date: "asc" } });
  const initialAppointments: AppointmentItem[] = appointments.map((appointment: {
    id: string;
    clientName: string;
    clientPhone: string;
    date: Date;
    service: string;
    status: AppointmentItem["status"];
    notificationsSent: unknown;
  }) => ({
    id: appointment.id,
    clientName: appointment.clientName,
    clientPhone: appointment.clientPhone,
    date: appointment.date.toISOString(),
    service: appointment.service,
    status: appointment.status,
    notificationsSent: Array.isArray(appointment.notificationsSent)
      ? appointment.notificationsSent.filter((item): item is "7_DAYS" | "1_DAY" | "1_HOUR" => ["7_DAYS", "1_DAY", "1_HOUR"].includes(item))
      : [],
  }));

  return <AgendaClient initialAppointments={initialAppointments} />;
}
