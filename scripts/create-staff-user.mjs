#!/usr/bin/env node
/**
 * Crea o actualiza una cuenta del equipo para el dashboard (NextAuth).
 *
 *   STAFF_PASSWORD='una-contraseña-larga' \
 *   node scripts/create-staff-user.mjs --email paola@dharmakadabra.com --name "Paola Hernández" --role ADMIN
 *
 * La contraseña se lee de STAFF_PASSWORD para que no quede en el historial
 * de la terminal. Requiere DATABASE_URL y el cliente de Prisma generado.
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";

const ROLES = ["ADMIN", "ENGINEER", "SOCIAL_MEDIA", "COLLABORATOR"];

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string", default: "COLLABORATOR" },
    deactivate: { type: "boolean", default: false },
  },
});

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const email = values.email?.trim().toLowerCase();
const role = values.role?.trim().toUpperCase();
const password = process.env.STAFF_PASSWORD;

if (!process.env.DATABASE_URL) fail("Configura DATABASE_URL.");
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail("Indica un --email válido.");
if (!ROLES.includes(role)) fail(`--role debe ser uno de: ${ROLES.join(", ")}.`);

const prisma = new PrismaClient();
try {
  if (values.deactivate) {
    await prisma.user.update({ where: { email }, data: { active: false } });
    console.log(`✔ Cuenta ${email} desactivada.`);
  } else {
    if (!values.name?.trim()) fail("Indica un --name.");
    if (!password || password.length < 12) fail("Define STAFF_PASSWORD con al menos 12 caracteres.");
    const salt = randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: values.name.trim(), role, passwordHash, active: true },
      create: { email, name: values.name.trim(), role, passwordHash },
    });
    console.log(`✔ Cuenta ${user.email} lista con rol ${user.role}.`);
  }
} finally {
  await prisma.$disconnect();
}
