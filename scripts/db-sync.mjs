import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Sincronización resiliente de Prisma para `npm run build` y `postinstall`:
 * 1. Genera el cliente de Prisma (`prisma generate`); si el entorno de CI/sandbox
 *    no tiene acceso al mirror de binarios nativos, genera el cliente tipado
 *    con `--no-engine` usando el motor WASM local.
 * 2. Ejecuta `prisma db push` únicamente cuando se invoca SIN el argumento
 *    `generate-only` (script manual `npm run db:push` / `npm run db:sync`).
 *
 * IMPORTANTE (Vercel): el build de producción (`npm run build` y `postinstall`)
 * usa `generate-only` y NUNCA toca la base de datos. Ejecutar `db push` durante
 * la compilación hace fallar el despliegue (`Command "npm run build" exited
 * with 1`) cuando la red del builder no alcanza el mirror de motores de Prisma
 * o la base de datos (pooler/directa). Las migraciones se aplican fuera del
 * pipeline de build con `npm run db:push`.
 */
const mode = process.argv[2] ?? "sync";
const isWindows = process.platform === "win32";
const prismaCli = resolve(process.cwd(), "node_modules/prisma/build/index.js");

if (!existsSync(prismaCli)) {
  console.error("[db:sync] Prisma CLI no está instalado localmente. Ejecuta npm ci con las devDependencies habilitadas.");
  process.exit(1);
}

function run(args, extraEnv = {}, options = {}) {
  return spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: process.cwd(),
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
    ...options,
  });
}

function printOutput(output, stream = process.stdout) {
  if (typeof output === "string" && output.length > 0) stream.write(output);
}

function reportSpawnError(result, label) {
  if (result.error) {
    console.error(`[db:sync] No se pudo iniciar ${label} (${result.error.code ?? "error"}): ${result.error.message}`);
  }
}

const gen = run(["generate"]);
if (gen.status === 0) {
  printOutput(gen.stdout);
} else {
  const fallbackEnv = { PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: "1" };
  // /bin/true solo existe en Unix. En Windows dejamos que Prisma use sus
  // motores WASM; si no están disponibles, abajo se informa el error real.
  if (!isWindows) {
    Object.assign(fallbackEnv, {
      PRISMA_SCHEMA_ENGINE_BINARY: "/bin/true",
      PRISMA_QUERY_ENGINE_LIBRARY: "/bin/true",
      PRISMA_QUERY_ENGINE_BINARY: "/bin/true",
    });
  }

  const fallback = run(["generate", "--no-engine"], fallbackEnv);
  if (fallback.status !== 0) {
    printOutput(gen.stderr, process.stderr);
    printOutput(fallback.stdout, process.stderr);
    printOutput(fallback.stderr, process.stderr);
    reportSpawnError(fallback, "Prisma CLI (fallback)");
    reportSpawnError(gen, "Prisma CLI");
    process.exit(fallback.status ?? 1);
  }
  printOutput(fallback.stdout);
}

if (mode === "generate-only") {
  process.exit(0);
}

const dbUrl = (process.env.DATABASE_URL ?? "").trim();
const isPlaceholder =
  !dbUrl || dbUrl.includes("usuario:contraseña@host") || dbUrl.includes("localhost:5432/placeholder");

if (isPlaceholder) {
  console.log("[db:sync] DATABASE_URL no configurada: se omite `prisma db push` durante el build.");
  process.exit(0);
}

const push = run(["db", "push"], {}, { stdio: "inherit" });
if (push.error) {
  reportSpawnError(push, "Prisma CLI");
  process.exit(1);
}
process.exit(push.status ?? 1);
