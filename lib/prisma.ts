import { PrismaClient } from '../src/generated/prisma';
import { products as catalogProducts } from "./data/products";
import { hashPassword } from "./password";
import type { Role } from "./rbac-config";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED";
/** Modalidad de la cita: estudio presencial o videollamada (Zoom/Meet). */
export type AppointmentModality = "IN_PERSON" | "VIDEO_CALL";

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  service: string;
  modality: AppointmentModality;
  status: AppointmentStatus;
  depositPaid: boolean;
  notificationsSent: string[];
  customerId?: string | null;
  /** Colaborador responsable de la sesión. */
  assigneeId?: string | null;
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
  /** Botón de visibilidad: si es false, la pieza no aparece en la tienda. */
  isVisible: boolean;
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

/**
 * Crea el cliente de Prisma sin tumbar el proceso si la inicialización falla
 * (por ejemplo, DATABASE_URL ausente en el entorno). En ese caso devolvemos
 * un proxy perezoso que lanza el error original al usarse: como las consultas
 * del catálogo van envueltas en try/catch, la tienda pública cae al catálogo
 * de respaldo en lugar de romper el render completo de la página.
 */
function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient();
  } catch (error) {
    console.error('[prisma] No se pudo inicializar PrismaClient:', error);
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        throw error;
      },
    });
  }
}

// Inicialización directa. Si falla, usamos el proxy perezoso (ver arriba).
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;