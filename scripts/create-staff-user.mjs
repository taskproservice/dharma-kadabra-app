#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";
import { parseArgs } from "node:util";
import { PrismaClient } from "../src/generated/prisma/index.js";

const STAFF_ROLES = new Set(["ADMIN", "ENGINEER", "COLLABORATOR", "MARKETING"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function printHelp() {
  console.log(`Uso:
  STAFF_PASSWORD='<contraseña>' node scripts/create-staff-user.mjs --email <correo> --name <nombre> [--role ADMIN|ENGINEER|COLLABORATOR|MARKETING]
  node scripts/create-staff-user.mjs --email <correo> --deactivate

STAFF_PASSWORD se lee del entorno y no debe pasarse como argumento CLI.
La contraseña debe tener entre 12 y 128 caracteres.`);
}

function hashPassword(password) {
  // Debe coincidir con el formato scrypt `salt:digest` de lib/password.ts.
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      email: { type: "string", short: "e" },
      name: { type: "string", short: "n" },
      role: { type: "string", short: "r", default: "ADMIN" },
      deactivate: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: false,
    strict: true,
  });

  if (values.help) {
    printHelp();
    return;
  }

  const email = values.email?.trim().toLowerCase();
  if (!email || email.length > 180 || !EMAIL_PATTERN.test(email)) {
    throw new Error("Indica un correo válido con --email.");
  }

  if (values.deactivate) {
    if (values.name || values.role !== "ADMIN") {
      throw new Error("--deactivate no se combina con --name ni --role.");
    }

    const prisma = new PrismaClient();
    try {
      const result = await prisma.user.updateMany({
        where: { email },
        data: { active: false },
      });
      if (result.count === 0) {
        throw new Error(`No existe una cuenta de equipo con el correo ${email}.`);
      }
      console.log(`Cuenta desactivada: ${email}`);
    } finally {
      await prisma.$disconnect();
    }
    return;
  }

  const name = values.name?.trim();
  if (!name || name.length > 120) {
    throw new Error("Indica el nombre completo con --name (máximo 120 caracteres).");
  }

  const role = values.role.toUpperCase();
  if (!STAFF_ROLES.has(role)) {
    throw new Error(`Rol no permitido: ${role}. Usa uno de: ${[...STAFF_ROLES].join(", ")}.`);
  }

  const password = process.env.STAFF_PASSWORD;
  if (!password || password.length < 12 || password.length > 128) {
    throw new Error("Define STAFF_PASSWORD en el entorno (entre 12 y 128 caracteres); no la pases como argumento CLI.");
  }

  const passwordHash = hashPassword(password);
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role, active: true },
      create: { name, email, passwordHash, role, active: true },
    });

    console.log(`Usuario ${role} creado/actualizado: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
