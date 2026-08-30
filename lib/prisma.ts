// lib/prisma.ts — Prisma 7 singleton with PostgreSQL / Neon DB adapter

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = sanitizeEnv(process.env.DATABASE_URL);
  if (!connectionString) {
    console.warn("[Prisma] DATABASE_URL is not set in environment.");
  }

  const pool = new Pool({
    connectionString: connectionString || undefined,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());
