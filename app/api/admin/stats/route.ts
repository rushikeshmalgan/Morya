// app/api/admin/stats/route.ts — Admin dashboard statistics

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PandalStatus, ModerationStatus } from "@prisma/client";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "bappa-admin-secret";

function isAdmin(request: NextRequest): boolean {
  return request.headers.get("x-admin-token") === ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
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
