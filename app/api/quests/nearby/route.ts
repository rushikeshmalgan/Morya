// app/api/quests/nearby/route.ts — Dynamic nearby missions based on user location

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { haversineDistance } from "@/lib/geo";
import { QuestType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const radius = parseFloat(searchParams.get("radius") || "2000"); // default 2km

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const user = await getSessionUser(request);

  // Get all approved pandals
  const pandals = await prisma.pandal.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      city: true,
      isRare: true,
      isNew: true,
    },
  });

  // Find nearby pandals
  const nearby = pandals
    .map((p) => ({
      ...p,
      distance: haversineDistance(lat, lng, p.latitude, p.longitude),
    }))
    .filter((p) => p.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  // Get user's already-discovered pandals
  let discoveredIds = new Set<string>();
  if (user) {
    const visits = await prisma.pandalVisit.findMany({
      where: { userId: user.id },
      select: { pandalId: true },
    });
    discoveredIds = new Set(visits.map((v) => v.pandalId));
  }

  const undiscovered = nearby.filter((p) => !discoveredIds.has(p.id));
  const discovered = nearby.filter((p) => discoveredIds.has(p.id));

  // Generate dynamic missions
  const missions = [];

  // Mission 1: Explore nearby pandals (undiscovered)
  if (undiscovered.length >= 2) {
    const targetCount = Math.min(3, undiscovered.length);
    missions.push({
      id: `nearby_${Date.now()}_explore`,
      type: QuestType.DISCOVER_N,
      title: "Nearby Bappa Hunt",
      description: `Visit ${targetCount} pandals within ${Math.round(radius / 1000)}km`,
      requirement: targetCount,
      reward: targetCount * 15,
      pandals: undiscovered.slice(0, targetCount).map((p) => ({
        id: p.id,
        name: p.name,
        distance: Math.round(p.distance),
        city: p.city,
        isRare: p.isRare,
        isNew: p.isNew,
      })),
      totalNearby: undiscovered.length,
    });
  }

  // Mission 2: Rare pandal hunt
  const rareNearby = undiscovered.filter((p) => p.isRare);
  if (rareNearby.length > 0) {
    missions.push({
      id: `nearby_${Date.now()}_rare`,
      type: QuestType.VISIT_SPECIFIC,
      title: "Rare Bappa Quest",
      description: `Discover a rare pandal nearby`,
      requirement: 1,
      reward: 30,
      pandals: rareNearby.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        distance: Math.round(p.distance),
        city: p.city,
        isRare: true,
      })),
    });
  }

  // Mission 3: New submissions nearby
  const newNearby = undiscovered.filter((p) => p.isNew);
  if (newNearby.length > 0) {
    missions.push({
      id: `nearby_${Date.now()}_new`,
      type: QuestType.FIND_UNKNOWN,
      title: "Fresh Bappa Trail",
      description: `Discover newly added pandals in your area`,
      requirement: Math.min(2, newNearby.length),
      reward: 40,
      pandals: newNearby.slice(0, 2).map((p) => ({
        id: p.id,
        name: p.name,
        distance: Math.round(p.distance),
        city: p.city,
        isNew: true,
      })),
    });
  }

  // Mission 4: Photo mission
  const photoCandidates = undiscovered.slice(0, 3);
  if (photoCandidates.length > 0) {
    missions.push({
      id: `nearby_${Date.now()}_photo`,
      type: QuestType.PHOTO_SUBMIT,
      title: "Capture Bappa",
      description: `Take a photo at ${photoCandidates[0].name}`,
      requirement: 1,
      reward: 25,
      pandals: photoCandidates.map((p) => ({
        id: p.id,
        name: p.name,
        distance: Math.round(p.distance),
      })),
    });
  }

  return NextResponse.json({
    missions,
    nearbyCount: nearby.length,
    undiscoveredCount: undiscovered.length,
    discoveredCount: discovered.length,
    radius,
    center: { lat, lng },
  });
}
