// app/api/routes/complete/route.ts — Multi-pandal Darshan Yatra route completion verification & score award

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requireSession } from "@/lib/auth";
import { ScoreService } from "@/lib/score-service";

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`route-complete:${user.id}`, 20);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many route completion attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const routeId = body?.routeId;
  const visitedPandalIds = body?.visitedPandalIds;

  if (
    typeof routeId !== "string" ||
    routeId.trim().length < 3 ||
    !Array.isArray(visitedPandalIds) ||
    visitedPandalIds.length === 0
  ) {
    return NextResponse.json(
      { error: "routeId and non-empty visitedPandalIds array are required" },
      { status: 400 }
    );
  }

  // Server-side Anti-cheat validation: Verify user has actually verified visits for all required pandals
  const userVisits = await prisma.pandalVisit.findMany({
    where: {
      userId: user.id,
      pandalId: { in: visitedPandalIds },
      verificationStatus: "VERIFIED",
    },
    select: { pandalId: true },
  });

  const verifiedPandalSet = new Set(userVisits.map((v) => v.pandalId));
  const missingPandals = visitedPandalIds.filter((id) => !verifiedPandalSet.has(id));

  if (missingPandals.length > 0) {
    return NextResponse.json(
      {
        error: "route_incomplete",
        message: "You have not verified visits to all pandals in this Darshan Yatra route.",
        missingPandals,
      },
      { status: 403 }
    );
  }

  // Atomically award ROUTE_COMPLETED (+150)
  const awardResult = await ScoreService.processRouteCompletion(prisma, user.id, routeId, {
    routeId,
    visitedPandalCount: visitedPandalIds.length,
  });

  const currentUser = await prisma.anonymousUser.findUnique({
    where: { id: user.id },
    select: { score: true },
  });

  return NextResponse.json({
    success: true,
    routeId,
    awarded: awardResult.awarded,
    pointsAwarded: awardResult.points,
    newScore: currentUser?.score ?? 0,
    message: awardResult.awarded
      ? "Darshan Yatra completed! +150 XP awarded."
      : "You have already claimed XP for completing this Darshan Yatra route.",
  });
}
