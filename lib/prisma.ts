import { PrismaClient } from "@prisma/client";
import { collaborators as initialCollaborators } from "./data/collaborators";
import { products as initialProducts } from "./data/products";

export type Role = "ADMIN" | "COLLABORATOR";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED";
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaboratorRecord {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  imageUrl: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  service: string;
  status: AppointmentStatus;
  notificationsSent: string[];
  notes?: string | null;
  collaboratorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  items: any;
  createdAt: Date;
  updatedAt: Date;
}

// Semilla inicial en memoria para desarrollo, pruebas y previsualizaciones
const seedUsers: UserRecord[] = [
  {
    id: "user-admin-1",
    name: "Paola Hernández",
    email: "paola@dharmakadabra.com",
    // Hash de 'dharma2026' con bcrypt
    password: "$2b$10$2pDpzBt2MXxqFFoo5or8LeE0FdaPePsxHzA4znSlddwHoF2RhZilm",
    role: "ADMIN",
    imageUrl: "/images/equipo/paola-hernandez.jpg",
    createdAt: new Date("2026-11-01T00:00:00Z"),
    updatedAt: new Date("2026-11-01T00:00:00Z"),
  },
  {
    id: "user-admin-2",
    name: "Administrador Dharma",
    email: "admin@dharmakadabra.com",
    password: "$2b$10$2pDpzBt2MXxqFFoo5or8LeE0FdaPePsxHzA4znSlddwHoF2RhZilm",
    role: "ADMIN",
    imageUrl: null,
    createdAt: new Date("2026-11-01T00:00:00Z"),
    updatedAt: new Date("2026-11-01T00:00:00Z"),
  },
];

const seedCollaborators: CollaboratorRecord[] = initialCollaborators.map((c) => ({
  id: c.id,
  name: c.name,
  role: "Colaboradora",
  specialty: c.specialty,
  bio: c.bio,
  imageUrl: c.photoUrl,
  email: c.email,
  phone: "+52 55 1234 5678",
  active: true,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  updatedAt: new Date("2026-11-01T00:00:00Z"),
}));

const seedProducts: ProductRecord[] = initialProducts.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  category: p.category,
  imageUrl: p.imageUrl,
  stock: 12,
  featured: true,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  updatedAt: new Date("2026-11-01T00:00:00Z"),
}));

const seedAppointments: AppointmentRecord[] = [
  {
    id: "apt-1",
    clientName: "Mariana Silva",
    clientPhone: "+52 55 1234 5678",
    date: new Date("2026-11-18T10:00:00"),
    service: "Lectura Akáshica",
    status: "CONFIRMED",
    notificationsSent: ["7_DAYS", "1_DAY"],
    notes: "Primera lectura akáshica, enfoque en propósito y vínculos.",
    collaboratorId: "lucia-moreno",
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
    notificationsSent: ["7_DAYS", "1_DAY", "1_HOUR"],
    notes: "Seguimiento de sesión previa y preguntas específicas.",
    collaboratorId: "lucia-moreno",
    createdAt: new Date("2026-11-11T15:00:00"),
    updatedAt: new Date("2026-11-11T15:00:00"),
  },
  {
    id: "apt-3",
    clientName: "Lucía Arango",
    clientPhone: "+52 81 5555 4321",
    date: new Date("2026-11-18T17:00:00"),
    service: "Sesión de Integración y Runas",
    status: "PENDING",
    notificationsSent: ["7_DAYS"],
    notes: "Tirada completa con runas nórdicas e integración energética.",
    collaboratorId: "mateo-sanchez",
    createdAt: new Date("2026-11-12T09:00:00"),
    updatedAt: new Date("2026-11-12T09:00:00"),
  },
  {
    id: "apt-4",
    clientName: "Camila Navarro",
    clientPhone: "+52 55 8765 4321",
    date: new Date("2026-11-19T11:00:00"),
    service: "Registros Akáshicos",
    status: "CONFIRMED",
    notificationsSent: ["7_DAYS"],
    notes: "Consulta sobre linaje y cierre de ciclos.",
    collaboratorId: "isabel-vega",
    createdAt: new Date("2026-11-13T18:00:00"),
    updatedAt: new Date("2026-11-13T18:00:00"),
  },
];

class MemoryTable<T extends { id: string }> {
  constructor(protected items: T[]) {}

  async findMany(args?: { where?: any; orderBy?: any }): Promise<T[]> {
    let result = [...this.items];
    if (args?.where) {
      for (const [key, val] of Object.entries(args.where)) {
        if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
          const operator = val as any;
          if (operator.in && Array.isArray(operator.in)) {
            result = result.filter((item: any) => operator.in.includes(item[key]));
          }
          if (operator.gte) {
            const gte = new Date(operator.gte).getTime();
            result = result.filter((item: any) => new Date(item[key]).getTime() >= gte);
          }
          if (operator.lte) {
            const lte = new Date(operator.lte).getTime();
            result = result.filter((item: any) => new Date(item[key]).getTime() <= lte);
          }
        } else {
          result = result.filter((item: any) => item[key] === val);
        }
      }
    }
    if (args?.orderBy) {
      for (const [key, dir] of Object.entries(args.orderBy)) {
        const factor = dir === "desc" ? -1 : 1;
        result.sort((a: any, b: any) => {
          if (a[key] instanceof Date || typeof a[key] === "string" && !isNaN(Date.parse(a[key]))) {
            return (new Date(a[key]).getTime() - new Date(b[key]).getTime()) * factor;
          }
          return (a[key] > b[key] ? 1 : -1) * factor;
        });
      }
    }
    return result;
  }

  async findUnique({ where }: { where: any }): Promise<T | null> {
    return (
      this.items.find((item: any) => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      }) || null
    );
  }

  async findFirst(args?: { where?: any }): Promise<T | null> {
    const list = await this.findMany(args);
    return list[0] || null;
  }

  async create({ data }: { data: any }): Promise<T> {
    const newRecord: any = {
      id: data.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    this.items.push(newRecord);
    return newRecord;
  }

  async update({ where, data }: { where: any; data: any }): Promise<T> {
    const index = this.items.findIndex((item: any) => {
      return Object.entries(where).every(([k, v]) => item[k] === v);
    });
    if (index === -1) {
      throw new Error(`Registro no encontrado: ${JSON.stringify(where)}`);
    }
    const updated: any = {
      ...this.items[index],
      ...data,
      updatedAt: new Date(),
    };
    this.items[index] = updated;
    return updated;
  }

  async upsert({ where, create, update }: { where: any; create: any; update: any }): Promise<T> {
    const existing = await this.findUnique({ where });
    if (existing) {
      return this.update({ where, data: update });
    }
    return this.create({ data: create });
  }

  async delete({ where }: { where: any }): Promise<T> {
    const index = this.items.findIndex((item: any) => {
      return Object.entries(where).every(([k, v]) => item[k] === v);
    });
    if (index === -1) {
      throw new Error(`Registro no encontrado para eliminar: ${JSON.stringify(where)}`);
    }
    const [deleted] = this.items.splice(index, 1);
    return deleted;
  }
}

class SafeDatabaseDelegate {
  user = new MemoryTable<UserRecord>([...seedUsers]);
  collaborator = new MemoryTable<CollaboratorRecord>([...seedCollaborators]);
  product = new MemoryTable<ProductRecord>([...seedProducts]);
  appointment = new MemoryTable<AppointmentRecord>([...seedAppointments]);
  order = new MemoryTable<OrderRecord>([]);
}

// Instancia singleton de Prisma con fallback robusto
let prismaInstance: any = null;

try {
  // Solo se conecta si DATABASE_URL no es una plantilla ni localhost sin servidor
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("[TU-PASSWORD]") &&
    !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]")
  ) {
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }
} catch {
  prismaInstance = null;
}

export const prisma = prismaInstance || new SafeDatabaseDelegate();
export type Appointment = AppointmentRecord;
