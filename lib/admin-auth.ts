// Server-only authentication helpers for the moderation API.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AdminSessionPayload = {
  exp: number;
  iat: number;
  nonce: string;
  v: 1;
};

function getAdminConfig() {
  const token = process.env.ADMIN_TOKEN?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!token || !password) {
    return null;
  }

  return { token, password };
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function secureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function isAdminConfigured(): boolean {
  return getAdminConfig() !== null;
}

export function isValidAdminPassword(password: unknown): boolean {
  const config = getAdminConfig();
  return Boolean(
    config &&
      typeof password === "string" &&
      secureEquals(password, config.password)
  );
}

export function hasAdminSession(request: NextRequest): boolean {
  const config = getAdminConfig();
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!config || !session) return false;

  const [encodedPayload, signature, ...extra] = session.split(".");
  if (!encodedPayload || !signature || extra.length > 0) return false;

  const expectedSignature = sign(encodedPayload, config.token);
  if (!secureEquals(signature, expectedSignature)) return false;

  const rawPayload = decodeBase64Url(encodedPayload);
  if (!rawPayload) return false;

  try {
    const payload = JSON.parse(rawPayload) as Partial<AdminSessionPayload>;
    return (
      payload.v === 1 &&
      typeof payload.iat === "number" &&
      typeof payload.exp === "number" &&
      typeof payload.nonce === "string" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function setAdminSession(response: NextResponse): void {
  const config = getAdminConfig();
  if (!config) {
    throw new Error("Admin authentication is not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    v: 1,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const value = `${encodedPayload}.${sign(encodedPayload, config.token)}`;

  response.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export function clearAdminSession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}
