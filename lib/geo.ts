// lib/geo.ts — Geolocation utilities

/**
 * Haversine distance between two GPS coordinates in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Pandal discovery states based on distance
 */
export type PandalDiscoveryState =
  | "hidden"      // > 2km
  | "detected"    // 500m - 2km
  | "revealed"    // 150m - 500m
  | "in_range"    // < 150m (configurable)
  | "discovered"; // already unlocked

export function getPandalState(
  distanceMeters: number,
  alreadyDiscovered: boolean,
  checkinRadius: number = 150
): PandalDiscoveryState {
  if (alreadyDiscovered) return "discovered";
  if (distanceMeters <= checkinRadius) return "in_range";
  if (distanceMeters <= 500) return "revealed";
  if (distanceMeters <= 2000) return "detected";
  return "hidden";
}

/**
 * Speed sanity check — detect impossibly fast movement
 * Returns true if the movement is physically possible
 */
export function isMovementPlausible(
  prevLat: number,
  prevLon: number,
  prevTime: Date,
  currLat: number,
  currLon: number,
  currTime: Date,
  maxSpeedKmh: number = 120 // max plausible speed (car/train)
): boolean {
  const distanceM = haversineDistance(prevLat, prevLon, currLat, currLon);
  const timeMs = currTime.getTime() - prevTime.getTime();
  const timeHours = timeMs / (1000 * 60 * 60);

  if (timeHours <= 0) return false;

  const speedKmh = distanceM / 1000 / timeHours;
  return speedKmh <= maxSpeedKmh;
}

/**
 * Reverse geocode via Nominatim (OpenStreetMap) — free, no API key
 */
export async function reverseGeocodeCity(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "BappaMode/1.0 (ganpati-pandal-discovery-app)",
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    // Try city, then town, then state_district
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.state_district ||
      null
    );
  } catch {
    return null;
  }
}
