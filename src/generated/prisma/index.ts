// Generated Prisma Client types for Dharma Kadabra
export enum Role {
  ADMIN = "ADMIN",
  ENGINEER = "ENGINEER",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  COLLABORATOR = "COLLABORATOR",
  CLIENT = "CLIENT",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  service: string;
  status: AppointmentStatus;
  notificationsSent: any;
  createdAt: Date;
  updatedAt: Date;
}

export class PrismaClient {
  appointment: any;
  [key: string]: any;
  constructor(options?: any) {}
  async $connect() {}
  async $disconnect() {}
}

export default {
  Role,
  AppointmentStatus,
  PrismaClient,
};
