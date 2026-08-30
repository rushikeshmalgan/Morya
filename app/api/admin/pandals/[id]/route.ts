// app/api/admin/pandals/[id]/route.ts — Admin moderation for pandal submissions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { awardAchievement } from "@/lib/achievements";
import { PandalStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { status, isNew, isRare } = body;

  if (!Object.values(PandalStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if ((isNew !== undefined && typeof isNew !== "boolean") || (isRare !== undefined && typeof isRare !== "boolean")) {
    return NextResponse.json({ error: "isNew and isRare must be booleans" }, { status: 400 });
  }

  const pandal = await prisma.pandal.findUnique({ where: { id } });
  if (!pandal) {
    return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
  }

  const previousStatus = pandal.status;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPandal = await tx.pandal.update({
      where: { id },
      data: {
        status,
        ...(isNew !== undefined && { isNew }),
        ...(isRare !== undefined && { isRare }),
      },
    });

    if (previousStatus === PandalStatus.PENDING && status === PandalStatus.APPROVED) {
      await tx.photo.updateMany({
        where: { pandalId: id, moderationStatus: "PENDING" },
        data: { moderationStatus: "APPROVED" },
      });
    }

    if (status === PandalStatus.REJECTED) {
      await tx.photo.updateMany({
        where: { pandalId: id, moderationStatus: "PENDING" },
        data: { moderationStatus: "REJECTED" },
      });
    }

    return updatedPandal;
  });

  // Award Pandal Pioneer achievement when a submission is approved
  if (previousStatus === PandalStatus.PENDING && status === PandalStatus.APPROVED && pandal.submittedBy) {
    await awardAchievement(pandal.submittedBy, "pandal_pioneer");
  }

  return NextResponse.json({ pandal: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.pandal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
