#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { chmod, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";

const ROOT = process.cwd();
const EXPECTED_URLS = {
  production: "https://dharmakadabra.com",
  staging: "https://staging.dharmakadabra.com",
};
const REQUIRED_TABLES = [
  "Appointment",
  "AudioPurchase",
  "Customer",
  "Product",
  "ProductView",
  "Purchase",
  "SpecialEvent",
  "StoreCategoryStyle",
  "StoreVisit",
  "SystemSetting",
  "TourVideo",
  "User",
  "_EventProducts",
];

function printHelp() {
  console.log(`Verifica configuración local de Vercel y PostgreSQL sin cambiar la base.

Uso:
  npm run config:verify
  npm run config:verify -- --environment=staging
  npm run config:verify -- --no-pull
  npm run config:verify -- --schema-details

Opciones:
  --environment=production|staging  Entorno a verificar (por defecto: production).
  --no-pull                         No descargues variables de Vercel; usa el archivo local existente.
  --schema-details                  Imprime nombres de tablas y columnas, nunca filas de datos.
  --help                            Muestra esta ayuda.

El script solo consulta variables, estado de migraciones y metadatos de PostgreSQL.
No aplica migraciones ni ejecuta db push.`);
}

function run(command, args, options = {}) {
  const isWindowsCommand = process.platform === "win32" && command.endsWith(".cmd");
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: isWindowsCommand,
    ...options,
  });
}

function redact(text, env) {
  let result = String(text ?? "");
  for (const key of [
    "DATABASE_URL",
    "DATABASE_URL_UNPOOLED",
    "AUTH_SECRET",
    "NEXTAUTH_SECRET",
    "CRON_SECRET",
    "OPENAI_API_KEY",
    "DEEPSEEK_API_KEY",
    "RESEND_API_KEY",
    "AI_API_KEY",
  ]) {
    const secret = env[key];
    if (secret) result = result.split(secret).join("[REDACTADO]");
  }
  return result
    .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[URL POSTGRES REDACTADA]")
    .replace(/^Datasource .*$/gm, "Datasource: [detalles de conexión ocultos]");
}

function isSensitivePlaceholder(value) {
  return /^\[(?:SENSITIVE|REDACTED|MASKED|HIDDEN)\]$/i.test(String(value ?? "").trim());
}

function hasUsableValue(value) {
  return Boolean(String(value ?? "").trim()) && !isSensitivePlaceholder(value);
}

function isPostgresUrl(value) {
  if (!hasUsableValue(value)) return false;
  try {
    const parsed = new URL(value);
    return ["postgres:", "postgresql:"].includes(parsed.protocol) && Boolean(parsed.hostname) && parsed.pathname.length > 1;
  } catch {
    return false;
  }
}

function reportVariable(label, value, { required = false, valid = true, note = "" } = {}) {
  const isSet = Boolean(String(value ?? "").trim());
  const isMasked = isSensitivePlaceholder(value);
  const status = isMasked
    ? "OCULTA"
    : !isSet
      ? required ? "FALTA" : "no configurada (opcional)"
      : valid ? "OK" : "REVISAR";
  const effectiveNote = isMasked
    ? "Vercel ocultó el valor; se necesita un valor real para verificarlo localmente"
    : note;
  console.log(`  ${label}: ${status}${effectiveNote ? ` — ${effectiveNote}` : ""}`);
  return required && (!isSet || isMasked || !valid);
}

async function ensureEnvFile(environment, fileName, noPull) {
  const ignored = run("git", ["check-ignore", "-q", fileName]);
  if (ignored.status !== 0) {
    throw new Error(`${fileName} no está excluido por .gitignore; se cancela para no guardar secretos en Git.`);
  }

  const envPath = resolve(ROOT, fileName);
  if (!existsSync(envPath)) {
    if (noPull) {
      throw new Error(`No existe ${fileName}; quita --no-pull o créalo localmente antes de verificar.`);
    }

    const target = environment === "production" ? "production" : "preview";
    const args = ["--yes", "vercel", "env", "pull", fileName, `--environment=${target}`];
    if (environment === "staging") args.push("--git-branch=staging");

    console.log(`No existe ${fileName}; descargando variables de Vercel (${target})...`);
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    const result = run(npx, args, { stdio: "inherit" });
    if (result.error) throw new Error(`No se pudo iniciar Vercel CLI: ${result.error.message}`);
    if (result.status !== 0) {
      throw new Error("Vercel env pull falló. Verifica que Vercel CLI esté autenticado y el proyecto enlazado.");
    }
    if (!existsSync(envPath)) throw new Error(`Vercel CLI no creó ${fileName}.`);

    try {
      await chmod(envPath, 0o600);
    } catch {
      if (process.platform !== "win32") {
        console.warn("Aviso: no se pudo restringir el permiso del archivo local de variables.");
      }
    }
  } else {
    console.log(`Usando ${fileName} existente; no se sobrescribirá.`);
  }

  return envPath;
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      environment: { type: "string", short: "e", default: "production" },
      "no-pull": { type: "boolean", default: false },
      "schema-details": { type: "boolean", default: false },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: false,
    strict: true,
  });

  if (values.help) {
    printHelp();
    return;
  }

  const environment = values.environment.toLowerCase();
  if (!Object.hasOwn(EXPECTED_URLS, environment)) {
    throw new Error("--environment debe ser production o staging.");
  }

  const fileName = environment === "production" ? ".env.production.local" : ".env.staging.local";
  const envPath = await ensureEnvFile(environment, fileName, values["no-pull"]);
  const envFileValues = dotenv.parse(await readFile(envPath, "utf8"));
  Object.assign(process.env, envFileValues);

  console.log(`\n=== Verificación: ${environment} ===`);
  console.log(`Archivo local: ${fileName} (valores no se mostrarán)`);
  let problems = 0;

  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const directUrl = process.env.DATABASE_URL_UNPOOLED?.trim() ?? "";
  const authSecret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || "";
  const cronRequired = environment === "production";

  const databaseUrlValid = isPostgresUrl(databaseUrl);
  const directUrlValid = isPostgresUrl(directUrl);

  problems += Number(reportVariable("DATABASE_URL", databaseUrl, {
    required: true,
    valid: databaseUrlValid,
    note: databaseUrl ? "valor oculto; se espera PostgreSQL" : "runtime",
  }));
  problems += Number(reportVariable("AUTH_SECRET / NEXTAUTH_SECRET", authSecret, {
    required: true,
    valid: authSecret.length >= 32,
    note: authSecret ? "valor oculto; debe ser aleatorio y largo" : "sesiones",
  }));
  problems += Number(reportVariable("DATABASE_URL_UNPOOLED", directUrl, {
    required: true,
    valid: directUrlValid,
    note: "conexión directa para Prisma Migrate",
  }));
  problems += Number(reportVariable("CRON_SECRET", process.env.CRON_SECRET, {
    required: cronRequired,
    note: "autoriza el cron productivo",
  }));

  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() ?? "";
  problems += Number(reportVariable("NEXTAUTH_URL", nextAuthUrl, {
    required: true,
    valid: !nextAuthUrl || nextAuthUrl === EXPECTED_URLS[environment],
    note: nextAuthUrl ? `esperado ${EXPECTED_URLS[environment]}` : "host canónico",
  }));

  reportVariable("NEXT_PUBLIC_STORE_WHATSAPP", process.env.NEXT_PUBLIC_STORE_WHATSAPP);
  reportVariable("OPENAI_API_KEY (configuración actual, opcional)", process.env.OPENAI_API_KEY);
  reportVariable("DEEPSEEK_API_KEY (legacy; el código actual no la usa)", process.env.DEEPSEEK_API_KEY);
  reportVariable("DEEPSEEK_MODEL (legacy; el nombre de modelo no es secreto)", process.env.DEEPSEEK_MODEL);
  reportVariable("RESEND_API_KEY (pendiente de integración)", process.env.RESEND_API_KEY);
  reportVariable("RESEND_FROM_EMAIL (pendiente de integración)", process.env.RESEND_FROM_EMAIL);
  reportVariable("AI_PROVIDER (pendiente de normalización)", process.env.AI_PROVIDER);
  reportVariable("AI_API_KEY (pendiente de normalización)", process.env.AI_API_KEY);
  reportVariable("AI_MODEL (pendiente de normalización)", process.env.AI_MODEL);

  if (environment === "staging") {
    const productionPath = resolve(ROOT, ".env.production.local");
    if (existsSync(productionPath)) {
      const productionEnv = dotenv.parse(await readFile(productionPath, "utf8"));
      const stagingAuth = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
      const productionAuth = productionEnv.AUTH_SECRET?.trim() || productionEnv.NEXTAUTH_SECRET?.trim();
      for (const [key, stagingValue, productionValue] of [
        ["DATABASE_URL", process.env.DATABASE_URL?.trim(), productionEnv.DATABASE_URL?.trim()],
        ["AUTH_SECRET", stagingAuth, productionAuth],
      ]) {
        if (hasUsableValue(stagingValue) && hasUsableValue(productionValue) && stagingValue === productionValue) {
          console.log(`  AISLAMIENTO: ${key} coincide con Production — REVISAR`);
          problems += 1;
        }
      }
    }
  }

  const prismaCli = resolve(ROOT, "node_modules/prisma/build/index.js");
  const prismaClient = resolve(ROOT, "src/generated/prisma/index.js");
  if (databaseUrlValid && directUrlValid && existsSync(prismaCli)) {
    console.log("\n--- Estado de migraciones (lectura) ---");
    const status = run(process.execPath, [prismaCli, "migrate", "status", "--schema=prisma/schema.prisma"], {
      env: process.env,
    });
    if (status.error) {
      console.log(`Prisma CLI no pudo iniciar (${status.error.code ?? "error"}).`);
      problems += 1;
    } else {
      const stdout = redact(status.stdout, process.env);
      const stderr = redact(status.stderr, process.env);
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (status.status !== 0) problems += 1;
    }
  } else {
    const requirements = [];
    if (!databaseUrlValid) requirements.push("una DATABASE_URL PostgreSQL real");
    if (!directUrlValid) requirements.push("una DATABASE_URL_UNPOOLED PostgreSQL real");
    if (!existsSync(prismaCli)) requirements.push("Prisma CLI instalado");
    console.log(`\nEstado de migraciones: omitido; requiere ${requirements.join(" y ") || "configuración válida"}.`);
    if (!existsSync(prismaCli)) problems += 1;
  }

  if (databaseUrlValid && existsSync(prismaClient)) {
    console.log("\n--- PostgreSQL y esquema (solo lectura) ---");
    let prisma;
    try {
      const clientUrl = pathToFileURL(resolve(ROOT, "src/generated/prisma/index.js"));
      const { PrismaClient } = await import(clientUrl);
      prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1 AS ok`;
      console.log("Conexión PostgreSQL: OK");

      const tableRows = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      const tables = new Set(tableRows.map((row) => row.table_name));
      const missing = REQUIRED_TABLES.filter((table) => !tables.has(table));
      console.log(`Tablas esperadas encontradas: ${REQUIRED_TABLES.length - missing.length}/${REQUIRED_TABLES.length}`);
      console.log(`Tablas faltantes: ${missing.length ? missing.join(", ") : "ninguna"}`);
      console.log(`Historial Prisma: ${tables.has("_prisma_migrations") ? "_prisma_migrations existe" : "no hay _prisma_migrations"}`);

      if (tables.has("_prisma_migrations")) {
        const migrations = await prisma.$queryRaw`
          SELECT migration_name, finished_at, rolled_back_at
          FROM "_prisma_migrations"
          ORDER BY started_at
        `;
        for (const migration of migrations) {
          const state = migration.finished_at ? "terminada" : "sin terminar";
          console.log(`  ${migration.migration_name}: ${state}${migration.rolled_back_at ? " (revertida)" : ""}`);
        }
      }

      if (values["schema-details"]) {
        const columns = await prisma.$queryRaw`
          SELECT table_name, column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position
        `;
        console.log("\nColumnas (metadata, sin filas de datos):");
        for (const column of columns) {
          console.log(`  ${column.table_name}.${column.column_name} (${column.data_type})`);
        }
      }

      if (missing.length) problems += 1;
    } catch (error) {
      const code = error?.code ?? error?.name ?? "error";
      console.error(`Verificación PostgreSQL falló (${code}). No se imprimió el mensaje para evitar exponer datos de conexión.`);
      problems += 1;
    } finally {
      if (prisma) await prisma.$disconnect().catch(() => {});
    }
  } else {
    console.log("\nVerificación PostgreSQL: omitida; requiere una DATABASE_URL PostgreSQL real y el cliente Prisma generado.");
    if (!existsSync(prismaClient)) problems += 1;
  }

  console.log(`\nResultado: ${problems ? `REVISAR (${problems} hallazgo(s))` : "OK"}`);
  if (problems) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error inesperado.");
  process.exitCode = 1;
});
