// app/api/visits/route.ts — Pandal check-in with GPS verification + anti-cheat

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, checkRateLimit } from "@/lib/auth";
import { haversineDistance, isMovementPlausible } from "@/lib/geo";
import {
  checkAndAwardAchievements,
  awardAchievement,
  updateDiscoverQuests,
} from "@/lib/achievements";
import { PandalStatus } from "@prisma/client";

const CHECKIN_RADIUS = parseInt(process.env.CHECKIN_RADIUS_METERS || "150");

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // Rate limit: 20 check-in attempts per hour
  const rateKey = `checkin:${user.id}`;
  const { allowed } = checkRateLimit(rateKey, 20);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many check-in attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { pandalId, latitude, longitude, isDemoMode } = body;

  if (!pandalId || (!latitude && !isDemoMode) || (!longitude && !isDemoMode)) {
    return NextResponse.json(
      { error: "pandalId, latitude, and longitude are required" },
      { status: 400 }
    );
  }

  // Fetch pandal
  const pandal = await prisma.pandal.findUnique({ where: { id: pandalId } });
  if (!pandal || pandal.status !== PandalStatus.APPROVED) {
    return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
  }

  // Check if already discovered (HARD RULE)
  const existingVisit = await prisma.pandalVisit.findUnique({
    where: { userId_pandalId: { userId: user.id, pandalId } },
  });

  if (existingVisit) {
    return NextResponse.json(
      {
        alreadyDiscovered: true,
        message: "You've already discovered this Bappa!",
        firstVisit: existingVisit.timestamp,
      },
      { status: 409 }
    );
  }

  let userLat = latitude;
  let userLng = longitude;

  // Demo mode: skip GPS verification (clearly marked)
  if (isDemoMode && process.env.ALLOW_DEMO_MODE === "true") {
    userLat = pandal.latitude;
    userLng = pandal.longitude;
  } else {
    // Anti-cheat 1: GPS proximity check
    const distance = haversineDistance(
      userLat, userLng, pandal.latitude, pandal.longitude
    );

    if (distance > CHECKIN_RADIUS) {
      return NextResponse.json(
        {
          error: "not_close_enough",
          message: `You're ${Math.round(distance)}m away. Get within ${CHECKIN_RADIUS}m to unlock this Bappa.`,
          distance: Math.round(distance),
          required: CHECKIN_RADIUS,
        },
        { status: 403 }
      );
    }

    // Anti-cheat 2: Speed check against last visit
    const lastVisit = await prisma.pandalVisit.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
    });

    if (lastVisit) {
      const plausible = isMovementPlausible(
        lastVisit.latitude,
        lastVisit.longitude,
        lastVisit.timestamp,
        userLat,
        userLng,
        new Date()
      );
      if (!plausible) {
        return NextResponse.json(
          {
            error: "movement_anomaly",
            message: "Location anomaly detected. Please verify your location.",
          },
          { status: 403 }
        );
      }
    }
  }

  // Create the discovery (server timestamps everything)
  const visit = await prisma.pandalVisit.create({
    data: {
      userId: user.id,
      pandalId,
      latitude: userLat,
      longitude: userLng,
      verificationStatus: "VERIFIED",
    },
  });

  // Update user score and unique pandal count
  const updatedUser = await prisma.anonymousUser.update({
    where: { id: user.id },
    data: {
      uniquePandals: { increment: 1 },
      score: { increment: 10 + (pandal.isRare ? 20 : 0) }, // +10 base, +20 for rare
    },
  });

  // Check achievements
  const newAchievements = await checkAndAwardAchievements(
    user.id,
    updatedUser.uniquePandals
  );

  // Rare pandal achievement
  if (pandal.isRare) {
    await awardAchievement(user.id, "rare_pandal");
  }

  // Night darshan achievement (after 8pm)
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 5) {
    const nightAchieved = await awardAchievement(user.id, "night_darshan");
    if (nightAchieved) newAchievements.push("night_darshan");
  }

  // Update quests
  await updateDiscoverQuests(user.id, updatedUser.uniquePandals);

  return NextResponse.json({
    success: true,
    visit,
    pandal: { name: pandal.name, isRare: pandal.isRare },
    scoreEarned: 10 + (pandal.isRare ? 20 : 0),
    newScore: updatedUser.score,
    uniquePandals: updatedUser.uniquePandals,
    newAchievements,
    isDemoMode: isDemoMode || false,
  });
}

/**
 * GET /api/visits — Get user's discovery history
 */
export async function GET(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const visits = await prisma.pandalVisit.findMany({
    where: { userId: user.id, verificationStatus: "VERIFIED" },
    include: {
      pandal: {
        select: {
          id: true,
          name: true,
          city: true,
          latitude: true,
          longitude: true,
          isRare: true,
          photos: {
            where: { moderationStatus: "APPROVED" },
            take: 1,
            orderBy: { likeCount: "desc" },
            select: { imageUrl: true },
          },
        },
      },
    },
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json({ visits });
}
