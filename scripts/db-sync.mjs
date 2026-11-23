import { spawnSync } from "node:child_process";

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

function run(args, extraEnv = {}) {
  return spawnSync("npx", ["prisma", ...args], {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
  });
}

const gen = run(["generate"]);
if (gen.status === 0) {
  process.stdout.write(gen.stdout);
} else {
  const fallback = run(["generate", "--no-engine"], {
    PRISMA_SCHEMA_ENGINE_BINARY: "/bin/true",
    PRISMA_QUERY_ENGINE_LIBRARY: "/bin/true",
    PRISMA_QUERY_ENGINE_BINARY: "/bin/true",
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: "1",
  });
  if (fallback.status !== 0) {
    process.stderr.write(gen.stderr || fallback.stderr);
    process.exit(fallback.status ?? 1);
  }
  process.stdout.write(fallback.stdout);
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

const push = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(push.status ?? 0);
