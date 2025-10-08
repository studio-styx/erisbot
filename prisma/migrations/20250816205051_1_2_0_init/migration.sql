/*
  Warnings:

  - You are about to drop the column `money` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Cooldown` table. All the data in the column will be lost.
  - You are about to drop the column `willEndIn` on the `Cooldown` table. All the data in the column will be lost.
  - You are about to drop the column `bank` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dmNotification` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mailsTagsIgnored` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `money` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuildMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuildSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Requisition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockHolding` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[analyzeId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[analisingId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `language` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lib` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endIn` to the `Cooldown` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Origin" AS ENUM ('SERVER', 'WEBSITE');

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuildMember" DROP CONSTRAINT "GuildMember_guildId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Log" DROP CONSTRAINT "Log_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mails" DROP CONSTRAINT "Mails_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mails" DROP CONSTRAINT "Mails_whoSendId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requisition" DROP CONSTRAINT "Requisition_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockHistory" DROP CONSTRAINT "StockHistory_stockId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockHolding" DROP CONSTRAINT "StockHolding_stockId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockHolding" DROP CONSTRAINT "StockHolding_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_companyId_fkey";

-- DropIndex
DROP INDEX "public"."Application_token_key";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "money",
DROP COLUMN "ownerId",
DROP COLUMN "token",
ADD COLUMN     "analyzeId" INTEGER,
ADD COLUMN     "carefulAnalysis" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "hasSlashCommands" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "lib" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "prefix" TEXT,
ADD COLUMN     "supportServerLink" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "public"."Cooldown" DROP COLUMN "timestamp",
DROP COLUMN "willEndIn",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endIn" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "bank",
DROP COLUMN "companyId",
DROP COLUMN "dmNotification",
DROP COLUMN "mailsTagsIgnored",
DROP COLUMN "money",
DROP COLUMN "token",
DROP COLUMN "xp",
ADD COLUMN     "analisingId" INTEGER,
ADD COLUMN     "blacklist" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defaultVote" TEXT,
ADD COLUMN     "isAvaliator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuperAvaliator" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Company";

-- DropTable
DROP TABLE "public"."GuildMember";

-- DropTable
DROP TABLE "public"."GuildSettings";

-- DropTable
DROP TABLE "public"."Log";

-- DropTable
DROP TABLE "public"."Mails";

-- DropTable
DROP TABLE "public"."Requisition";

-- DropTable
DROP TABLE "public"."Stock";

-- DropTable
DROP TABLE "public"."StockHistory";

-- DropTable
DROP TABLE "public"."StockHolding";

-- CreateTable
CREATE TABLE "public"."Votes" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" "public"."Origin" NOT NULL DEFAULT 'SERVER',

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Annotation" (
    "id" SERIAL NOT NULL,
    "analyzeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoteReminder" (
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoteReminder_pkey" PRIMARY KEY ("userId","channelId","guildId")
);

-- CreateTable
CREATE TABLE "public"."Analyze" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT,
    "userId" TEXT,
    "avaliation" TEXT,
    "approved" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedIn" TIMESTAMP(3),

    CONSTRAINT "Analyze_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoteReminder_endTime_idx" ON "public"."VoteReminder"("endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Application_analyzeId_key" ON "public"."Application"("analyzeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_analisingId_key" ON "public"."User"("analisingId");

-- AddForeignKey
ALTER TABLE "public"."Votes" ADD CONSTRAINT "Votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Votes" ADD CONSTRAINT "Votes_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_analyzeId_fkey" FOREIGN KEY ("analyzeId") REFERENCES "public"."Analyze"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Annotation" ADD CONSTRAINT "Annotation_analyzeId_fkey" FOREIGN KEY ("analyzeId") REFERENCES "public"."Analyze"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analyze" ADD CONSTRAINT "Analyze_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
