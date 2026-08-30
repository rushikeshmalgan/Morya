// lib/badge-service.ts — Domain-driven event-triggered Badge & Achievement Service

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { BADGE_DEFINITIONS, BadgeDefinition } from "./badge-config";

export interface UnlockBadgeResult {
  unlocked: boolean;
  badge: {
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
  };
  unlockedAt?: Date;
}

export interface UserBadgeProgress {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  threshold: number | null;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt: string | null;
  hidden: boolean;
}

type DbClient = Prisma.TransactionClient | typeof prisma;

export class BadgeService {
  /**
   * Primary atomic unlock helper. Safe against concurrent or repeated attempts.
   */
  static async unlockBadge(
    client: DbClient,
    userId: string,
    badgeKey: string,
    metadata?: Record<string, unknown>
  ): Promise<UnlockBadgeResult | null> {
    const achievement = await client.achievement.findUnique({
      where: { key: badgeKey },
    });

    if (!achievement) return null;

    try {
      const created = await client.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return {
        unlocked: true,
        badge: {
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          rarity: achievement.rarity,
        },
        unlockedAt: created.unlockedAt,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        // Already unlocked — ignore gracefully
        return null;
      }
      throw err;
    }
  }

  /**
   * Event 1: PANDAL_DISCOVERED
   * Evaluates ONLY exploration category badges.
   */
  static async evaluatePandalDiscovered(
    client: DbClient,
    userId: string,
    params: {
      visitId: string;
      pandalId: string;
      isRare: boolean;
      city: string;
      totalUniquePandals: number;
    }
  ): Promise<UnlockBadgeResult[]> {
    const newlyUnlocked: UnlockBadgeResult[] = [];

    // 1. FIRST_DARSHAN (1st pandal)
    if (params.totalUniquePandals >= 1) {
      const u1 = await this.unlockBadge(client, userId, "FIRST_DARSHAN", { pandalId: params.pandalId });
      if (u1) newlyUnlocked.push(u1);
      const uLegacy1 = await this.unlockBadge(client, userId, "first_darshan", { pandalId: params.pandalId });
      if (uLegacy1) newlyUnlocked.push(uLegacy1);
    }

    // 2. BAPPA_EXPLORER (5 pandals)
    if (params.totalUniquePandals >= 5) {
      const u5 = await this.unlockBadge(client, userId, "BAPPA_EXPLORER", { count: params.totalUniquePandals });
      if (u5) newlyUnlocked.push(u5);
      const uLegacy5 = await this.unlockBadge(client, userId, "pandal_5", { count: params.totalUniquePandals });
      if (uLegacy5) newlyUnlocked.push(uLegacy5);
    }

    // 3. PANDAL_HOPPER (10 pandals)
    if (params.totalUniquePandals >= 10) {
      const u10 = await this.unlockBadge(client, userId, "PANDAL_HOPPER", { count: params.totalUniquePandals });
      if (u10) newlyUnlocked.push(u10);
      const uLegacy10 = await this.unlockBadge(client, userId, "pandal_10", { count: params.totalUniquePandals });
      if (uLegacy10) newlyUnlocked.push(uLegacy10);
    }

    // 4. MORYA_MASTER (25 pandals)
    if (params.totalUniquePandals >= 25) {
      const u25 = await this.unlockBadge(client, userId, "MORYA_MASTER", { count: params.totalUniquePandals });
      if (u25) newlyUnlocked.push(u25);
      const uLegacy25 = await this.unlockBadge(client, userId, "pandal_25", { count: params.totalUniquePandals });
      if (uLegacy25) newlyUnlocked.push(uLegacy25);
    }

    // 5. CITY_EXPLORER (10 pandals in same city)
    if (params.city) {
      const cityVisitsCount = await client.pandalVisit.count({
        where: {
          userId,
          verificationStatus: "VERIFIED",
          pandal: { city: params.city },
        },
      });

      if (cityVisitsCount >= 10) {
        const uCity = await this.unlockBadge(client, userId, "CITY_EXPLORER", {
          city: params.city,
          count: cityVisitsCount,
        });
        if (uCity) newlyUnlocked.push(uCity);
      }
    }

    // 6. LEGENDARY_DARSHAN (Rare / iconic pandal)
    if (params.isRare) {
      const uRare = await this.unlockBadge(client, userId, "LEGENDARY_DARSHAN", { pandalId: params.pandalId });
      if (uRare) newlyUnlocked.push(uRare);
      const uLegacyRare = await this.unlockBadge(client, userId, "rare_pandal", { pandalId: params.pandalId });
      if (uLegacyRare) newlyUnlocked.push(uLegacyRare);
    }

    return newlyUnlocked;
  }

  /**
   * Event 2: PHOTO_APPROVED
   * Evaluates ONLY photography category badges.
   */
  static async evaluatePhotoApproved(
    client: DbClient,
    userId: string,
    params: {
      photoId: string;
      isPhotoOfDay?: boolean;
    }
  ): Promise<UnlockBadgeResult[]> {
    const newlyUnlocked: UnlockBadgeResult[] = [];

    // Count approved photos by user
    const approvedPhotoCount = await client.photo.count({
      where: {
        userId,
        moderationStatus: "APPROVED",
      },
    });

    if (approvedPhotoCount >= 5) {
      const uPhoto5 = await this.unlockBadge(client, userId, "BAPPA_PHOTOGRAPHER", { count: approvedPhotoCount });
      if (uPhoto5) newlyUnlocked.push(uPhoto5);
    }

    if (params.isPhotoOfDay) {
      const uLensLegend = await this.unlockBadge(client, userId, "LENS_LEGEND", { photoId: params.photoId });
      if (uLensLegend) newlyUnlocked.push(uLensLegend);
    }

    return newlyUnlocked;
  }

  /**
   * Event 3: YATRA_COMPLETED
   * Evaluates ONLY yatra category badges.
   */
  static async evaluateYatraCompleted(
    client: DbClient,
    userId: string,
    routeId: string
  ): Promise<UnlockBadgeResult[]> {
    const newlyUnlocked: UnlockBadgeResult[] = [];

    // Count completed yatra routes in score transactions
    const yatraCount = await client.scoreTransaction.count({
      where: {
        userId,
        eventType: "ROUTE_COMPLETED",
      },
    });

    if (yatraCount >= 1) {
      const uRookie = await this.unlockBadge(client, userId, "YATRA_ROOKIE", { routeId, count: yatraCount });
      if (uRookie) newlyUnlocked.push(uRookie);
    }

    if (yatraCount >= 5) {
      const uMaster = await this.unlockBadge(client, userId, "YATRA_MASTER", { routeId, count: yatraCount });
      if (uMaster) newlyUnlocked.push(uMaster);
    }

    return newlyUnlocked;
  }

  /**
   * Event 4: STREAK_UPDATED
   * Evaluates ONLY streak category badges.
   */
  static async evaluateStreakUpdated(
    client: DbClient,
    userId: string,
    currentStreak: number
  ): Promise<UnlockBadgeResult[]> {
    const newlyUnlocked: UnlockBadgeResult[] = [];

    if (currentStreak >= 3) {
      const u3 = await this.unlockBadge(client, userId, "THREE_DAY_MORYA", { streak: currentStreak });
      if (u3) newlyUnlocked.push(u3);
    }

    if (currentStreak >= 7) {
      const u7 = await this.unlockBadge(client, userId, "SEVEN_DAY_MORYA", { streak: currentStreak });
      if (u7) newlyUnlocked.push(u7);
    }

    return newlyUnlocked;
  }

  /**
   * Retrieve all badges for a user with earned status & current calculated progress.
   */
  static async getUserBadges(userId: string): Promise<{
    earnedBadges: UserBadgeProgress[];
    lockedBadges: UserBadgeProgress[];
    allBadges: UserBadgeProgress[];
  }> {
    const [achievements, userAchievements, user, approvedPhotosCount, completedYatrasCount] =
      await Promise.all([
        prisma.achievement.findMany({
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
        prisma.userAchievement.findMany({
          where: { userId },
        }),
        prisma.anonymousUser.findUnique({
          where: { id: userId },
          select: { uniquePandals: true, city: true },
        }),
        prisma.photo.count({
          where: { userId, moderationStatus: "APPROVED" },
        }),
        prisma.scoreTransaction.count({
          where: { userId, eventType: "ROUTE_COMPLETED" },
        }),
      ]);

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt.toISOString()])
    );

    // Get city highest visit count if user has city
    let maxCityVisits = 0;
    if (user?.city) {
      maxCityVisits = await prisma.pandalVisit.count({
        where: {
          userId,
          verificationStatus: "VERIFIED",
          pandal: { city: user.city },
        },
      });
    }

    const allBadges: UserBadgeProgress[] = achievements
      .filter((ach) => !ach.hidden || unlockedMap.has(ach.id))
      .map((ach) => {
        const isUnlocked = unlockedMap.has(ach.id);
        const unlockedAt = unlockedMap.get(ach.id) || null;

        // Calculate progress metric based on badge key
        let currentProgress = 0;
        const totalPandals = user?.uniquePandals || 0;

        switch (ach.key) {
          case "FIRST_DARSHAN":
          case "first_darshan":
            currentProgress = Math.min(totalPandals, 1);
            break;
          case "BAPPA_EXPLORER":
          case "pandal_5":
            currentProgress = Math.min(totalPandals, 5);
            break;
          case "PANDAL_HOPPER":
          case "pandal_10":
            currentProgress = Math.min(totalPandals, 10);
            break;
          case "MORYA_MASTER":
          case "pandal_25":
            currentProgress = Math.min(totalPandals, 25);
            break;
          case "CITY_EXPLORER":
            currentProgress = Math.min(maxCityVisits, 10);
            break;
          case "BAPPA_PHOTOGRAPHER":
            currentProgress = Math.min(approvedPhotosCount, 5);
            break;
          case "YATRA_ROOKIE":
            currentProgress = Math.min(completedYatrasCount, 1);
            break;
          case "YATRA_MASTER":
            currentProgress = Math.min(completedYatrasCount, 5);
            break;
          default:
            currentProgress = isUnlocked ? (ach.threshold || 1) : 0;
            break;
        }

        return {
          key: ach.key,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          rarity: ach.rarity,
          threshold: ach.threshold,
          currentProgress,
          unlocked: isUnlocked,
          unlockedAt,
          hidden: ach.hidden,
        };
      });

    return {
      earnedBadges: allBadges.filter((b) => b.unlocked),
      lockedBadges: allBadges.filter((b) => !b.unlocked),
      allBadges,
    };
  }
}
