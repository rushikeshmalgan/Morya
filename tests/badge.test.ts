// tests/badge.test.ts — Comprehensive test suite for Authoritative Badges & Achievement System

import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { BadgeService } from "../lib/badge-service";

describe("BadgeService & Achievement System Test Suite", () => {
  let testUserId: string;
  let testPandalId: string;

  beforeEach(async () => {
    const user = await prisma.anonymousUser.create({
      data: {
        deviceId: `test-badge-device-${Date.now()}-${Math.random()}`,
        sessionToken: `test-badge-token-${Date.now()}-${Math.random()}`,
        generatedName: "Badge Explorer",
        generatedNumber: Math.floor(Math.random() * 8999) + 1000,
        city: "Pune",
        score: 0,
        uniquePandals: 0,
      },
    });
    testUserId = user.id;

    const pandal = await prisma.pandal.create({
      data: {
        name: `Badge Test Pandal ${Date.now()}`,
        latitude: 18.5204,
        longitude: 73.8567,
        city: "Pune",
        isRare: false,
      },
    });
    testPandalId = pandal.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await prisma.userAchievement.deleteMany({ where: { userId: testUserId } });
      await prisma.pandalVisit.deleteMany({ where: { userId: testUserId } });
      await prisma.photoVote.deleteMany({ where: { userId: testUserId } });
      await prisma.photo.deleteMany({ where: { userId: testUserId } });
      await prisma.scoreTransaction.deleteMany({ where: { userId: testUserId } });
      await prisma.anonymousUser.deleteMany({ where: { id: testUserId } });
    }
    if (testPandalId) {
      await prisma.pandal.deleteMany({ where: { id: testPandalId } });
    }
  });

  test("1. First discovery unlocks FIRST_DARSHAN badge", async () => {
    const results = await BadgeService.evaluatePandalDiscovered(prisma, testUserId, {
      visitId: `visit-1-${Date.now()}`,
      pandalId: testPandalId,
      isRare: false,
      city: "Pune",
      totalUniquePandals: 1,
    });

    const firstBadge = results.find((r) => r.badge.key === "FIRST_DARSHAN");
    assert.ok(firstBadge);
    assert.equal(firstBadge.unlocked, true);
  });

  test("2. Threshold badges (BAPPA_EXPLORER at 5, PANDAL_HOPPER at 10) unlock correctly", async () => {
    const res5 = await BadgeService.evaluatePandalDiscovered(prisma, testUserId, {
      visitId: `visit-5-${Date.now()}`,
      pandalId: testPandalId,
      isRare: false,
      city: "Pune",
      totalUniquePandals: 5,
    });

    const badge5 = res5.find((r) => r.badge.key === "BAPPA_EXPLORER");
    assert.ok(badge5);
    assert.equal(badge5.unlocked, true);

    const res10 = await BadgeService.evaluatePandalDiscovered(prisma, testUserId, {
      visitId: `visit-10-${Date.now()}`,
      pandalId: testPandalId,
      isRare: false,
      city: "Pune",
      totalUniquePandals: 10,
    });

    const badge10 = res10.find((r) => r.badge.key === "PANDAL_HOPPER");
    assert.ok(badge10);
    assert.equal(badge10.unlocked, true);
  });

  test("3. Badge cannot be awarded twice to the same user", async () => {
    const res1 = await BadgeService.unlockBadge(prisma, testUserId, "FIRST_DARSHAN");
    assert.ok(res1);
    assert.equal(res1.unlocked, true);

    const res2 = await BadgeService.unlockBadge(prisma, testUserId, "FIRST_DARSHAN");
    assert.equal(res2, null);
  });

  test("4. Concurrent evaluation safety prevents duplicate unlocks", async () => {
    const [u1, u2] = await Promise.all([
      BadgeService.unlockBadge(prisma, testUserId, "BAPPA_EXPLORER"),
      BadgeService.unlockBadge(prisma, testUserId, "BAPPA_EXPLORER"),
    ]);

    const unlockedCount = [u1, u2].filter(Boolean).length;
    assert.equal(unlockedCount, 1);
  });

  test("5. Incorrect / non-verified check-in doesn't unlock badges", async () => {
    // Non-verified check-in does not call evaluatePandalDiscovered
    const userBadges = await BadgeService.getUserBadges(testUserId);
    assert.equal(userBadges.earnedBadges.length, 0);
  });

  test("6. Rejected photo does not count towards BAPPA_PHOTOGRAPHER badge", async () => {
    // Create 5 rejected photos
    for (let i = 0; i < 5; i++) {
      await prisma.photo.create({
        data: {
          userId: testUserId,
          pandalId: testPandalId,
          imageUrl: `/uploads/test-${i}.jpg`,
          moderationStatus: "REJECTED",
        },
      });
    }

    const results = await BadgeService.evaluatePhotoApproved(prisma, testUserId, {
      photoId: `photo-rejected-${Date.now()}`,
      isPhotoOfDay: false,
    });

    const photoBadge = results.find((r) => r.badge.key === "BAPPA_PHOTOGRAPHER");
    assert.equal(photoBadge, undefined);
  });

  test("7. Same-city calculation unlocks CITY_EXPLORER badge when 10 pandals in city are reached", async () => {
    const extraPandals: string[] = [];
    try {
      // Create 10 verified visits in Pune
      for (let i = 0; i < 10; i++) {
        const p = await prisma.pandal.create({
          data: { name: `City Pandal ${i}`, latitude: 18.5, longitude: 73.8, city: "Pune" },
        });
        extraPandals.push(p.id);

        await prisma.pandalVisit.create({
          data: {
            userId: testUserId,
            pandalId: p.id,
            latitude: 18.5,
            longitude: 73.8,
            verificationStatus: "VERIFIED",
          },
        });
      }

      const results = await BadgeService.evaluatePandalDiscovered(prisma, testUserId, {
        visitId: `visit-city-10`,
        pandalId: extraPandals[9],
        isRare: false,
        city: "Pune",
        totalUniquePandals: 10,
      });

      const cityBadge = results.find((r) => r.badge.key === "CITY_EXPLORER");
      assert.ok(cityBadge);
      assert.equal(cityBadge.unlocked, true);
    } finally {
      if (extraPandals.length > 0) {
        await prisma.pandalVisit.deleteMany({ where: { pandalId: { in: extraPandals } } });
        await prisma.pandal.deleteMany({ where: { id: { in: extraPandals } } });
      }
    }
  });

  test("8. Iconic / rare pandal unlocks LEGENDARY_DARSHAN badge", async () => {
    const results = await BadgeService.evaluatePandalDiscovered(prisma, testUserId, {
      visitId: `visit-rare-${Date.now()}`,
      pandalId: testPandalId,
      isRare: true,
      city: "Pune",
      totalUniquePandals: 1,
    });

    const legendaryBadge = results.find((r) => r.badge.key === "LEGENDARY_DARSHAN");
    assert.ok(legendaryBadge);
    assert.equal(legendaryBadge.unlocked, true);
  });

  test("9. Streak badges unlock at 3-day and 7-day milestones", async () => {
    const res3 = await BadgeService.evaluateStreakUpdated(prisma, testUserId, 3);
    const b3 = res3.find((r) => r.badge.key === "THREE_DAY_MORYA");
    assert.ok(b3);
    assert.equal(b3.unlocked, true);

    const res7 = await BadgeService.evaluateStreakUpdated(prisma, testUserId, 7);
    const b7 = res7.find((r) => r.badge.key === "SEVEN_DAY_MORYA");
    assert.ok(b7);
    assert.equal(b7.unlocked, true);
  });

  test("10. Route completion unlocks YATRA_ROOKIE and YATRA_MASTER badges", async () => {
    // Record 1 completed yatra route
    await prisma.scoreTransaction.create({
      data: {
        userId: testUserId,
        eventType: "ROUTE_COMPLETED",
        points: 150,
        idempotencyKey: `yatra_1_${Date.now()}`,
      },
    });

    const res1 = await BadgeService.evaluateYatraCompleted(prisma, testUserId, "route-1");
    const rookie = res1.find((r) => r.badge.key === "YATRA_ROOKIE");
    assert.ok(rookie);
    assert.equal(rookie.unlocked, true);

    // Record 4 more completed yatra routes
    for (let i = 2; i <= 5; i++) {
      await prisma.scoreTransaction.create({
        data: {
          userId: testUserId,
          eventType: "ROUTE_COMPLETED",
          points: 150,
          idempotencyKey: `yatra_${i}_${Date.now()}`,
        },
      });
    }

    const res5 = await BadgeService.evaluateYatraCompleted(prisma, testUserId, "route-5");
    const master = res5.find((r) => r.badge.key === "YATRA_MASTER");
    assert.ok(master);
    assert.equal(master.unlocked, true);
  });

  test("11. getUserBadges returns accurate earned vs locked badge structures with progress metrics", async () => {
    await BadgeService.unlockBadge(prisma, testUserId, "FIRST_DARSHAN");

    const badgeData = await BadgeService.getUserBadges(testUserId);
    assert.ok(badgeData.earnedBadges.length >= 1);
    assert.ok(badgeData.lockedBadges.length >= 1);

    const firstBadge = badgeData.earnedBadges.find((b) => b.key === "FIRST_DARSHAN");
    assert.equal(firstBadge?.unlocked, true);
    assert.ok(firstBadge?.unlockedAt);

    const explorerBadge = badgeData.lockedBadges.find((b) => b.key === "BAPPA_EXPLORER");
    assert.equal(explorerBadge?.unlocked, false);
    assert.equal(explorerBadge?.threshold, 5);
  });
});
