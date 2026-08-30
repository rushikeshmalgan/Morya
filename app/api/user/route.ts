// app/api/user/route.ts — Create anonymous user

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBappaIdentity } from "@/lib/identity";
import { generateSessionToken } from "@/lib/auth";

/**
 * POST /api/user
 * Body: { deviceId: string }
 * Returns: { userId, sessionToken, generatedName, generatedNumber, city }
 *
 * Flow:
 * 1. Browser generates UUID v4 (client-side)
 * 2. POST here with that deviceId
 * 3. Server creates or finds existing user
 * 4. Server returns session token for all future authenticated requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId || typeof deviceId !== "string" || deviceId.length < 10 || deviceId.length > 128) {
      return NextResponse.json(
        { error: "Invalid deviceId" },
        { status: 400 }
      );
    }

    // Check if user already exists for this device
    const existing = await prisma.anonymousUser.findUnique({
      where: { deviceId },
    });

    if (existing) {
      return NextResponse.json({
        userId: existing.id,
        sessionToken: existing.sessionToken,
        generatedName: existing.generatedName,
        generatedNumber: existing.generatedNumber,
        city: existing.city,
        score: existing.score,
        uniquePandals: existing.uniquePandals,
      });
    }

    // Create new user
    const { generatedName, generatedNumber } = generateBappaIdentity();
    const sessionToken = generateSessionToken();

    const user = await prisma.anonymousUser.create({
      data: {
        deviceId,
        sessionToken,
        generatedName,
        generatedNumber,
      },
    });

    return NextResponse.json({
      userId: user.id,
      sessionToken: user.sessionToken,
      generatedName: user.generatedName,
      generatedNumber: user.generatedNumber,
      city: user.city,
      score: user.score,
      uniquePandals: user.uniquePandals,
    });
  } catch (error) {
    console.error("POST /api/user error:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user
 * Header: x-session-token
 * Returns current user data
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("x-session-token");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.anonymousUser.findUnique({
    where: { sessionToken: token },
    include: {
      visits: { select: { pandalId: true, timestamp: true } },
      achievements: {
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      },
      squadMemberships: {
        include: {
          squad: {
            include: {
              members: {
                include: { user: { select: { generatedName: true, generatedNumber: true, uniquePandals: true, score: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    generatedName: user.generatedName,
    generatedNumber: user.generatedNumber,
    city: user.city,
    score: user.score,
    uniquePandals: user.uniquePandals,
    createdAt: user.createdAt,
    visits: user.visits,
    achievements: user.achievements,
    squadMemberships: user.squadMemberships,
  });
}
