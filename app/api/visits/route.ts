// app/api/visits/route.ts — Pandal check-in with GPS verification + anti-cheat

import { NextRequest, NextResponse } from "next/server";
import { Prisma, PandalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requireSession } from "@/lib/auth";
import { haversineDistance, isMovementPlausible } from "@/lib/geo";
import {
  awardAchievement,
  checkAndAwardAchievements,
  updateDiscoverQuests,
  updateNightDarshanQuests,
} from "@/lib/achievements";
import { parseCoordinate } from "@/lib/validation";

const CHECKIN_RADIUS = Number.parseInt(process.env.CHECKIN_RADIUS_METERS || "150", 10);

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`checkin:${user.id}`, 20);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many check-in attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const pandalId = body?.pandalId;
  const demoRequested = body?.isDemoMode === true;
  const demoEnabled = demoRequested && process.env.ALLOW_DEMO_MODE === "true";
  const latitude = parseCoordinate(body?.latitude, "latitude");
  const longitude = parseCoordinate(body?.longitude, "longitude");

  if (typeof pandalId !== "string" || pandalId.length < 10 || (!demoEnabled && (latitude === null || longitude === null))) {
    return NextResponse.json(
      { error: "pandalId and valid latitude and longitude are required" },
      { status: 400 }
    );
  }

  const pandal = await prisma.pandal.findUnique({ where: { id: pandalId } });
  if (!pandal || pandal.status !== PandalStatus.APPROVED) {
    return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
  }

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

  const userLat = demoEnabled ? pandal.latitude : latitude!;
  const userLng = demoEnabled ? pandal.longitude : longitude!;

  if (!demoEnabled) {
    const distance = haversineDistance(userLat, userLng, pandal.latitude, pandal.longitude);
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

    const lastVisit = await prisma.pandalVisit.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
    });
    if (
      lastVisit &&
      !isMovementPlausible(
        lastVisit.latitude,
        lastVisit.longitude,
        lastVisit.timestamp,
        userLat,
        userLng,
        new Date()
      )
    ) {
      return NextResponse.json(
        {
          error: "movement_anomaly",
          message: "Location anomaly detected. Please verify your location.",
        },
        { status: 403 }
      );
    }
  }

  let visit: { id: string; timestamp: Date };
  let updatedUser: { score: number; uniquePandals: number };
  try {
    ({ visit, updatedUser } = await prisma.$transaction(async (tx) => {
      const createdVisit = await tx.pandalVisit.create({
        data: {
          userId: user.id,
          pandalId,
          latitude: userLat,
          longitude: userLng,
          verificationStatus: "VERIFIED",
        },
        select: { id: true, timestamp: true },
      });
      const refreshedUser = await tx.anonymousUser.update({
        where: { id: user.id },
        data: {
          uniquePandals: { increment: 1 },
          score: { increment: 10 + (pandal.isRare ? 20 : 0) },
        },
        select: { score: true, uniquePandals: true },
      });
      return { visit: createdVisit, updatedUser: refreshedUser };
    }));
  } catch (transactionError) {
    if (transactionError instanceof Prisma.PrismaClientKnownRequestError && transactionError.code === "P2002") {
      const concurrentVisit = await prisma.pandalVisit.findUnique({
        where: { userId_pandalId: { userId: user.id, pandalId } },
      });
      return NextResponse.json(
        {
          alreadyDiscovered: true,
          message: "You've already discovered this Bappa!",
          firstVisit: concurrentVisit?.timestamp,
        },
        { status: 409 }
      );
    }
    console.error("POST /api/visits error:", transactionError);
    return NextResponse.json({ error: "Unable to record this visit" }, { status: 500 });
  }

  const newAchievements: string[] = [];
  try {
    newAchievements.push(
      ...(await checkAndAwardAchievements(user.id, updatedUser.uniquePandals))
    );
    if (pandal.isRare && await awardAchievement(user.id, "rare_pandal")) {
      newAchievements.push("rare_pandal");
    }

    const hour = new Date().getHours();
    if (hour >= 20 || hour < 5) {
      if (await awardAchievement(user.id, "night_darshan")) {
        newAchievements.push("night_darshan");
      }
      newAchievements.push(...(await updateNightDarshanQuests(user.id)));
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const visitsToday = await prisma.pandalVisit.count({
      where: { userId: user.id, verificationStatus: "VERIFIED", timestamp: { gte: startOfDay } },
    });
    if (visitsToday >= 3 && await awardAchievement(user.id, "dhol_warrior")) {
      newAchievements.push("dhol_warrior");
    }

    newAchievements.push(...(await updateDiscoverQuests(user.id, updatedUser.uniquePandals)));
  } catch (gamificationError) {
    // The verified visit is the primary action. A transient achievement error
    // should not make a successful check-in look failed to the player.
    console.error("Check-in gamification update failed:", gamificationError);
  }

  const currentUser = await prisma.anonymousUser.findUnique({
    where: { id: user.id },
    select: { score: true, uniquePandals: true },
  });

  return NextResponse.json({
    success: true,
    visit,
    pandal: { name: pandal.name, isRare: pandal.isRare },
    scoreEarned: 10 + (pandal.isRare ? 20 : 0),
    newScore: currentUser?.score ?? updatedUser.score,
    uniquePandals: currentUser?.uniquePandals ?? updatedUser.uniquePandals,
    newAchievements: [...new Set(newAchievements)],
    isDemoMode: demoEnabled,
  });
}

/** GET /api/visits — Get the current user's verified discovery history. */
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
