import { PrismaClient } from '../src/generated/prisma';
import { products as catalogProducts } from "./data/products";
import { hashPassword } from "./password";
import type { Role } from "./rbac-config";

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

export type StaffUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Holistic Store · campos de administración comercial. */
  cost: number;
  profitMargin: number;
  currency: string;
  availability: string;
  published: boolean;
  stock: number;
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Inicialización real y directa. Si falla, Vercel mostrará el error exacto en los logs.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;