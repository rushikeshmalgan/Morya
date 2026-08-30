// app/api/admin/photos/route.ts — List photos for admin moderation

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { ModerationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moderationStatus = searchParams.get("moderationStatus") as ModerationStatus | null;

  const where: Record<string, unknown> = {};
  if (moderationStatus && Object.values(ModerationStatus).includes(moderationStatus)) {
    where.moderationStatus = moderationStatus;
  }

  const photos = await prisma.photo.findMany({
    where,
    include: {
      user: { select: { generatedName: true, generatedNumber: true } },
      pandal: { select: { name: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ photos });
}
