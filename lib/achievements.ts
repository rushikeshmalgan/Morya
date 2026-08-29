// lib/achievements.ts — Achievement unlock logic

import { prisma } from "./prisma";

const ACHIEVEMENT_THRESHOLDS = {
  first_darshan: 1,
  pandal_5: 5,
  pandal_10: 10,
  pandal_25: 25,
  pandal_50: 50,
};

/**
 * Check and award pandal-count based achievements after a discovery
 */
export async function checkAndAwardAchievements(
  userId: string,
  uniquePandalsCount: number
): Promise<string[]> {
  const newlyUnlocked: string[] = [];

  // Get all count-based achievement keys user hasn't unlocked yet
  const existing = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const existingIds = new Set(existing.map((e) => e.achievementId));

  for (const [key, threshold] of Object.entries(ACHIEVEMENT_THRESHOLDS)) {
    if (uniquePandalsCount >= threshold) {
      // Find achievement by key
      const achievement = await prisma.achievement.findUnique({ where: { key } });
      if (achievement && !existingIds.has(achievement.id)) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        newlyUnlocked.push(key);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Award a specific achievement by key
 */
export async function awardAchievement(
  userId: string,
  key: string
): Promise<boolean> {
  const achievement = await prisma.achievement.findUnique({ where: { key } });
  if (!achievement) return false;

  try {
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    return true;
  } catch {
    // Already unlocked (unique constraint)
    return false;
  }
}

/**
 * Update quest progress for DISCOVER_N type quests
 */
export async function updateDiscoverQuests(
  userId: string,
  uniquePandalsCount: number
): Promise<void> {
  const activeQuests = await prisma.quest.findMany({
    where: {
      type: "DISCOVER_N",
      isActive: true,
      activeUntil: { gte: new Date() },
    },
  });

  for (const quest of activeQuests) {
    const userQuest = await prisma.userQuest.upsert({
      where: { userId_questId: { userId, questId: quest.id } },
      create: { userId, questId: quest.id, progress: uniquePandalsCount },
      update: { progress: uniquePandalsCount },
    });

    if (!userQuest.completed && uniquePandalsCount >= quest.requirement) {
      await prisma.userQuest.update({
        where: { userId_questId: { userId, questId: quest.id } },
        data: {
          completed: true,
          completedAt: new Date(),
          progress: quest.requirement,
        },
      });
      // Award quest reward
      await prisma.anonymousUser.update({
        where: { id: userId },
        data: { score: { increment: quest.reward } },
      });
    }
  }
}
