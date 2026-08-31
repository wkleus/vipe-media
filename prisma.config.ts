// Prisma 7: CLI database URL lives here instead of in schema.prisma.
// Uses Neon's direct connection - migrations need that, not the pooled one (see lib/prisma.ts).

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
