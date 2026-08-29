// app/api/photos/route.ts — Photo feed (Bappa Lens)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ModerationStatus, PhotoCategory } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category") as PhotoCategory | null;
  const photoOfDay = searchParams.get("photoOfDay") === "true";
  const featured = searchParams.get("featured") === "true";
  const pandalId = searchParams.get("pandalId");

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    moderationStatus: ModerationStatus.APPROVED,
  };

  if (category) where.category = category;
  if (photoOfDay) where.isPhotoOfDay = true;
  if (featured) where.isFeatured = true;
  if (pandalId) where.pandalId = pandalId;

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where,
      include: {
        user: { select: { generatedName: true, generatedNumber: true } },
        pandal: { select: { name: true, city: true } },
      },
      orderBy: [{ isPhotoOfDay: "desc" }, { isFeatured: "desc" }, { likeCount: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.photo.count({ where }),
  ]);

  return NextResponse.json({
    photos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + photos.length < total,
    },
  });
}
