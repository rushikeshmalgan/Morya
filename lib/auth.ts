// lib/auth.ts — Session token authentication for anonymous users

import { prisma } from "./prisma";
import { NextRequest } from "next/server";

/**
 * Extract and validate a session token from request headers
 * Returns the AnonymousUser or null if invalid
 */
export async function getSessionUser(request: NextRequest) {
  const token = request.headers.get("x-session-token");
  if (!token || token.length < 16 || token.length > 256) return null;

  try {
    const user = await prisma.anonymousUser.findUnique({
      where: { sessionToken: token },
    });
    return user;
  } catch {
    return null;
  }
}

/**
 * Require a valid session — returns user or throws 401 response
 */
export async function requireSession(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return { user: null, error: "Unauthorized — missing or invalid session token" };
  }
  return { user, error: null };
}

/**
 * Generate a cryptographically random session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────
// Rate limiting — simple in-memory for MVP
// In production: use Redis or Upstash
// ─────────────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Basic rate limiter — max requests per window
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  if (rateLimitStore.size > 1_000) {
    for (const [storedKey, storedRecord] of rateLimitStore) {
      if (storedRecord.resetAt <= now) rateLimitStore.delete(storedKey);
    }
  }
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
