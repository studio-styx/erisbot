/*
  Warnings:

  - You are about to drop the column `analyzeId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `hasSlashCommands` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `lib` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `prefix` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `supportServerLink` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Cooldown` table. All the data in the column will be lost.
  - You are about to drop the column `endIn` on the `Cooldown` table. All the data in the column will be lost.
  - You are about to drop the column `analisingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `blacklist` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `coins` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `defaultVote` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAvaliator` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Analyze` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Annotation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoteReminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Votes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `willEndIn` to the `Cooldown` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Analyze" DROP CONSTRAINT "Analyze_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Annotation" DROP CONSTRAINT "Annotation_analyzeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_analyzeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Votes" DROP CONSTRAINT "Votes_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Votes" DROP CONSTRAINT "Votes_userId_fkey";

-- DropIndex
DROP INDEX "public"."Application_analyzeId_key";

-- DropIndex
DROP INDEX "public"."User_analisingId_key";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "analyzeId",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "github",
DROP COLUMN "hasSlashCommands",
DROP COLUMN "language",
DROP COLUMN "lib",
DROP COLUMN "name",
DROP COLUMN "prefix",
DROP COLUMN "supportServerLink",
DROP COLUMN "userId",
DROP COLUMN "website",
ADD COLUMN     "money" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "token" TEXT;

-- AlterTable
ALTER TABLE "public"."Cooldown" DROP COLUMN "createdAt",
DROP COLUMN "endIn",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "willEndIn" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "analisingId",
DROP COLUMN "blacklist",
DROP COLUMN "coins",
DROP COLUMN "createdAt",
DROP COLUMN "defaultVote",
DROP COLUMN "isAvaliator",
ADD COLUMN     "afkReasson" TEXT,
ADD COLUMN     "afkTime" TIMESTAMP(3),
ADD COLUMN     "bank" DECIMAL(12,2) NOT NULL DEFAULT 50.0,
ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "dmNotification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mailsTagsIgnored" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "money" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "token" JSONB,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."Analyze";

-- DropTable
DROP TABLE "public"."Annotation";

-- DropTable
DROP TABLE "public"."VoteReminder";

-- DropTable
DROP TABLE "public"."Votes";

-- DropEnum
DROP TYPE "public"."Origin";

-- CreateTable
CREATE TABLE "public"."Requisition" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "Requisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'info',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "wage" DECIMAL(12,2) NOT NULL DEFAULT 100.0,
    "expectations" JSONB NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "iaAvaliation" TEXT,
    "trend" TEXT,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockHistory" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockHolding" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StockHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildSettings" (
    "id" TEXT NOT NULL,
    "chatBotChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chatBotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "channelsCommandDisabled" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelsCommandDisabledIsHabilited" BOOLEAN NOT NULL DEFAULT false,
    "channelsCommandEnabled" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelsCommandEnabledIsHabilited" BOOLEAN NOT NULL DEFAULT false,
    "xpSystemEnabled" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "rolesXpBonus" JSONB NOT NULL DEFAULT '[]',
    "rolesNotWinXp" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelsXpBonus" JSONB NOT NULL DEFAULT '[]',
    "channelsNotWinXp" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warnLevelUp" JSONB NOT NULL DEFAULT '{}',
    "levelGrant" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildMember" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("guildId","id")
);

-- CreateTable
CREATE TABLE "public"."Mails" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "asRead" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "whoSendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_stockId_date_key" ON "public"."StockHistory"("stockId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StockHolding_userId_stockId_key" ON "public"."StockHolding"("userId", "stockId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_token_key" ON "public"."Application"("token");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisition" ADD CONSTRAINT "Requisition_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHolding" ADD CONSTRAINT "StockHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHolding" ADD CONSTRAINT "StockHolding_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."GuildSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mails" ADD CONSTRAINT "Mails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mails" ADD CONSTRAINT "Mails_whoSendId_fkey" FOREIGN KEY ("whoSendId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
