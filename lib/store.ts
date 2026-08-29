"use client";
// lib/store.ts — Client-side user state management using localStorage + sessionStorage

import { v4 as uuidv4 } from "uuid";

export interface BappaUser {
  userId: string;
  sessionToken: string;
  generatedName: string;
  generatedNumber: number;
  city: string | null;
  score: number;
  uniquePandals: number;
}

const DEVICE_ID_KEY = "bappa_device_id";
const USER_KEY = "bappa_user";
const DEMO_MODE_KEY = "bappa_demo_mode";

/**
 * Get or create a persistent device ID (browser UUID)
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): BappaUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save user to localStorage
 */
export function saveUser(user: BappaUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear stored user (logout / reset)
 */
export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

/**
 * Register or retrieve anonymous user from server
 */
export async function registerOrRetrieveUser(): Promise<BappaUser> {
  // Check if we already have a valid user stored
  const stored = getStoredUser();
  if (stored?.sessionToken) {
    // Verify the token is still valid
    try {
      const res = await fetch("/api/user", {
        headers: { "x-session-token": stored.sessionToken },
      });
      if (res.ok) {
        const data = await res.json();
        const user: BappaUser = {
          userId: data.id,
          sessionToken: stored.sessionToken,
          generatedName: data.generatedName,
          generatedNumber: data.generatedNumber,
          city: data.city,
          score: data.score,
          uniquePandals: data.uniquePandals,
        };
        saveUser(user);
        return user;
      }
    } catch {
      // Fall through to create new user
    }
  }

  // Create new anonymous user
  const deviceId = getOrCreateDeviceId();
  const res = await fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  const data = await res.json();
  const user: BappaUser = {
    userId: data.userId,
    sessionToken: data.sessionToken,
    generatedName: data.generatedName,
    generatedNumber: data.generatedNumber,
    city: data.city,
    score: data.score,
    uniquePandals: data.uniquePandals,
  };

  saveUser(user);
  return user;
}

/**
 * API fetch helper with session token
 */
export function authedFetch(
  url: string,
  options: RequestInit = {},
  sessionToken: string
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-session-token": sessionToken,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Demo mode toggle
 */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(DEMO_MODE_KEY, "true");
  } else {
    localStorage.removeItem(DEMO_MODE_KEY);
  }
}
