import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db")
  .trim()
  .replace(/^["']|["']$/g, "");
const authToken = (process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || "")
  .trim()
  .replace(/^["']|["']$/g, "");

console.log("Connecting to LibSQL / Turso database at:", url);

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

const ddl = `
CREATE TABLE IF NOT EXISTS "anonymous_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "generatedName" TEXT NOT NULL,
    "generatedNumber" INTEGER NOT NULL,
    "city" TEXT,
    "cityLat" REAL,
    "cityLng" REAL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "uniquePandals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "pandals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "aartiTimes" TEXT,
    "established" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "submittedBy" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isRare" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "pandal_visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pandalId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "photoId" TEXT,
    CONSTRAINT "pandal_visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pandal_visits_pandalId_fkey" FOREIGN KEY ("pandalId") REFERENCES "pandals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pandalId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPhotoOfDay" BOOLEAN NOT NULL DEFAULT false,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT NOT NULL DEFAULT 'BEST_BAPPA',
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "photos_pandalId_fkey" FOREIGN KEY ("pandalId") REFERENCES "pandals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "photo_votes" (
    "userId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "votedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "photoId"),
    CONSTRAINT "photo_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "photo_votes_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "quests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "requirement" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "activeFrom" DATETIME NOT NULL,
    "activeUntil" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "user_quests" (
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    PRIMARY KEY ("userId", "questId"),
    CONSTRAINT "user_quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_quests_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "squads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "squads_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "squad_members" (
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("squadId", "userId"),
    CONSTRAINT "squad_members_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squads" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "squad_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "threshold" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "user_achievements" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "achievementId"),
    CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "score_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "score_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#E85D04',
    "rewardPoints" INTEGER NOT NULL DEFAULT 200,
    "badgeKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "route_pandals" (
    "routeId" TEXT NOT NULL,
    "pandalId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    PRIMARY KEY ("routeId", "pandalId"),
    CONSTRAINT "route_pandals_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "route_pandals_pandalId_fkey" FOREIGN KEY ("pandalId") REFERENCES "pandals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "user_route_completions" (
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "routeId"),
    CONSTRAINT "user_route_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_route_completions_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "anonymous_users_deviceId_key" ON "anonymous_users"("deviceId");
CREATE UNIQUE INDEX IF NOT EXISTS "anonymous_users_sessionToken_key" ON "anonymous_users"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "pandal_visits_userId_pandalId_key" ON "pandal_visits"("userId", "pandalId");
CREATE UNIQUE INDEX IF NOT EXISTS "squads_code_key" ON "squads"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "achievements_key_key" ON "achievements"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "score_transactions_idempotencyKey_key" ON "score_transactions"("idempotencyKey");
`;

async function main() {
  console.log("Executing DDL statements on Turso database...");
  await client.executeMultiple(ddl);
  console.log("✅ All tables and unique indices successfully created in Turso!");
  client.close();
}

main().catch((err) => {
  console.error("Failed to initialize database tables:", err);
  process.exit(1);
});
