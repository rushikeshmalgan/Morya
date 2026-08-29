// app/api/squads/join/route.ts — Join a squad by code

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const { code } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Squad code required" }, { status: 400 });
  }

  const squad = await prisma.squad.findUnique({
    where: { code: code.toUpperCase() },
    include: { members: true },
  });

  if (!squad) {
    return NextResponse.json(
      { error: "Squad not found. Check your code and try again." },
      { status: 404 }
    );
  }

  // Already a member?
  const alreadyMember = squad.members.some((m) => m.userId === user.id);
  if (alreadyMember) {
    return NextResponse.json({ squad, alreadyMember: true });
  }

  // Max 20 members per squad
  if (squad.members.length >= 20) {
    return NextResponse.json(
      { error: "This squad is full (max 20 members)." },
      { status: 409 }
    );
  }

  await prisma.squadMember.create({
    data: { squadId: squad.id, userId: user.id },
  });

  const updatedSquad = await prisma.squad.findUnique({
    where: { id: squad.id },
    include: {
      members: {
        include: {
          user: {
            select: { generatedName: true, generatedNumber: true, uniquePandals: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ squad: updatedSquad, joined: true });
}
