#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { chmod, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import dotenv from "dotenv";

const ROOT = process.cwd();
const ENV_FILE = ".env.local";
const COMPOSE_FILE = "compose.local.yaml";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const DEFAULT_PORT = 54329;
const REQUIRED_MIGRATION_DIR = resolve(ROOT, "prisma/migrations");

function printHelp() {
  console.log(`Prepara un entorno local aislado; no lee ni modifica variables de Vercel.

Uso:
  npm run setup:local

Acciones:
  - Crea .env.local con AUTH_SECRET, CRON_SECRET y credenciales aleatorias locales si no existe.
  - Inicia PostgreSQL en Docker, enlazado solo a 127.0.0.1:${DEFAULT_PORT}.
  - Si la base está vacía, crea el schema, registra el baseline de migraciones y carga el catálogo.
  - Si la base ya tiene tablas, no modifica su schema ni sus datos.

Requisitos: npm ci, Docker Engine/Desktop y Docker Compose.
No sobrescribe .env.local, no usa la base de Production y no crea claves de proveedores externos.

Opciones:
  --help  Muestra esta ayuda.`);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
    ...options,
  });
}

function isSensitivePlaceholder(value) {
  return /^\[(?:SENSITIVE|REDACTED|MASKED|HIDDEN)\]$/i.test(String(value ?? "").trim());
}

function redact(text, env) {
  let result = String(text ?? "");
  for (const key of [
    "DATABASE_URL",
    "DATABASE_URL_UNPOOLED",
    "AUTH_SECRET",
    "NEXTAUTH_SECRET",
    "CRON_SECRET",
    "LOCAL_POSTGRES_PASSWORD",
    "OPENAI_API_KEY",
    "DEEPSEEK_API_KEY",
    "RESEND_API_KEY",
    "AI_API_KEY",
  ]) {
    const secret = env[key];
    if (secret && !isSensitivePlaceholder(secret)) result = result.split(secret).join("[REDACTADO]");
  }
  return result.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[URL POSTGRES LOCAL REDACTADA]");
}

function assertCommandSucceeded(result, command, detail) {
  if (result.error) {
    throw new Error(`No se pudo iniciar ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(detail);
  }
}

function checkDocker() {
  const compose = run("docker", ["compose", "version"], { stdio: "ignore" });
  if (compose.error || compose.status !== 0) {
    throw new Error("No se encontró Docker Compose. Instala/inicia Docker Desktop o Docker Engine y vuelve a ejecutar npm run setup:local.");
  }

  const daemon = run("docker", ["info"], { stdio: "ignore" });
  if (daemon.error || daemon.status !== 0) {
    throw new Error("Docker está instalado, pero el daemon no responde. Inicia Docker Desktop/Engine y vuelve a intentarlo.");
  }
}

async function ensureEnvFileIsIgnored() {
  const result = run("git", ["check-ignore", "-q", ENV_FILE], { stdio: "ignore" });
  if (result.error || result.status !== 0) {
    throw new Error(`${ENV_FILE} no está excluido por Git; se cancela para no guardar credenciales locales en el repositorio.`);
  }
}

async function loadOrCreateEnv() {
  const envPath = resolve(ROOT, ENV_FILE);
  if (existsSync(envPath)) {
    console.log(`Usando ${ENV_FILE} existente; no se sobrescribirá.`);
    return dotenv.parse(await readFile(envPath, "utf8"));
  }

  const dbName = "dharma_kadabra_local";
  const dbUser = "dharma_local";
  const dbPassword = randomBytes(24).toString("hex");
  const authSecret = randomBytes(32).toString("base64url");
  const cronSecret = randomBytes(32).toString("base64url");
  const databaseUrl = `postgresql://${dbUser}:${dbPassword}@127.0.0.1:${DEFAULT_PORT}/${dbName}?schema=public`;
  const content = [
    "# Generado por npm run setup:local. Archivo local; no compartir ni versionar.",
    `LOCAL_POSTGRES_DB=${dbName}`,
    `LOCAL_POSTGRES_USER=${dbUser}`,
    `LOCAL_POSTGRES_PASSWORD=${dbPassword}`,
    `LOCAL_POSTGRES_PORT=${DEFAULT_PORT}`,
    `DATABASE_URL=\"${databaseUrl}\"`,
    `DATABASE_URL_UNPOOLED=\"${databaseUrl}\"`,
    `AUTH_SECRET=\"${authSecret}\"`,
    'NEXTAUTH_URL="http://localhost:3000"',
    `CRON_SECRET=\"${cronSecret}\"`,
    "",
  ].join("\n");

  try {
    await writeFile(envPath, content, { encoding: "utf8", mode: 0o600, flag: "wx" });
  } catch (error) {
    if (error?.code === "EEXIST") {
      console.log(`Se creó ${ENV_FILE} en paralelo; se usará sin sobrescribirlo.`);
      return dotenv.parse(await readFile(envPath, "utf8"));
    }
    throw error;
  }

  try {
    await chmod(envPath, 0o600);
  } catch {
    if (process.platform !== "win32") {
      console.warn(`Aviso: no se pudieron restringir los permisos de ${ENV_FILE}.`);
    }
  }

  console.log(`Creado ${ENV_FILE} con secretos aleatorios locales; los valores no se mostrarán.`);
  return dotenv.parse(content);
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function parseLocalDatabaseUrl(value, key, settings) {
  if (!value || isSensitivePlaceholder(value)) {
    throw new Error(`${key} falta o contiene el marcador Sensitive; configura una URL de PostgreSQL local en ${ENV_FILE}.`);
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} no es una URL válida; ${ENV_FILE} se dejó sin cambios.`);
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol) || !LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`${key} debe apuntar a localhost; se cancela para proteger bases remotas.`);
  }

  const databaseName = decode(url.pathname.replace(/^\//, ""));
  if (
    Number(url.port || 5432) !== settings.port ||
    decode(url.username) !== settings.user ||
    decode(url.password) !== settings.password ||
    databaseName !== settings.database
  ) {
    throw new Error(`${key} no coincide con las credenciales/puerto locales del servicio Docker; no se modificó la base.`);
  }

  return url;
}

function validateLocalEnv(env) {
  const database = env.LOCAL_POSTGRES_DB?.trim() ?? "";
  const user = env.LOCAL_POSTGRES_USER?.trim() ?? "";
  const password = env.LOCAL_POSTGRES_PASSWORD?.trim() ?? "";
  const port = Number(env.LOCAL_POSTGRES_PORT);

  if (!/^[A-Za-z_][A-Za-z0-9_]{0,62}$/.test(database) || !/^[A-Za-z_][A-Za-z0-9_]{0,62}$/.test(user)) {
    throw new Error(`${ENV_FILE} debe definir LOCAL_POSTGRES_DB y LOCAL_POSTGRES_USER con identificadores PostgreSQL válidos.`);
  }
  if (!password || password.length < 16 || isSensitivePlaceholder(password)) {
    throw new Error(`${ENV_FILE} debe contener una contraseña local para PostgreSQL; el archivo no se modificó.`);
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`${ENV_FILE} debe definir LOCAL_POSTGRES_PORT entre 1024 y 65535.`);
  }

  const settings = { database, user, password, port };
  const databaseUrl = parseLocalDatabaseUrl(env.DATABASE_URL?.trim(), "DATABASE_URL", settings);
  const directUrl = parseLocalDatabaseUrl(env.DATABASE_URL_UNPOOLED?.trim(), "DATABASE_URL_UNPOOLED", settings);
  if (databaseUrl.href !== directUrl.href) {
    throw new Error("DATABASE_URL y DATABASE_URL_UNPOOLED deben apuntar a la misma base local para este setup.");
  }

  const authSecret = env.AUTH_SECRET?.trim() || env.NEXTAUTH_SECRET?.trim() || "";
  if (!authSecret || authSecret.length < 32 || isSensitivePlaceholder(authSecret)) {
    throw new Error(`${ENV_FILE} necesita un AUTH_SECRET local de al menos 32 caracteres; el archivo no se modificó.`);
  }
  if (env.NEXTAUTH_URL?.trim() !== "http://localhost:3000") {
    throw new Error(`${ENV_FILE} debe usar NEXTAUTH_URL=http://localhost:3000 para este entorno local.`);
  }
  if (!env.CRON_SECRET?.trim() || env.CRON_SECRET.trim().length < 32 || isSensitivePlaceholder(env.CRON_SECRET)) {
    throw new Error(`${ENV_FILE} necesita un CRON_SECRET local de al menos 32 caracteres; el archivo no se modificó.`);
  }

  return settings;
}

function compose(args, options = {}) {
  return run("docker", ["compose", "--env-file", ENV_FILE, "-f", COMPOSE_FILE, ...args], options);
}

function runPrisma(args, env) {
  const prismaCli = resolve(ROOT, "node_modules/prisma/build/index.js");
  if (!existsSync(prismaCli)) {
    throw new Error("No se encontró Prisma CLI. Ejecuta npm ci y vuelve a correr npm run setup:local.");
  }

  const result = run(process.execPath, [prismaCli, ...args], { env });
  const stdout = redact(result.stdout, env);
  const stderr = redact(result.stderr, env);
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  assertCommandSucceeded(result, "Prisma", `Prisma ${args[0]} falló; se detuvo el setup. No se imprimieron credenciales.`);
}

async function waitForPostgres(settings) {
  console.log("Esperando a que PostgreSQL esté listo...");
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const result = compose(
      ["exec", "-T", "postgres", "pg_isready", "-U", settings.user, "-d", settings.database],
      { stdio: "ignore" },
    );
    if (!result.error && result.status === 0) return;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2000));
  }
  throw new Error("PostgreSQL no quedó listo en 90 segundos. Revisa Docker Desktop y los logs del servicio postgres.");
}

function countPublicTables(settings) {
  const query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';";
  const result = compose(
    [
      "exec",
      "-T",
      "postgres",
      "psql",
      "-X",
      "-tA",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      settings.user,
      "-d",
      settings.database,
      "-c",
      query,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  assertCommandSucceeded(result, "Docker Compose", "No se pudo inspeccionar la base local; se detuvo el setup sin aplicar schema ni seed.");
  const count = Number(String(result.stdout ?? "").trim());
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("No se pudo interpretar el estado de la base local; no se aplicaron cambios.");
  }
  return count;
}

async function getMigrationIds() {
  const entries = await readdir(REQUIRED_MIGRATION_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && existsSync(resolve(REQUIRED_MIGRATION_DIR, entry.name, "migration.sql")))
    .map((entry) => entry.name)
    .sort();
}

async function initializeEmptyDatabase(env) {
  console.log("Base local vacía: sincronizando el schema actual y registrando el baseline de migraciones...");
  runPrisma(["db", "push", "--schema=prisma/schema.prisma"], env);

  const migrations = await getMigrationIds();
  for (const migration of migrations) {
    runPrisma(["migrate", "resolve", "--applied", migration, "--schema=prisma/schema.prisma"], env);
  }

  const seedResult = run(process.execPath, ["scripts/seed-products.mjs"], { env });
  const seedStdout = redact(seedResult.stdout, env);
  const seedStderr = redact(seedResult.stderr, env);
  if (seedStdout) process.stdout.write(seedStdout);
  if (seedStderr) process.stderr.write(seedStderr);
  assertCommandSucceeded(seedResult, "seed local", "El seed local falló; revisa el error de Prisma sin compartir credenciales.");
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: { help: { type: "boolean", short: "h" } },
    allowPositionals: false,
    strict: true,
  });

  if (values.help) {
    printHelp();
    return;
  }

  await ensureEnvFileIsIgnored();
  checkDocker();
  const envValues = await loadOrCreateEnv();
  const settings = validateLocalEnv(envValues);
  const childEnv = { ...process.env, ...envValues };
  console.log("Generando Prisma Client para conexión local...");
  runPrisma(["generate", "--schema=prisma/schema.prisma"], childEnv);

  console.log("Iniciando PostgreSQL local en Docker (solo accesible desde esta máquina)...");
  const up = compose(["up", "-d", "postgres"], { stdio: "inherit" });
  assertCommandSucceeded(up, "Docker Compose", "No se pudo iniciar PostgreSQL. Revisa Docker Desktop y el puerto local configurado.");
  await waitForPostgres(settings);
  console.log(`PostgreSQL local: listo (puerto ${settings.port}; valores ocultos).`);

  const tableCount = countPublicTables(settings);
  if (tableCount === 0) {
    await initializeEmptyDatabase(childEnv);
    console.log("Schema local listo, baseline registrado y catálogo inicial cargado.");
  } else {
    console.log(`La base local ya contiene ${tableCount} tabla(s); no se modificaron schema ni datos.`);
  }

  console.log("\nListo. Ejecuta npm run dev para iniciar la aplicación.");
  console.log("Este setup no lee .env.production.local, no usa credenciales de Vercel y no crea claves de IA/correo.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Error inesperado durante el setup local.");
  process.exitCode = 1;
});
