// app/api/photos/[id]/vote/route.ts — Vote on a photo (1 per user per photo)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // Check if already voted
  const existing = await prisma.photoVote.findUnique({
    where: { userId_photoId: { userId: user.id, photoId } },
  });

  if (existing) {
    // Toggle: remove vote
    await prisma.$transaction([
      prisma.photoVote.delete({
        where: { userId_photoId: { userId: user.id, photoId } },
      }),
      prisma.photo.update({
        where: { id: photoId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ voted: false });
  }

  // Add vote
  await prisma.$transaction([
    prisma.photoVote.create({
      data: { userId: user.id, photoId },
    }),
    prisma.photo.update({
      where: { id: photoId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ voted: true });
}
