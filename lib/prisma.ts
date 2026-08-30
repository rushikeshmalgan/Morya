// lib/prisma.ts — Prisma 7 singleton with LibSQL adapter (SQLite dev / Turso prod)

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getDatabaseConfig() {
  const rawUrl =
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.TURSO_URL;
  const rawToken =
    process.env.TURSO_AUTH_TOKEN ||
    process.env.DATABASE_AUTH_TOKEN ||
    process.env.TURSO_TOKEN;

  const url = sanitizeEnv(rawUrl) || "file:./dev.db";
  const authToken = sanitizeEnv(rawToken);

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  const isRemote =
    url.startsWith("libsql://") ||
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("wss://") ||
    url.startsWith("ws://");

  if (isProduction) {
    if (!isRemote && url.startsWith("file:")) {
      console.warn(
        "[Prisma/Turso] WARNING: Application is running in a serverless production environment (Vercel) with a local SQLite database (" +
          url +
          "). Local SQLite files are read-only in serverless lambdas. Please configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your Vercel Project Settings."
      );
    } else if (isRemote && !authToken) {
      console.warn(
        "[Prisma/Turso] WARNING: Remote Turso database URL detected (" +
          url.replace(/:[^:@]+@/, ":***@") +
          "), but no TURSO_AUTH_TOKEN was provided. Queries to authenticated Turso databases will fail. Please set TURSO_AUTH_TOKEN in your Vercel Project Settings."
      );
    }
  }

  return { url, authToken };
}

function createPrismaClient(): PrismaClient {
  const { url, authToken } = getDatabaseConfig();

  const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn"] : [],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());
