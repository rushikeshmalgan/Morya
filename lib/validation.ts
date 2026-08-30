export function parseCoordinate(value: unknown, axis: "latitude" | "longitude"): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  const limit = axis === "latitude" ? 90 : 180;

  return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
}

export function parseBoundedNumber(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number
): number | null {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

export function parseBoundedInteger(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number
): number | null {
  const parsed = parseBoundedNumber(value, fallback, minimum, maximum);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

export function parseRequiredText(
  value: unknown,
  minimumLength: number,
  maximumLength: number
): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length >= minimumLength && normalized.length <= maximumLength
    ? normalized
    : null;
}

export function parseOptionalText(
  value: unknown,
  maximumLength: number
): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length <= maximumLength ? normalized || null : null;
}
