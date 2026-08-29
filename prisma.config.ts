// prisma.config.ts — Prisma 7+ configuration
// Database connection URL is configured here (moved from schema.prisma in Prisma 7)

import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});

