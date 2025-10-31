/*
  Warnings:

  - The `status` column on the `FootballMatch` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELED', 'AWARDED');

-- AlterTable
ALTER TABLE "public"."FootballMatch" ADD COLUMN     "oddsAwayWin" DOUBLE PRECISION,
ADD COLUMN     "oddsDraw" DOUBLE PRECISION,
ADD COLUMN     "oddsHomeWin" DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."MatchStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "public"."FootballTeam" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;
