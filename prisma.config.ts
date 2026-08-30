// prisma.config.ts — Prisma 7 configuration (PostgreSQL / Neon DB)

import path from "node:path";
import "dotenv/config";
import { defineConfig } from "@prisma/config";

const rawUrl = process.env.DATABASE_URL;
const url = rawUrl?.trim().replace(/^["']|["']$/g, "").trim() || "";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url,
  },
});
