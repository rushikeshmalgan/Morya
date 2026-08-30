// prisma.config.ts — Prisma 7 configuration (PostgreSQL / Neon DB)

import path from "node:path";
import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});
