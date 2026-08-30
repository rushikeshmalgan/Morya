// app/api/me/badges/route.ts — Get authenticated user's badge collection with progress metrics

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { BadgeService } from "@/lib/badge-service";

export async function GET(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { earnedBadges, lockedBadges, allBadges } = await BadgeService.getUserBadges(user.id);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      generatedName: user.generatedName,
      generatedNumber: user.generatedNumber,
    },
    totalBadges: allBadges.length,
    earnedCount: earnedBadges.length,
    earnedBadges,
    lockedBadges,
    allBadges,
  });
}
