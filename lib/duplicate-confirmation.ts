// Short-lived, server-held approval for a user to continue after duplicate detection.
// This deliberately prevents a client supplied `skipDuplicateCheck` flag from becoming
// a general bypass.

import { randomBytes } from "node:crypto";

const CONFIRMATION_TTL_MS = 10 * 60 * 1000;

type ConfirmationRecord = {
  expiresAt: number;
  fingerprint: string;
  userId: string;
};

const confirmations = new Map<string, ConfirmationRecord>();

function cleanExpiredConfirmations(now: number): void {
  for (const [token, record] of confirmations) {
    if (record.expiresAt <= now) confirmations.delete(token);
  }
}

export function createSubmissionFingerprint(input: {
  city: string;
  latitude: number;
  longitude: number;
  name: string;
}): string {
  return [
    input.name.trim().toLocaleLowerCase(),
    input.city.trim().toLocaleLowerCase(),
    input.latitude.toFixed(6),
    input.longitude.toFixed(6),
  ].join("|");
}

export function issueDuplicateConfirmation(userId: string, fingerprint: string): string {
  const now = Date.now();
  cleanExpiredConfirmations(now);
  const token = randomBytes(32).toString("base64url");
  confirmations.set(token, {
    userId,
    fingerprint,
    expiresAt: now + CONFIRMATION_TTL_MS,
  });
  return token;
}

export function consumeDuplicateConfirmation(
  token: unknown,
  userId: string,
  fingerprint: string
): boolean {
  if (typeof token !== "string" || token.length < 20) return false;

  const record = confirmations.get(token);
  confirmations.delete(token);

  return Boolean(
    record &&
      record.expiresAt > Date.now() &&
      record.userId === userId &&
      record.fingerprint === fingerprint
  );
}
