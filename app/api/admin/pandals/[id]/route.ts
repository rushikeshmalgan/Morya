// app/api/admin/pandals/[id]/route.ts — Admin moderation for pandal submissions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardAchievement } from "@/lib/achievements";
import { PandalStatus } from "@prisma/client";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "bappa-admin-secret";

function isAdmin(request: NextRequest): boolean {
  return request.headers.get("x-admin-token") === ADMIN_TOKEN;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, isNew, isRare } = body;

  if (!Object.values(PandalStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const pandal = await prisma.pandal.findUnique({ where: { id } });
  if (!pandal) {
    return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
  }

  const previousStatus = pandal.status;

  const updated = await prisma.pandal.update({
    where: { id },
    data: {
      status,
      ...(isNew !== undefined && { isNew }),
      ...(isRare !== undefined && { isRare }),
    },
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
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.pandal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
