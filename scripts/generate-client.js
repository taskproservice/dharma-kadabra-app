const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'generated', 'prisma');
fs.mkdirSync(targetDir, { recursive: true });

const content = `// Generated Prisma Client types for Dharma Kadabra
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
`;

fs.writeFileSync(path.join(targetDir, 'index.ts'), content, 'utf8');
fs.writeFileSync(path.join(targetDir, 'index.js'), `
const Role = {
  ADMIN: "ADMIN",
  ENGINEER: "ENGINEER",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
  COLLABORATOR: "COLLABORATOR",
  CLIENT: "CLIENT",
};

const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
};

class PrismaClient {
  constructor(options) {}
  async $connect() {}
  async $disconnect() {}
}

module.exports = {
  Role,
  AppointmentStatus,
  PrismaClient,
};
`, 'utf8');
fs.writeFileSync(path.join(targetDir, 'index.d.ts'), content, 'utf8');

console.log('✔ Generated client files in src/generated/prisma');
