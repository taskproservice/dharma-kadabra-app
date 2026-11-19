"use server";

import { revalidatePath } from "next/cache";
import { prisma, type AppointmentRecord, type AppointmentStatus } from "../prisma";

export async function getAppointments(): Promise<AppointmentRecord[]> {
  try {
    return await prisma.appointment.findMany({
      orderBy: { date: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return [];
  }
}

export async function createAppointment(data: {
  clientName: string;
  clientPhone: string;
  date: string; // ISO string
  service: string;
  status?: AppointmentStatus;
  notes?: string;
}): Promise<AppointmentRecord> {
  const newAppointment = await prisma.appointment.create({
    data: {
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      date: new Date(data.date),
      service: data.service,
      status: data.status || "CONFIRMED",
      notificationsSent: [],
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/dashboard/agenda");
  return newAppointment;
}

export async function updateAppointment(
  id: string,
  data: Partial<{
    clientName: string;
    clientPhone: string;
    date: string | Date;
    service: string;
    status: AppointmentStatus;
    notificationsSent: string[];
    notes: string;
  }>
): Promise<AppointmentRecord> {
  const updatePayload: any = { ...data };
  if (data.date) {
    updatePayload.date = new Date(data.date);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: updatePayload,
  });

  revalidatePath("/dashboard/agenda");
  return updated;
}

export async function deleteAppointment(id: string): Promise<AppointmentRecord> {
  const deleted = await prisma.appointment.delete({
    where: { id },
  });

  revalidatePath("/dashboard/agenda");
  return deleted;
}
