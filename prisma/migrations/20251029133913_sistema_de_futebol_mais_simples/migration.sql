/*
  Warnings:

  - You are about to drop the column `seasonId` on the `FootballFixture` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `FootballLeagueCoverage` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `FootballLeagueStanding` table. All the data in the column will be lost.
  - You are about to drop the `FootballFixtureCoverage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballLeagueSeason` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballTopAssist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballTopCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballTopScorer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[leagueId]` on the table `FootballLeagueCoverage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leagueId,teamId]` on the table `FootballLeagueStanding` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."FootballFixture" DROP CONSTRAINT "FootballFixture_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixtureCoverage" DROP CONSTRAINT "FootballFixtureCoverage_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballLeagueCoverage" DROP CONSTRAINT "FootballLeagueCoverage_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballLeagueSeason" DROP CONSTRAINT "FootballLeagueSeason_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballLeagueStanding" DROP CONSTRAINT "FootballLeagueStanding_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballTopAssist" DROP CONSTRAINT "FootballTopAssist_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballTopCard" DROP CONSTRAINT "FootballTopCard_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballTopScorer" DROP CONSTRAINT "FootballTopScorer_playerId_fkey";

-- DropIndex
DROP INDEX "public"."FootballLeagueCoverage_leagueId_seasonId_key";

-- DropIndex
DROP INDEX "public"."FootballLeagueCoverage_seasonId_key";

-- DropIndex
DROP INDEX "public"."FootballLeagueStanding_leagueId_seasonId_idx";

-- DropIndex
DROP INDEX "public"."FootballLeagueStanding_leagueId_seasonId_teamId_key";

-- AlterTable
ALTER TABLE "public"."FootballFixture" DROP COLUMN "seasonId";

-- AlterTable
ALTER TABLE "public"."FootballLeagueCoverage" DROP COLUMN "seasonId";

-- AlterTable
ALTER TABLE "public"."FootballLeagueStanding" DROP COLUMN "seasonId";

-- DropTable
DROP TABLE "public"."FootballFixtureCoverage";

-- DropTable
DROP TABLE "public"."FootballLeagueSeason";

-- DropTable
DROP TABLE "public"."FootballTopAssist";

-- DropTable
DROP TABLE "public"."FootballTopCard";

-- DropTable
DROP TABLE "public"."FootballTopScorer";

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeagueCoverage_leagueId_key" ON "public"."FootballLeagueCoverage"("leagueId");

-- CreateIndex
CREATE INDEX "FootballLeagueStanding_leagueId_idx" ON "public"."FootballLeagueStanding"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeagueStanding_leagueId_teamId_key" ON "public"."FootballLeagueStanding"("leagueId", "teamId");
