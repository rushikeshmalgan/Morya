-- CreateTable
CREATE TABLE "anonymous_users" (
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

-- CreateTable
CREATE TABLE "pandals" (
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

-- CreateTable
CREATE TABLE "pandal_visits" (
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

-- CreateTable
CREATE TABLE "photos" (
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

-- CreateTable
CREATE TABLE "photo_votes" (
    "userId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "votedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "photoId"),
    CONSTRAINT "photo_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "photo_votes_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quests" (
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

-- CreateTable
CREATE TABLE "user_quests" (
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,

    PRIMARY KEY ("userId", "questId"),
    CONSTRAINT "user_quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_quests_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "squads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "squads_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "squad_members" (
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("squadId", "userId"),
    CONSTRAINT "squad_members_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squads" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "squad_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "threshold" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "achievementId"),
    CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "anonymous_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_users_deviceId_key" ON "anonymous_users"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_users_sessionToken_key" ON "anonymous_users"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "pandal_visits_userId_pandalId_key" ON "pandal_visits"("userId", "pandalId");

-- CreateIndex
CREATE UNIQUE INDEX "squads_code_key" ON "squads"("code");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");
