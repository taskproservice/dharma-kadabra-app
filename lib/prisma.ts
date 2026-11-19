import { PrismaClient } from "@prisma/client";
import { products as catalogProducts } from "./data/products";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  service: string;
  status: AppointmentStatus;
  depositPaid: boolean;
  notificationsSent: string[];
  customerId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SpecialEventRecord = {
  id: string;
  title: string;
  description: string;
  date: Date;
  products: ProductRecord[];
  createdAt: Date;
  updatedAt: Date;
};

const now = new Date();
const initialAppointmentsData: Appointment[] = [
  { id: "apt-1", clientName: "Mariana Silva", clientEmail: "mariana@example.com", clientPhone: "+52 55 1234 5678", date: new Date("2026-11-18T10:00:00"), service: "Lectura Akáshica", status: "CONFIRMED", depositPaid: true, notificationsSent: ["7_DAYS", "1_DAY"] },
  { id: "apt-2", clientName: "Sofía Montes", clientEmail: "sofia@example.com", clientPhone: "+52 33 9876 5432", date: new Date("2026-11-18T14:00:00"), service: "Lectura Akáshica", status: "CONFIRMED", depositPaid: true, notificationsSent: ["7_DAYS"] },
  { id: "apt-3", clientName: "Lucía Arango", clientEmail: "lucia@example.com", clientPhone: "+52 81 5555 4321", date: new Date("2026-11-19T10:00:00"), service: "Sesión de Integración y Runas", status: "CONFIRMED", depositPaid: true, notificationsSent: [] },
  { id: "apt-4", clientName: "Camila Navarro", clientEmail: "camila@example.com", clientPhone: "+52 55 8765 4321", date: new Date("2026-11-20T12:00:00"), service: "Registros Akáshicos", status: "PENDING", depositPaid: false, notificationsSent: [] },
  { id: "apt-5", clientName: "Valeria Gómez", clientEmail: "valeria@example.com", clientPhone: "+52 55 4433 2211", date: new Date("2026-11-25T16:00:00"), service: "Lectura de Runas Nórdicas", status: "CONFIRMED", depositPaid: true, notificationsSent: [] },
];

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const cloneProduct = (product: ProductRecord): ProductRecord => ({ ...product });

class MemoryPrismaClient {
  private appointments = [...initialAppointmentsData];
  private customers: CustomerRecord[] = [];
  private catalog = catalogProducts.map((product) => ({ ...product, createdAt: now, updatedAt: now }));
  private events: SpecialEventRecord[] = [
    {
      id: "ritual-luna-llena",
      title: "Luna Llena · Limpieza de Talismanes",
      description: "Un encuentro para renovar la intención de tus piezas y cerrar el ciclo con claridad.",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      products: [this.catalog[0], this.catalog[4]],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ritual-circulo-lunar",
      title: "Círculo Lunar · Intención y Calma",
      description: "Práctica guiada de presencia, escritura y ritual para recibir el nuevo ciclo.",
      date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      products: [this.catalog[1], this.catalog[3]],
      createdAt: now,
      updatedAt: now,
    },
  ];
  private purchases: Array<{ id: string; customerId: string; productId: string | null; title: string; purchasedAt: Date }> = [];
  private audioPurchases: Array<{ id: string; customerId: string; title: string; audioUrl: string | null; purchasedAt: Date }> = [];

  appointment = {
    findMany: async (args?: any): Promise<Appointment[]> => {
      let result = [...this.appointments];
      const where = args?.where;
      if (where?.status) result = result.filter((item) => typeof where.status === "string" ? item.status === where.status : where.status.in?.includes(item.status));
      if (where?.clientEmail) result = result.filter((item) => item.clientEmail.toLowerCase() === String(where.clientEmail).toLowerCase());
      if (where?.customerId) result = result.filter((item) => item.customerId === where.customerId);
      if (where?.date?.gte) result = result.filter((item) => item.date >= new Date(where.date.gte));
      if (where?.date?.lte) result = result.filter((item) => item.date <= new Date(where.date.lte));
      if (args?.orderBy?.date) result.sort((a, b) => (a.date.getTime() - b.date.getTime()) * (args.orderBy.date === "desc" ? -1 : 1));
      return result;
    },
    findUnique: async ({ where }: any): Promise<Appointment | null> => this.appointments.find((item) => item.id === where.id) ?? null,
    create: async ({ data }: any): Promise<Appointment> => {
      const created: Appointment = {
        id: data.id ?? id("apt"),
        clientName: data.clientName,
        clientEmail: data.clientEmail ?? "",
        clientPhone: data.clientPhone,
        date: new Date(data.date),
        service: data.service,
        status: data.status ?? "PENDING",
        depositPaid: data.depositPaid ?? false,
        notificationsSent: Array.isArray(data.notificationsSent) ? data.notificationsSent : [],
        customerId: data.customerId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.appointments.push(created);
      return created;
    },
    update: async ({ where, data }: any): Promise<Appointment> => {
      const index = this.appointments.findIndex((item) => item.id === where.id);
      if (index < 0) throw new Error(`Cita no encontrada con ID: ${where.id}`);
      const updated = { ...this.appointments[index], ...data, date: data.date ? new Date(data.date) : this.appointments[index].date, updatedAt: new Date() };
      this.appointments[index] = updated;
      return updated;
    },
    delete: async ({ where }: any): Promise<Appointment> => {
      const index = this.appointments.findIndex((item) => item.id === where.id);
      if (index < 0) throw new Error(`Cita no encontrada con ID: ${where.id}`);
      return this.appointments.splice(index, 1)[0];
    },
  };

  customer = {
    findUnique: async ({ where }: any): Promise<CustomerRecord | null> => {
      const customer = where.email ? this.customers.find((item) => item.email === String(where.email).toLowerCase()) : this.customers.find((item) => item.id === where.id);
      return customer ?? null;
    },
    findMany: async (): Promise<CustomerRecord[]> => [...this.customers],
    create: async ({ data }: any): Promise<CustomerRecord> => {
      if (this.customers.some((item) => item.email === String(data.email).toLowerCase())) throw new Error("EMAIL_TAKEN");
      const customer = { id: id("customer"), name: data.name, email: String(data.email).toLowerCase(), phone: data.phone ?? null, passwordHash: data.passwordHash, createdAt: now, updatedAt: now };
      this.customers.push(customer);
      return customer;
    },
  };

  product = {
    findMany: async (): Promise<ProductRecord[]> => this.catalog.map(cloneProduct),
    findUnique: async ({ where }: any): Promise<ProductRecord | null> => this.catalog.find((product) => product.id === where.id) ?? null,
    upsert: async ({ where, create, update }: any): Promise<ProductRecord> => {
      const found = this.catalog.findIndex((product) => product.id === where.id);
      if (found >= 0) this.catalog[found] = { ...this.catalog[found], ...update, updatedAt: new Date() };
      else this.catalog.push({ ...create, createdAt: new Date(), updatedAt: new Date() });
      return this.catalog.find((product) => product.id === where.id)!;
    },
  };

  specialEvent = {
    findMany: async (args?: any): Promise<SpecialEventRecord[]> => {
      let events = [...this.events];
      if (args?.where?.date?.gte) events = events.filter((event) => event.date >= new Date(args.where.date.gte));
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      if (args?.take) events = events.slice(0, args.take);
      return events;
    },
    findUnique: async ({ where }: any): Promise<SpecialEventRecord | null> => this.events.find((event) => event.id === where.id) ?? null,
    create: async ({ data }: any): Promise<SpecialEventRecord> => {
      const connectedIds: string[] = data.products?.connect?.map((product: { id: string }) => product.id) ?? [];
      const event: SpecialEventRecord = {
        id: id("ritual"), title: data.title, description: data.description, date: new Date(data.date),
        products: this.catalog.filter((product) => connectedIds.includes(product.id)).map(cloneProduct), createdAt: new Date(), updatedAt: new Date(),
      };
      this.events.push(event);
      return event;
    },
    update: async ({ where, data }: any): Promise<SpecialEventRecord> => {
      const index = this.events.findIndex((event) => event.id === where.id);
      if (index < 0) throw new Error("EVENT_NOT_FOUND");
      const connectedIds: string[] | undefined = data.products?.set?.map((product: { id: string }) => product.id);
      this.events[index] = {
        ...this.events[index], ...data, date: data.date ? new Date(data.date) : this.events[index].date,
        products: connectedIds ? this.catalog.filter((product) => connectedIds.includes(product.id)).map(cloneProduct) : this.events[index].products,
        updatedAt: new Date(),
      };
      return this.events[index];
    },
    delete: async ({ where }: any): Promise<SpecialEventRecord> => {
      const index = this.events.findIndex((event) => event.id === where.id);
      if (index < 0) throw new Error("EVENT_NOT_FOUND");
      return this.events.splice(index, 1)[0];
    },
  };

  purchase = {
    findMany: async ({ where }: any): Promise<any[]> => this.purchases.filter((purchase) => purchase.customerId === where.customerId).map((purchase) => ({ ...purchase, product: this.catalog.find((product) => product.id === purchase.productId) ?? null })),
  };
  audioPurchase = {
    findMany: async ({ where }: any): Promise<any[]> => this.audioPurchases.filter((purchase) => purchase.customerId === where.customerId),
  };
}

let prismaClientInstance: any = null;
try {
  if (process.env.DATABASE_URL) {
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    prismaClientInstance = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClientInstance;
  }
} catch {
  prismaClientInstance = null;
}

export const prisma: any = prismaClientInstance || new MemoryPrismaClient();
