// app/api/photos/[id]/vote/route.ts — Toggle one vote per user on a public photo.

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requireSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }
  if (photoId.length < 10) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const { allowed } = checkRateLimit(`photo-vote:${user.id}`, 120);
  if (!allowed) {
    return NextResponse.json({ error: "Too many votes. Please try again later." }, { status: 429 });
  }

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      moderationStatus: "APPROVED",
      pandal: { is: { status: "APPROVED" } },
    },
    select: { id: true },
  });
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  const existingVote = await prisma.photoVote.findUnique({
    where: { userId_photoId: { userId: user.id, photoId } },
  });

  if (existingVote) {
    const updatedPhoto = await prisma.$transaction(async (tx) => {
      await tx.photoVote.delete({ where: { userId_photoId: { userId: user.id, photoId } } });
      return tx.photo.update({
        where: { id: photoId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
    });
    return NextResponse.json({ voted: false, likeCount: Math.max(0, updatedPhoto.likeCount) });
  }

  try {
    const updatedPhoto = await prisma.$transaction(async (tx) => {
      await tx.photoVote.create({ data: { userId: user.id, photoId } });
      return tx.photo.update({
        where: { id: photoId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });
    });
    return NextResponse.json({ voted: true, likeCount: updatedPhoto.likeCount });
  } catch (voteError) {
    if (voteError instanceof Prisma.PrismaClientKnownRequestError && voteError.code === "P2002") {
      const latest = await prisma.photo.findUnique({
        where: { id: photoId },
        select: { likeCount: true },
      });
      return NextResponse.json({ voted: true, likeCount: latest?.likeCount ?? 0 });
    }
    console.error("POST /api/photos/[id]/vote error:", voteError);
    return NextResponse.json({ error: "Unable to update vote" }, { status: 500 });
  }
}
