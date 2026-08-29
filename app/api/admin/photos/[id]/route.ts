// app/api/admin/photos/[id]/route.ts — Admin moderation for photo submissions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ModerationStatus } from "@prisma/client";

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
  const { moderationStatus } = body;

  if (!Object.values(ModerationStatus).includes(moderationStatus)) {
    return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 });
  }

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const updated = await prisma.photo.update({
    where: { id },
    data: { moderationStatus },
    include: {
      user: { select: { generatedName: true, generatedNumber: true } },
      pandal: { select: { name: true, city: true } },
    },
  });

  return NextResponse.json({ photo: updated });
}
