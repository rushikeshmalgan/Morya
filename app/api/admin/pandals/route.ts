// app/api/admin/pandals/route.ts — List pandals for admin moderation

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PandalStatus } from "@prisma/client";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "bappa-admin-secret";

function isAdmin(request: NextRequest): boolean {
  return request.headers.get("x-admin-token") === ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as PandalStatus | null;

  const where: Record<string, unknown> = {};
  if (status && Object.values(PandalStatus).includes(status)) {
    where.status = status;
  }

  const pandals = await prisma.pandal.findMany({
    where,
    include: {
      photos: { take: 1, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with submitter info
  const submitterIds = pandals.map((p) => p.submittedBy).filter(Boolean) as string[];
  const submitters = await prisma.anonymousUser.findMany({
    where: { id: { in: submitterIds } },
    select: { id: true, generatedName: true, generatedNumber: true },
  });
  const submitterMap = new Map(submitters.map((s) => [s.id, s]));

  const enriched = pandals.map((p) => ({
    ...p,
    submitter: p.submittedBy ? submitterMap.get(p.submittedBy) || null : null,
  }));

  return NextResponse.json({ pandals: enriched });
}
