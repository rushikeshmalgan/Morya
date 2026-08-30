// app/api/admin/photos/[id]/route.ts — Admin moderation for photo submissions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { ModerationStatus } from "@prisma/client";
import { ScoreService } from "@/lib/score-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { moderationStatus } = body;

  if (!Object.values(ModerationStatus).includes(moderationStatus)) {
    return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 });
  }

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  let scoreAwarded = false;
  const updated = await prisma.$transaction(async (tx) => {
    const updatedPhoto = await tx.photo.update({
      where: { id },
      data: { moderationStatus },
      include: {
        user: { select: { generatedName: true, generatedNumber: true } },
        pandal: { select: { name: true, city: true } },
      },
    });

    if (moderationStatus === ModerationStatus.APPROVED) {
      const award = await ScoreService.processPhotoApproval(tx, photo.id, photo.userId);
      scoreAwarded = award.awarded;
    }

    return updatedPhoto;
  });

  return NextResponse.json({ photo: updated, scoreAwarded });
}
