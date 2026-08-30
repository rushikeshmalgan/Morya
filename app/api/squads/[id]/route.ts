// app/api/squads/[id]/route.ts — Retrieve the current member's squad roster.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireSession(request);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.squadMember.findUnique({
    where: { squadId_userId: { squadId: id, userId: user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Squad not found" }, { status: 404 });

  const squad = await prisma.squad.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              generatedName: true,
              generatedNumber: true,
              city: true,
              uniquePandals: true,
              score: true,
            },
          },
        },
        orderBy: { user: { uniquePandals: "desc" } },
      },
    },
  });
  if (!squad) return NextResponse.json({ error: "Squad not found" }, { status: 404 });

  return NextResponse.json({
    squad: {
      id: squad.id,
      code: squad.code,
      name: squad.name,
      createdAt: squad.createdAt,
      members: squad.members.map((member, index) => ({
        ...member.user,
        joinedAt: member.joinedAt,
        rank: index + 1,
      })),
    },
  });
}
