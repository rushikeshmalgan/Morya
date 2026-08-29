// app/api/squads/route.ts — Create a squad

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { generateSquadCode } from "@/lib/identity";
import { awardAchievement } from "@/lib/achievements";

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { name } = body;

  // Generate unique code
  let code = generateSquadCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.squad.findUnique({ where: { code } });
    if (!existing) break;
    code = generateSquadCode();
    attempts++;
  }

  const squad = await prisma.squad.create({
    data: {
      code,
      name: name || null,
      createdBy: user.id,
      members: {
        create: { userId: user.id },
      },
    },
    include: { members: true },
  });

  // Award squad creator achievement
  await awardAchievement(user.id, "squad_creator");

  return NextResponse.json({ squad }, { status: 201 });
}
