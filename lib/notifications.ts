import { prisma, type Appointment } from "./prisma";

export type NotificationType = "7_DAYS" | "1_DAY" | "1_HOUR";

export interface SimulatedNotification {
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  appointmentDate: string;
  notificationType: NotificationType;
  reminderLabel: string;
  message: string;
  sentAt: string;
}

export interface CheckAppointmentsResult {
  success: boolean;
  checkedAt: string;
  totalAppointmentsEvaluated: number;
  notificationsSentCount: number;
  notifications: SimulatedNotification[];
}

/**
 * Motor de notificaciones automatizadas para citas en Dharma Kadabra.
 * Evalúa las citas programadas para los próximos 7 días, 1 día y 1 hora,
 * verifica que no hayan sido enviadas previamente y simula el envío vía WhatsApp.
 */
export async function checkUpcomingAppointments(referenceDate = new Date()): Promise<CheckAppointmentsResult> {
  const now = referenceDate;
  // Ventana máxima de búsqueda: desde ahora hasta 7 días + 2 horas de margen
  const maxWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

  // 1. Buscar en la base de datos las citas próximas en estado CONFIRMED o PENDING
  const appointments: Appointment[] = await prisma.appointment.findMany({
    where: {
      status: { in: ["CONFIRMED", "PENDING"] },
      date: {
        gte: new Date(now.getTime() - 15 * 60 * 1000), // Incluye citas que comienzan en los próximos minutos
        lte: maxWindow,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  const notificationsGenerated: SimulatedNotification[] = [];

  for (const appointment of appointments) {
    const aptDate = new Date(appointment.date);
    const diffMs = aptDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Asegurarse de que notificationsSent sea un arreglo de strings
    let sentList: string[] = [];
    if (Array.isArray(appointment.notificationsSent)) {
      sentList = [...appointment.notificationsSent];
    } else if (typeof appointment.notificationsSent === "string") {
      try {
        sentList = JSON.parse(appointment.notificationsSent);
      } catch {
        sentList = [];
      }
    }

    const pendingTypes: { type: NotificationType; label: string; text: string }[] = [];

    // Formateadores de fecha en español
    const dateFormatted = new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(aptDate);

    const timeFormatted = new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(aptDate);

    // A. Recordatorio 1 semana antes (entre 24h y 168h / 7 días)
    if (diffHours <= 168 && diffHours > 24) {
      if (!sentList.includes("7_DAYS")) {
        pendingTypes.push({
          type: "7_DAYS",
          label: "1 semana antes",
          text: `Hola ${appointment.clientName}, tu sesión de ${appointment.service} en Dharma Kadabra está programada para el ${dateFormatted}. Respira profundo y prepara tus intenciones. ✧`,
        });
      }
    }

    // B. Recordatorio 1 día antes (entre 1h y 24h)
    if (diffHours <= 24 && diffHours > 1) {
      if (!sentList.includes("1_DAY")) {
        pendingTypes.push({
          type: "1_DAY",
          label: "1 día antes",
          text: `Hola ${appointment.clientName}, te recordamos que mañana a las ${timeFormatted} tenemos tu sesión de ${appointment.service}. ¡Te esperamos con la calidez de Dharma Kadabra! ✧`,
        });
      }
    }

    // C. Recordatorio 1 hora antes (<= 1h y aún no pasada por más de 15 min)
    if (diffHours <= 1.0 && diffHours >= -0.25) {
      if (!sentList.includes("1_HOUR")) {
        pendingTypes.push({
          type: "1_HOUR",
          label: "1 hora antes",
          text: `Hola ${appointment.clientName}, tu sesión de ${appointment.service} comienza en 1 hora (${timeFormatted}). Prepara tu espacio de paz para conectar. 🔥`,
        });
      }
    }

    if (pendingTypes.length > 0) {
      for (const item of pendingTypes) {
        // 2 & 3. Simulación del envío de WhatsApp por consola
        console.log(
          `Simulando envío de WhatsApp a: ${appointment.clientPhone} (${appointment.clientName}) - [${item.label}] ${item.text}`
        );

        sentList.push(item.type);

        notificationsGenerated.push({
          appointmentId: appointment.id,
          clientName: appointment.clientName,
          clientPhone: appointment.clientPhone,
          service: appointment.service,
          appointmentDate: aptDate.toISOString(),
          notificationType: item.type,
          reminderLabel: item.label,
          message: item.text,
          sentAt: now.toISOString(),
        });
      }

      // Actualizar la cita en base de datos con las notificaciones enviadas
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          notificationsSent: sentList,
        },
      });
    }
  }

  return {
    success: true,
    checkedAt: now.toISOString(),
    totalAppointmentsEvaluated: appointments.length,
    notificationsSentCount: notificationsGenerated.length,
    notifications: notificationsGenerated,
  };
}

/**
 * Obtener todas las citas para el panel editorial
 */
export async function getAllAppointments(): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    orderBy: { date: "asc" },
  });
}
