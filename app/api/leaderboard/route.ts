// app/api/leaderboard/route.ts — Global, city, and squad leaderboards

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBoundedInteger, parseRequiredText } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "global";
  const city = parseRequiredText(searchParams.get("city"), 2, 120);
  const squadId = searchParams.get("squadId");
  const page = parseBoundedInteger(searchParams.get("page"), 1, 1, 1_000);
  const limit = 50;

  if (!page || !["global", "city", "squad"].includes(type)) {
    return NextResponse.json({ error: "Invalid leaderboard parameters" }, { status: 400 });
  }

  if (type === "global") {
    const users = await prisma.anonymousUser.findMany({
      orderBy: [{ uniquePandals: "desc" }, { score: "desc" }, { createdAt: "asc" }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        generatedName: true,
        generatedNumber: true,
        city: true,
        uniquePandals: true,
        score: true,
      },
    });

    const ranked = users.map((u, i) => ({ ...u, rank: (page - 1) * limit + i + 1 }));
    return NextResponse.json({ type: "global", leaderboard: ranked });
  }

  if (type === "city" && city) {
    const users = await prisma.anonymousUser.findMany({
      where: { city: { equals: city } },
      orderBy: [{ uniquePandals: "desc" }, { score: "desc" }, { createdAt: "asc" }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        generatedName: true,
        generatedNumber: true,
        city: true,
        uniquePandals: true,
        score: true,
      },
    });

    const ranked = users.map((u, i) => ({ ...u, rank: (page - 1) * limit + i + 1 }));
    return NextResponse.json({ type: "city", city, leaderboard: ranked });
  }

  if (type === "squad" && squadId) {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                generatedName: true,
                generatedNumber: true,
                uniquePandals: true,
                score: true,
              },
            },
          },
          orderBy: { user: { uniquePandals: "desc" } },
        },
      },
    });

    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    const leaderboard = squad.members.map((m, i) => ({
      ...m.user,
      rank: i + 1,
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json({
      type: "squad",
      squad: { id: squad.id, code: squad.code, name: squad.name },
      leaderboard,
      totalPandals: leaderboard.reduce((sum, u) => sum + u.uniquePandals, 0),
    });
  }

  return NextResponse.json({ error: "Invalid leaderboard type" }, { status: 400 });
}
