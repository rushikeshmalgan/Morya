// app/api/squads/join/route.ts — Join a squad by code

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { code } = body || {};

  if (!code || typeof code !== "string" || code.trim().length > 32) {
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

  try {
    await prisma.$transaction(async (tx) => {
      const memberCount = await tx.squadMember.count({ where: { squadId: squad.id } });
      if (memberCount >= 20) throw new Error("squad_full");
      await tx.squadMember.create({ data: { squadId: squad.id, userId: user.id } });
    });
  } catch (joinError) {
    if (joinError instanceof Error && joinError.message === "squad_full") {
      return NextResponse.json({ error: "This squad is full (max 20 members)." }, { status: 409 });
    }
    const latestMembership = await prisma.squadMember.findUnique({
      where: { squadId_userId: { squadId: squad.id, userId: user.id } },
    });
    if (latestMembership) return NextResponse.json({ squad, alreadyMember: true });
    console.error("POST /api/squads/join error:", joinError);
    return NextResponse.json({ error: "Unable to join squad" }, { status: 500 });
  }

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
