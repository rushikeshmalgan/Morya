// lib/score-service.ts — Domain service for authoritative score calculation & ledger transactions

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { SCORE_RULES, ScoreEventType } from "./score-config";

export interface AwardScoreParams {
  userId: string;
  eventType: ScoreEventType;
  referenceType?: string;
  referenceId?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  customPoints?: number;
}

export interface AwardScoreResult {
  awarded: boolean;
  points: number;
  eventType: ScoreEventType;
  idempotencyKey: string;
  transactionId?: string;
}

type DbClient = Prisma.TransactionClient | typeof prisma;

export class ScoreService {
  /**
   * Primary entry point: Award points atomically with idempotency protection.
   */
  static async awardScore(
    client: DbClient,
    params: AwardScoreParams
  ): Promise<AwardScoreResult> {
    const points = params.customPoints ?? SCORE_RULES[params.eventType];

    // Check if idempotencyKey has already been processed
    const existing = await client.scoreTransaction.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });

    if (existing) {
      return {
        awarded: false,
        points: 0,
        eventType: params.eventType,
        idempotencyKey: params.idempotencyKey,
        transactionId: existing.id,
      };
    }

    try {
      // Execute score ledger creation and user score increment atomically
      const createdTx = await client.scoreTransaction.create({
        data: {
          userId: params.userId,
          eventType: params.eventType,
          points,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          idempotencyKey: params.idempotencyKey,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });

      await client.anonymousUser.update({
        where: { id: params.userId },
        data: { score: { increment: points } },
      });

      return {
        awarded: true,
        points,
        eventType: params.eventType,
        idempotencyKey: params.idempotencyKey,
        transactionId: createdTx.id,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        // Concurrent duplicate request caught by unique idempotencyKey constraint
        return {
          awarded: false,
          points: 0,
          eventType: params.eventType,
          idempotencyKey: params.idempotencyKey,
        };
      }
      throw err;
    }
  }

  /**
   * Process pandal discovery and associated discovery bonuses.
   */
  static async processPandalDiscovery(
    client: DbClient,
    params: {
      userId: string;
      pandalId: string;
      visitId: string;
      isRare: boolean;
      totalUniquePandals: number;
      visitTimestamp?: Date;
    }
  ): Promise<AwardScoreResult[]> {
    const results: AwardScoreResult[] = [];
    const timestamp = params.visitTimestamp || new Date();
    const dateStr = timestamp.toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Base Pandal Discovery XP (+50 or +100 for rare)
    const discoveryEvent: ScoreEventType = params.isRare
      ? "RARE_PANDAL_DISCOVERY"
      : "PANDAL_DISCOVERY";
    const baseResult = await this.awardScore(client, {
      userId: params.userId,
      eventType: discoveryEvent,
      referenceType: "pandal_visit",
      referenceId: params.visitId,
      idempotencyKey: `${discoveryEvent.toLowerCase()}:${params.userId}:${params.pandalId}`,
      metadata: { pandalId: params.pandalId, isRare: params.isRare },
    });
    results.push(baseResult);

    // 2. First discovery of the day bonus (+20)
    const startOfDay = new Date(timestamp);
    startOfDay.setHours(0, 0, 0, 0);

    const visitsToday = await client.pandalVisit.count({
      where: {
        userId: params.userId,
        verificationStatus: "VERIFIED",
        timestamp: { gte: startOfDay },
      },
    });

    if (visitsToday === 1) {
      const firstDayResult = await this.awardScore(client, {
        userId: params.userId,
        eventType: "FIRST_DISCOVERY_OF_DAY",
        referenceType: "pandal_visit",
        referenceId: params.visitId,
        idempotencyKey: `first_discovery_day:${params.userId}:${dateStr}`,
        metadata: { date: dateStr, pandalId: params.pandalId },
      });
      if (firstDayResult.awarded) results.push(firstDayResult);
    }

    // 3. Discover 3 pandals in one day bonus (+75)
    if (visitsToday >= 3) {
      const tripleResult = await this.awardScore(client, {
        userId: params.userId,
        eventType: "DISCOVER_3_SAME_DAY",
        referenceType: "pandal_visit",
        referenceId: params.visitId,
        idempotencyKey: `discover_3_same_day:${params.userId}:${dateStr}`,
        metadata: { date: dateStr, count: visitsToday },
      });
      if (tripleResult.awarded) results.push(tripleResult);
    }

    // 4. Milestone: 10 Unique Pandals (+100)
    if (params.totalUniquePandals >= 10) {
      const milestoneResult = await this.awardScore(client, {
        userId: params.userId,
        eventType: "UNIQUE_PANDALS_10",
        referenceType: "milestone",
        referenceId: "10_unique_pandals",
        idempotencyKey: `unique_pandals_10:${params.userId}`,
        metadata: { uniquePandals: params.totalUniquePandals },
      });
      if (milestoneResult.awarded) results.push(milestoneResult);
    }

    return results;
  }

  /**
   * Process photo approval score reward (+20).
   */
  static async processPhotoApproval(
    client: DbClient,
    photoId: string,
    userId: string
  ): Promise<AwardScoreResult> {
    return this.awardScore(client, {
      userId,
      eventType: "PHOTO_APPROVED",
      referenceType: "photo",
      referenceId: photoId,
      idempotencyKey: `photo_approved:${photoId}`,
      metadata: { photoId },
    });
  }

  /**
   * Process photo reaching 10 community upvotes reward (+25).
   */
  static async processPhoto10Votes(
    client: DbClient,
    photoId: string,
    userId: string
  ): Promise<AwardScoreResult> {
    return this.awardScore(client, {
      userId,
      eventType: "PHOTO_10_VOTES",
      referenceType: "photo",
      referenceId: photoId,
      idempotencyKey: `photo_10_votes:${photoId}`,
      metadata: { photoId },
    });
  }

  /**
   * Process quest completion reward (+100).
   */
  static async processQuestCompletion(
    client: DbClient,
    userId: string,
    questId: string
  ): Promise<AwardScoreResult> {
    return this.awardScore(client, {
      userId,
      eventType: "QUEST_COMPLETED",
      referenceType: "quest",
      referenceId: questId,
      idempotencyKey: `quest_completed:${userId}:${questId}`,
      metadata: { questId },
    });
  }

  /**
   * Process multi-pandal Darshan Yatra route completion reward (+150).
   */
  static async processRouteCompletion(
    client: DbClient,
    userId: string,
    routeId: string,
    metadata?: Record<string, unknown>
  ): Promise<AwardScoreResult> {
    return this.awardScore(client, {
      userId,
      eventType: "ROUTE_COMPLETED",
      referenceType: "route",
      referenceId: routeId,
      idempotencyKey: `route_completed:${userId}:${routeId}`,
      metadata,
    });
  }

  /**
   * Process streak milestone rewards (3-day +50, 7-day +150).
   */
  static async processStreakMilestone(
    client: DbClient,
    userId: string,
    currentStreak: number,
    streakCycleKey: string
  ): Promise<AwardScoreResult[]> {
    const results: AwardScoreResult[] = [];

    if (currentStreak >= 3) {
      const res3 = await this.awardScore(client, {
        userId,
        eventType: "STREAK_3_DAY",
        referenceType: "streak",
        referenceId: `3_day_${streakCycleKey}`,
        idempotencyKey: `streak_3_day:${userId}:${streakCycleKey}`,
        metadata: { streak: currentStreak },
      });
      if (res3.awarded) results.push(res3);
    }

    if (currentStreak >= 7) {
      const res7 = await this.awardScore(client, {
        userId,
        eventType: "STREAK_7_DAY",
        referenceType: "streak",
        referenceId: `7_day_${streakCycleKey}`,
        idempotencyKey: `streak_7_day:${userId}:${streakCycleKey}`,
        metadata: { streak: currentStreak },
      });
      if (res7.awarded) results.push(res7);
    }

    return results;
  }

  /**
   * Get user score ledger history (paginated).
   */
  static async getUserScoreLedger(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [transactions, totalCount, user] = await Promise.all([
      prisma.scoreTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.scoreTransaction.count({ where: { userId } }),
      prisma.anonymousUser.findUnique({
        where: { id: userId },
        select: { score: true, uniquePandals: true },
      }),
    ]);

    return {
      score: user?.score ?? 0,
      uniquePandals: user?.uniquePandals ?? 0,
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Audit/recalculate cached user total score from ledger.
   */
  static async recalculateUserScore(userId: string): Promise<number> {
    const aggregate = await prisma.scoreTransaction.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    const calculatedTotal = aggregate._sum.points ?? 0;

    await prisma.anonymousUser.update({
      where: { id: userId },
      data: { score: calculatedTotal },
    });

    return calculatedTotal;
  }
}
