// prisma.config.ts — Prisma 7 configuration

import path from "node:path";
import { defineConfig } from "@prisma/config";

const rawUrl =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.TURSO_URL;
const rawToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  process.env.TURSO_TOKEN;
const authToken = rawToken?.trim().replace(/^["']|["']$/g, "").trim();

const url = rawUrl?.trim().replace(/^["']|["']$/g, "").trim() || "file:./dev.db";

const fullUrl =
  authToken && (url.startsWith("libsql://") || url.startsWith("https://")) && !url.includes("authToken=")
    ? `${url}?authToken=${authToken}`
    : url;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: fullUrl,
  },
});
