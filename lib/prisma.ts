import { PrismaClient } from '../src/generated/prisma'

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  service: string;
  status: AppointmentStatus;
  notificationsSent: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Citas iniciales para desarrollo y previsualización editorial
const initialAppointmentsData: Appointment[] = [
  {
    id: "apt-1",
    clientName: "Mariana Silva",
    clientPhone: "+52 55 1234 5678",
    date: new Date("2026-11-18T10:00:00"),
    service: "Lectura Akáshica",
    status: "CONFIRMED",
    notificationsSent: ["7_DAYS", "1_DAY"],
    createdAt: new Date("2026-11-10T12:00:00"),
    updatedAt: new Date("2026-11-17T10:00:00"),
  },
  {
    id: "apt-2",
    clientName: "Sofía Montes",
    clientPhone: "+52 33 9876 5432",
    date: new Date("2026-11-18T14:00:00"),
    service: "Lectura Akáshica",
    status: "CONFIRMED",
    notificationsSent: ["7_DAYS"],
    createdAt: new Date("2026-11-11T15:00:00"),
    updatedAt: new Date("2026-11-11T15:00:00"),
  },
  {
    id: "apt-3",
    clientName: "Lucía Arango",
    clientPhone: "+52 81 5555 4321",
    date: new Date("2026-11-19T10:00:00"),
    service: "Sesión de Integración y Runas",
    status: "CONFIRMED",
    notificationsSent: [],
    createdAt: new Date("2026-11-12T09:00:00"),
    updatedAt: new Date("2026-11-12T09:00:00"),
  },
  {
    id: "apt-4",
    clientName: "Camila Navarro",
    clientPhone: "+52 55 8765 4321",
    date: new Date("2026-11-20T12:00:00"),
    service: "Registros Akáshicos",
    status: "PENDING",
    notificationsSent: [],
    createdAt: new Date("2026-11-13T18:00:00"),
    updatedAt: new Date("2026-11-13T18:00:00"),
  },
  {
    id: "apt-5",
    clientName: "Valeria Gómez",
    clientPhone: "+52 55 4433 2211",
    date: new Date("2026-11-25T16:00:00"),
    service: "Lectura de Runas Nórdicas",
    status: "CONFIRMED",
    notificationsSent: [],
    createdAt: new Date("2026-11-18T08:00:00"),
    updatedAt: new Date("2026-11-18T08:00:00"),
  },
];

class MemoryAppointmentDelegate {
  private items: Appointment[] = [...initialAppointmentsData];

  async findMany(args?: { where?: any; orderBy?: any }): Promise<Appointment[]> {
    let result = [...this.items];

    if (args?.where) {
      const { status, date } = args.where;
      if (status) {
        if (typeof status === "string") {
          result = result.filter((item) => item.status === status);
        } else if (status.in && Array.isArray(status.in)) {
          result = result.filter((item) => status.in.includes(item.status));
        }
      }
      if (date) {
        if (date.gte) {
          const gte = new Date(date.gte).getTime();
          result = result.filter((item) => new Date(item.date).getTime() >= gte);
        }
        if (date.lte) {
          const lte = new Date(date.lte).getTime();
          result = result.filter((item) => new Date(item.date).getTime() <= lte);
        }
      }
    }

    if (args?.orderBy?.date) {
      const dir = args.orderBy.date === "desc" ? -1 : 1;
      result.sort((a, b) => (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir);
    }

    return result;
  }

  async findUnique({ where }: { where: { id: string } }): Promise<Appointment | null> {
    return this.items.find((item) => item.id === where.id) || null;
  }

  async update({ where, data }: { where: { id: string }; data: any }): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id === where.id);
    if (index === -1) {
      throw new Error(`Cita no encontrada con ID: ${where.id}`);
    }
    const updated: Appointment = {
      ...this.items[index],
      ...data,
      notificationsSent: Array.isArray(data.notificationsSent)
        ? data.notificationsSent
        : typeof data.notificationsSent === "string"
        ? JSON.parse(data.notificationsSent)
        : this.items[index].notificationsSent,
      updatedAt: new Date(),
    };
    this.items[index] = updated;
    return updated;
  }

  async create({ data }: { data: any }): Promise<Appointment> {
    const newRecord: Appointment = {
      id: data.id || `apt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      date: new Date(data.date),
      service: data.service,
      status: data.status || "PENDING",
      notificationsSent: Array.isArray(data.notificationsSent)
        ? data.notificationsSent
        : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(newRecord);
    return newRecord;
  }

  async delete({ where }: { where: { id: string } }): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id === where.id);
    if (index === -1) {
      throw new Error(`Cita no encontrada con ID: ${where.id}`);
    }
    const [deleted] = this.items.splice(index, 1);
    return deleted;
  }
}

class SafePrismaClient {
  appointment = new MemoryAppointmentDelegate();
}

let prismaClientInstance: any = null;

try {
  if (process.env.DATABASE_URL) {
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    prismaClientInstance = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClientInstance;
    }
  }
} catch {
  prismaClientInstance = null;
}

export const prisma = prismaClientInstance || new SafePrismaClient();
