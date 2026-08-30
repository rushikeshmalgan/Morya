// app/api/squads/route.ts — Create a squad

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { generateSquadCode } from "@/lib/identity";
import { awardAchievement } from "@/lib/achievements";
import { parseOptionalText } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = parseOptionalText(body.name, 60);
  if (body.name !== undefined && body.name !== null && body.name !== "" && !name) {
    return NextResponse.json({ error: "Squad name must be 60 characters or fewer" }, { status: 400 });
  }

  let squad = null;
  for (let attempt = 0; attempt < 5 && !squad; attempt += 1) {
    try {
      squad = await prisma.squad.create({
        data: {
          code: generateSquadCode(),
          name,
          createdBy: user.id,
          members: { create: { userId: user.id } },
        },
        include: { members: true },
      });
    } catch {
      // Codes are short but random; retry a collision instead of failing a user action.
    }
  }
  if (!squad) {
    return NextResponse.json({ error: "Unable to create a unique squad code" }, { status: 503 });
  }

  // Award squad creator achievement
  await awardAchievement(user.id, "squad_creator");

  return NextResponse.json({ squad }, { status: 201 });
}
