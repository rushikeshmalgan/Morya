// lib/routing.ts — Walking route abstraction using graph-based road networks (OSRM / OpenStreetMap)

import { haversineDistance } from "./geo";

export interface WalkingRoute {
  coordinates: [number, number][]; // Array of [lat, lng]
  distanceMeters: number;          // Total walking distance in meters
  durationSeconds: number;         // Estimated walking time in seconds
  destinationName?: string;
  destinationId?: string;
  source: "osrm" | "fallback";
}

/**
 * Fetch walking route from user's current GPS location to destination pandal.
 * Leverages OpenStreetMap road network graph (via OSRM foot routing)
 * to compute the actual shortest street-level walking path.
 */
export async function getWalkingRoute(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  destinationName?: string,
  destinationId?: string
): Promise<WalkingRoute> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    // Primary: OpenStreetMap Foot Routing (OSRM DE mirror)
    const url = `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // GeoJSON coordinates are [lng, lat], Leaflet expects [lat, lng]
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
        );

        return {
          coordinates,
          distanceMeters: Math.round(route.distance),
          durationSeconds: Math.round(route.duration),
          destinationName,
          destinationId,
          source: "osrm",
        };
      }
    }
  } catch (err) {
    // Network error, timeout, or service unavailable — gracefully proceed to fallback
    console.warn("OSRM routing request failed or timed out, using fallback:", err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Secondary fallback: router.project-osrm.org backup endpoint
  try {
    const backupController = new AbortController();
    const backupTimeoutId = setTimeout(() => backupController.abort(), 4000);
    const backupUrl = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const res = await fetch(backupUrl, {
      signal: backupController.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(backupTimeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
        );

        return {
          coordinates,
          distanceMeters: Math.round(route.distance),
          durationSeconds: Math.round(route.duration),
          destinationName,
          destinationId,
          source: "osrm",
        };
      }
    }
  } catch {
    // Both OSRM servers unreachable
  }

  // Graceful Offline / Straight-line Fallback:
  // Interpolate direct path line with calculated walking distance and walking pace ~ 1.3 m/s (~4.7 km/h)
  const directDistance = haversineDistance(startLat, startLng, destLat, destLng);
  // Estimate urban street walking distance factor (~1.25x direct distance due to road grid)
  const estimatedStreetDistance = Math.round(directDistance * 1.25);
  const estimatedDuration = Math.round(estimatedStreetDistance / 1.3);

  return {
    coordinates: [
      [startLat, startLng],
      [destLat, destLng],
    ],
    distanceMeters: estimatedStreetDistance,
    durationSeconds: estimatedDuration,
    destinationName,
    destinationId,
    source: "fallback",
  };
}

/**
 * Format duration in minutes / hours for human-friendly navigation text
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
}
