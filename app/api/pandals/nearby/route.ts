// app/api/pandals/nearby/route.ts — Get nearby pandals with Fog of Discovery

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineDistance, getPandalState } from "@/lib/geo";
import { getSessionUser } from "@/lib/auth";
import { PandalStatus } from "@prisma/client";
import { parseBoundedNumber, parseCoordinate } from "@/lib/validation";

const CHECKIN_RADIUS = parseInt(process.env.CHECKIN_RADIUS_METERS || "150");
const DEFAULT_SEARCH_RADIUS = 5000; // 5km

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get("lat"), "latitude");
  const lng = parseCoordinate(searchParams.get("lng"), "longitude");
  const radius = parseBoundedNumber(searchParams.get("radius"), DEFAULT_SEARCH_RADIUS, 100, 20_000);

  if (lat === null || lng === null || radius === null) {
    return NextResponse.json({ error: "Valid lat, lng, and radius are required" }, { status: 400 });
  }

  // Get current user's discovered pandals (optional — unauthenticated users see fog only)
  const user = await getSessionUser(request);
  let discoveredPandalIds = new Set<string>();
  if (user) {
    const visits = await prisma.pandalVisit.findMany({
      where: { userId: user.id },
      select: { pandalId: true },
    });
    discoveredPandalIds = new Set(visits.map((v) => v.pandalId));
  }

  // Fetch all approved pandals (in production, optimize with spatial index)
  const pandals = await prisma.pandal.findMany({
    where: { status: PandalStatus.APPROVED },
    select: {
      id: true,
      name: true,
      description: true,
      latitude: true,
      longitude: true,
      address: true,
      city: true,
      aartiTimes: true,
      isRare: true,
      isNew: true,
      established: true,
      _count: { select: { visits: true, photos: true } },
    },
  });

  // Filter by radius and apply Fog of Discovery
  const nearby = pandals
    .map((pandal) => {
      const distance = haversineDistance(lat, lng, pandal.latitude, pandal.longitude);
      const isDiscovered = discoveredPandalIds.has(pandal.id);
      const state = getPandalState(distance, isDiscovered, CHECKIN_RADIUS);

      if (distance > radius || state === "hidden") return null;

      // Apply fog — limit info for undetected/revealed pandals
      const fogApplied = state === "detected";
      const partialFog = state === "revealed";

      return {
        id: pandal.id,
        // Fog: hide name and address until revealed
        name: fogApplied ? "???" : pandal.name,
        description: fogApplied || partialFog ? null : pandal.description,
        latitude: pandal.latitude,
        longitude: pandal.longitude,
        address: fogApplied ? null : pandal.address,
        city: pandal.city,
        aartiTimes: fogApplied ? null : pandal.aartiTimes,
        isRare: pandal.isRare,
        isNew: pandal.isNew,
        established: pandal.established,
        visitCount: pandal._count.visits,
        photoCount: pandal._count.photos,
        distance: Math.round(distance),
        state, // hidden | detected | revealed | in_range | discovered
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a!.distance - b!.distance));

  return NextResponse.json({ pandals: nearby, checkinRadius: CHECKIN_RADIUS });
}
