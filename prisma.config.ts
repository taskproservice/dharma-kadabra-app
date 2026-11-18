import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // A local-only fallback lets Prisma Client generate before a database is provisioned.
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/dharma_kadabra?schema=public",
  },
});
