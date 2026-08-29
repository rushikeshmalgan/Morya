// app/api/pandals/[id]/route.ts — Get full pandal details

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser(request);

  const pandal = await prisma.pandal.findUnique({
    where: { id },
    include: {
      photos: {
        where: { moderationStatus: "APPROVED" },
        orderBy: { likeCount: "desc" },
        take: 20,
        select: {
          id: true,
          imageUrl: true,
          likeCount: true,
          category: true,
          timestamp: true,
          user: { select: { generatedName: true, generatedNumber: true } },
        },
      },
      _count: { select: { visits: true, photos: true } },
    },
  });

  if (!pandal) {
    return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
  }

  // Check if current user has discovered this pandal
  let userVisit = null;
  if (user) {
    userVisit = await prisma.pandalVisit.findUnique({
      where: { userId_pandalId: { userId: user.id, pandalId: id } },
    });
  }

  return NextResponse.json({
    ...pandal,
    isDiscoveredByUser: !!userVisit,
    userFirstVisit: userVisit?.timestamp || null,
  });
}
