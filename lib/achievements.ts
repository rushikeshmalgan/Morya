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
async function updateQuestProgress(
  userId: string,
  type: "DISCOVER_N" | "PHOTO_SUBMIT" | "NIGHT_DARSHAN" | "FIND_UNKNOWN",
  progress: number
): Promise<string[]> {
  const activeQuests = await prisma.quest.findMany({
    where: {
      type,
      isActive: true,
      activeFrom: { lte: new Date() },
      activeUntil: { gte: new Date() },
    },
  });

  let newlyCompleted = 0;

  for (const quest of activeQuests) {
    await prisma.userQuest.upsert({
      where: { userId_questId: { userId, questId: quest.id } },
      create: { userId, questId: quest.id, progress: Math.min(progress, quest.requirement) },
      update: { progress: Math.min(progress, quest.requirement) },
    });

    if (progress >= quest.requirement) {
      const completion = await prisma.userQuest.updateMany({
        where: { userId, questId: quest.id, completed: false },
        data: {
          completed: true,
          completedAt: new Date(),
          progress: quest.requirement,
        },
      });
      if (completion.count > 0) {
        newlyCompleted += completion.count;
        await prisma.anonymousUser.update({
          where: { id: userId },
          data: { score: { increment: quest.reward } },
        });
      }
    }
  }

  if (newlyCompleted === 0) return [];

  const completedCount = await prisma.userQuest.count({
    where: { userId, completed: true },
  });
  const unlocked: string[] = [];
  if (completedCount >= 1 && await awardAchievement(userId, "quest_complete_1")) {
    unlocked.push("quest_complete_1");
  }
  if (completedCount >= 5 && await awardAchievement(userId, "quest_complete_5")) {
    unlocked.push("quest_complete_5");
  }

  return unlocked;
}

/** Update progress for count-based pandal discovery quests. */
export async function updateDiscoverQuests(
  userId: string,
  uniquePandalsCount: number
): Promise<string[]> {
  return updateQuestProgress(userId, "DISCOVER_N", uniquePandalsCount);
}

export async function updatePhotoQuests(userId: string): Promise<string[]> {
  return updateQuestProgress(userId, "PHOTO_SUBMIT", 1);
}

export async function updateNightDarshanQuests(userId: string): Promise<string[]> {
  return updateQuestProgress(userId, "NIGHT_DARSHAN", 1);
}

export async function updatePandalSubmissionQuests(userId: string): Promise<string[]> {
  return updateQuestProgress(userId, "FIND_UNKNOWN", 1);
}
