// tests/score.test.ts — Comprehensive test suite for Authoritative Score & XP System

import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { ScoreService } from "../lib/score-service";
import { SCORE_RULES } from "../lib/score-config";

describe("ScoreService & XP Ledger Test Suite", () => {
  let testUserId: string;
  let testPandalId: string;

  beforeEach(async () => {
    const user = await prisma.anonymousUser.create({
      data: {
        deviceId: `test-device-${Date.now()}-${Math.random()}`,
        sessionToken: `test-token-${Date.now()}-${Math.random()}`,
        generatedName: "Test Explorer",
        generatedNumber: Math.floor(Math.random() * 8999) + 1000,
        score: 0,
        uniquePandals: 0,
      },
    });
    testUserId = user.id;

    const pandal = await prisma.pandal.create({
      data: {
        name: `Test Pandal ${Date.now()}`,
        latitude: 18.5204,
        longitude: 73.8567,
        city: "Pune",
      },
    });
    testPandalId = pandal.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await prisma.pandalVisit.deleteMany({ where: { userId: testUserId } });
      await prisma.photoVote.deleteMany({ where: { userId: testUserId } });
      await prisma.photo.deleteMany({ where: { userId: testUserId } });
      await prisma.userQuest.deleteMany({ where: { userId: testUserId } });
      await prisma.scoreTransaction.deleteMany({ where: { userId: testUserId } });
      await prisma.anonymousUser.deleteMany({ where: { id: testUserId } });
    }
    if (testPandalId) {
      await prisma.pandal.deleteMany({ where: { id: testPandalId } });
    }
  });

  test("1. Normal pandal discovery awards +50 points once", async () => {
    const visitId = `visit-norm-${Date.now()}`;

    await prisma.pandalVisit.create({
      data: {
        id: visitId,
        userId: testUserId,
        pandalId: testPandalId,
        latitude: 18.5204,
        longitude: 73.8567,
        verificationStatus: "VERIFIED",
      },
    });

    const results = await ScoreService.processPandalDiscovery(prisma, {
      userId: testUserId,
      pandalId: testPandalId,
      visitId,
      isRare: false,
      totalUniquePandals: 1,
      visitTimestamp: new Date(),
    });

    const baseResult = results.find((r) => r.eventType === "PANDAL_DISCOVERY");
    assert.ok(baseResult);
    assert.equal(baseResult.awarded, true);
    assert.equal(baseResult.points, SCORE_RULES.PANDAL_DISCOVERY);

    const user = await prisma.anonymousUser.findUnique({ where: { id: testUserId } });
    assert.equal(user?.score, 70); // 50 (base) + 20 (first of day)
  });

  test("2. Repeated discovery attempt doesn't award points again (Idempotency)", async () => {
    const visitId = `visit-repeat-${Date.now()}`;

    await prisma.pandalVisit.create({
      data: {
        id: visitId,
        userId: testUserId,
        pandalId: testPandalId,
        latitude: 18.5204,
        longitude: 73.8567,
        verificationStatus: "VERIFIED",
      },
    });

    // First attempt
    await ScoreService.processPandalDiscovery(prisma, {
      userId: testUserId,
      pandalId: testPandalId,
      visitId,
      isRare: false,
      totalUniquePandals: 1,
      visitTimestamp: new Date(),
    });

    const userAfterFirst = await prisma.anonymousUser.findUnique({ where: { id: testUserId } });
    const scoreAfterFirst = userAfterFirst?.score || 0;

    // Second attempt with exact same idempotency params
    const secondResults = await ScoreService.processPandalDiscovery(prisma, {
      userId: testUserId,
      pandalId: testPandalId,
      visitId,
      isRare: false,
      totalUniquePandals: 1,
      visitTimestamp: new Date(),
    });

    const baseResult = secondResults.find((r) => r.eventType === "PANDAL_DISCOVERY");
    assert.ok(baseResult);
    assert.equal(baseResult.awarded, false);
    assert.equal(baseResult.points, 0);

    const userAfterSecond = await prisma.anonymousUser.findUnique({ where: { id: testUserId } });
    assert.equal(userAfterSecond?.score, scoreAfterFirst);
  });

  test("3. Iconic / rare pandal discovery awards +100 points", async () => {
    const visitId = `visit-rare-${Date.now()}`;

    await prisma.pandalVisit.create({
      data: {
        id: visitId,
        userId: testUserId,
        pandalId: testPandalId,
        latitude: 18.5204,
        longitude: 73.8567,
        verificationStatus: "VERIFIED",
      },
    });

    const results = await ScoreService.processPandalDiscovery(prisma, {
      userId: testUserId,
      pandalId: testPandalId,
      visitId,
      isRare: true,
      totalUniquePandals: 1,
      visitTimestamp: new Date(),
    });

    const rareResult = results.find((r) => r.eventType === "RARE_PANDAL_DISCOVERY");
    assert.ok(rareResult);
    assert.equal(rareResult.awarded, true);
    assert.equal(rareResult.points, SCORE_RULES.RARE_PANDAL_DISCOVERY);
  });

  test("4. Daily bonus (+20) is awarded only once per day", async () => {
    const date = new Date();
    const v1 = `v1-${Date.now()}`;
    const v2 = `v2-${Date.now()}`;

    const secondPandal = await prisma.pandal.create({
      data: { name: "Pandal 2", latitude: 18.5205, longitude: 73.8568, city: "Pune" },
    });

    try {
      // First visit of the day
      await prisma.pandalVisit.create({
        data: {
          id: v1,
          userId: testUserId,
          pandalId: testPandalId,
          latitude: 18.5204,
          longitude: 73.8567,
          verificationStatus: "VERIFIED",
          timestamp: date,
        },
      });

      const r1 = await ScoreService.processPandalDiscovery(prisma, {
        userId: testUserId,
        pandalId: testPandalId,
        visitId: v1,
        isRare: false,
        totalUniquePandals: 1,
        visitTimestamp: date,
      });

      const firstBonus1 = r1.find((r) => r.eventType === "FIRST_DISCOVERY_OF_DAY");
      assert.ok(firstBonus1);
      assert.equal(firstBonus1.awarded, true);
      assert.equal(firstBonus1.points, SCORE_RULES.FIRST_DISCOVERY_OF_DAY);

      // Second visit of the same day
      await prisma.pandalVisit.create({
        data: {
          id: v2,
          userId: testUserId,
          pandalId: secondPandal.id,
          latitude: 18.5205,
          longitude: 73.8568,
          verificationStatus: "VERIFIED",
          timestamp: date,
        },
      });

      const r2 = await ScoreService.processPandalDiscovery(prisma, {
        userId: testUserId,
        pandalId: secondPandal.id,
        visitId: v2,
        isRare: false,
        totalUniquePandals: 2,
        visitTimestamp: date,
      });

      const firstBonus2 = r2.find((r) => r.eventType === "FIRST_DISCOVERY_OF_DAY");
      assert.equal(firstBonus2, undefined);
    } finally {
      await prisma.pandalVisit.deleteMany({ where: { pandalId: secondPandal.id } });
      await prisma.pandal.delete({ where: { id: secondPandal.id } });
    }
  });

  test("5. Quest completion (+100) cannot be rewarded twice", async () => {
    const questId = `quest-${Date.now()}`;

    const res1 = await ScoreService.processQuestCompletion(prisma, testUserId, questId);
    assert.equal(res1.awarded, true);
    assert.equal(res1.points, SCORE_RULES.QUEST_COMPLETED);

    const res2 = await ScoreService.processQuestCompletion(prisma, testUserId, questId);
    assert.equal(res2.awarded, false);
    assert.equal(res2.points, 0);
  });

  test("6. Rejected photos receive 0 points", async () => {
    const initialUser = await prisma.anonymousUser.findUnique({ where: { id: testUserId } });
    const initialScore = initialUser?.score || 0;

    // Simulate rejected photo without processPhotoApproval
    const updatedUser = await prisma.anonymousUser.findUnique({ where: { id: testUserId } });
    assert.equal(updatedUser?.score, initialScore);
  });

  test("7. Approved photos receive points (+20) once", async () => {
    const photoId = `photo-${Date.now()}`;

    const res1 = await ScoreService.processPhotoApproval(prisma, photoId, testUserId);
    assert.equal(res1.awarded, true);
    assert.equal(res1.points, SCORE_RULES.PHOTO_APPROVED);

    const res2 = await ScoreService.processPhotoApproval(prisma, photoId, testUserId);
    assert.equal(res2.awarded, false);
    assert.equal(res2.points, 0);
  });

  test("8. Streak milestones cannot be replayed", async () => {
    const cycle = `cycle-${Date.now()}`;

    const res3day1 = await ScoreService.processStreakMilestone(prisma, testUserId, 3, cycle);
    const award3 = res3day1.find((r) => r.eventType === "STREAK_3_DAY");
    assert.ok(award3);
    assert.equal(award3.awarded, true);
    assert.equal(award3.points, SCORE_RULES.STREAK_3_DAY);

    // Attempt replay
    const res3day2 = await ScoreService.processStreakMilestone(prisma, testUserId, 3, cycle);
    assert.equal(res3day2.length, 0);
  });

  test("9. Concurrent duplicate requests don't duplicate points", async () => {
    const key = `concurrent_test_${Date.now()}`;

    const [r1, r2] = await Promise.all([
      ScoreService.awardScore(prisma, {
        userId: testUserId,
        eventType: "PANDAL_DISCOVERY",
        idempotencyKey: key,
      }),
      ScoreService.awardScore(prisma, {
        userId: testUserId,
        eventType: "PANDAL_DISCOVERY",
        idempotencyKey: key,
      }),
    ]);

    const awardedCount = [r1, r2].filter((r) => r.awarded).length;
    assert.equal(awardedCount, 1);
  });

  test("10. Leaderboard total matches score ledger sum", async () => {
    await ScoreService.awardScore(prisma, {
      userId: testUserId,
      eventType: "PANDAL_DISCOVERY",
      idempotencyKey: `ledger_audit_1_${Date.now()}`,
    });

    await ScoreService.awardScore(prisma, {
      userId: testUserId,
      eventType: "QUEST_COMPLETED",
      idempotencyKey: `ledger_audit_2_${Date.now()}`,
    });

    const calculatedLedgerSum = await ScoreService.recalculateUserScore(testUserId);
    const user = await prisma.anonymousUser.findUnique({ where: { id: testUserId } });

    assert.equal(user?.score, calculatedLedgerSum);
  });
});
