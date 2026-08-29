// app/api/quests/active/route.ts — Get active quests with user progress

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const now = new Date();
  const user = await getSessionUser(request);

  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      activeFrom: { lte: now },
      activeUntil: { gte: now },
    },
    orderBy: { requirement: "asc" },
  });

  if (!user) {
    return NextResponse.json({ quests: quests.map((q) => ({ ...q, progress: 0, completed: false })) });
  }

  // Get user's progress on each quest
  const userQuests = await prisma.userQuest.findMany({
    where: {
      userId: user.id,
      questId: { in: quests.map((q) => q.id) },
    },
  });

  const progressMap = new Map(userQuests.map((uq) => [uq.questId, uq]));

  const questsWithProgress = quests.map((quest) => {
    const userQuest = progressMap.get(quest.id);
    return {
      ...quest,
      progress: userQuest?.progress || 0,
      completed: userQuest?.completed || false,
      completedAt: userQuest?.completedAt || null,
    };
  });

  return NextResponse.json({ quests: questsWithProgress });
}
