import { spawnSync } from "node:child_process";

/**
 * Sincronización resiliente de Prisma para `npm run build` y `postinstall`.
 *
 * - `generate-only` (build / postinstall): SOLO genera el cliente y nunca toca
 *   la base de datos. Si el entorno no alcanza el mirror de binarios nativos,
 *   genera el cliente tipado con `--no-engine` (motor WASM local).
 * - `sync` (`npm run db:push` / `npm run db:sync`): primero aplica el esquema
 *   con `prisma db push` y luego regenera el cliente, para que la terminal
 *   quede lista para `next dev`.
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

/**
 * Aplicar el esquema a la base (`db push`) necesita los binarios de Prisma, no
 * el cliente generado; por eso, en modo sync, el push corre PRIMERO. Así el
 * comando termina con el cliente regenerado y listo para `next dev`.
 */
function isPlaceholderDatabaseUrl() {
  const dbUrl = (process.env.DATABASE_URL ?? "").trim();
  return (
    !dbUrl || dbUrl.includes("usuario:contraseña@host") || dbUrl.includes("localhost:5432/placeholder")
  );
}

if (mode !== "generate-only" && !isPlaceholderDatabaseUrl()) {
  const push = spawnSync("npx", ["prisma", "db", "push"], {
    stdio: "inherit",
    env: process.env,
  });
  if (push.status !== 0) {
    console.error(
      [
        "",
        "[db:sync] `prisma db push` no pudo aplicar el esquema.",
        "Si el error dice «Added the required column `sku` … not possible to execute»,",
        "aplica primero el SKU sin perder datos:",
        "  node scripts/apply-sku.mjs",
        "y vuelve a ejecutar `npm run db:push`.",
      ].join("\n"),
    );
    process.exit(push.status ?? 1);
  }
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

if (mode !== "generate-only" && isPlaceholderDatabaseUrl()) {
  console.log("[db:sync] DATABASE_URL no configurada: se omite `prisma db push`.");
}
