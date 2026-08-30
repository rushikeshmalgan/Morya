// app/api/admin/stats/route.ts — Admin dashboard statistics

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { PandalStatus, ModerationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    pendingPandals,
    approvedPandals,
    pendingPhotos,
    totalUsers,
  ] = await Promise.all([
    prisma.pandal.count({ where: { status: PandalStatus.PENDING } }),
    prisma.pandal.count({ where: { status: PandalStatus.APPROVED } }),
    prisma.photo.count({ where: { moderationStatus: ModerationStatus.PENDING } }),
    prisma.anonymousUser.count(),
  ]);

  return NextResponse.json({
    pendingPandals,
    approvedPandals,
    pendingPhotos,
    totalUsers,
  });
}
