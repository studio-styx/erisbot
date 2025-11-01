/*
  Warnings:

  - The values [GOALS,HOME_GOALS,AWAY_GOALS,YELLOW_CARDS,RED_CARDS] on the enum `FootballBetType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `FootballMatchStatistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."FootballBetType_new" AS ENUM ('HOME_WIN', 'DRAW', 'AWAY_WIN', 'EXACT_GOALS', 'GOALS_HOME', 'GOALS_AWAY');
ALTER TABLE "public"."FootballBet" ALTER COLUMN "type" TYPE "public"."FootballBetType_new" USING ("type"::text::"public"."FootballBetType_new");
ALTER TYPE "public"."FootballBetType" RENAME TO "FootballBetType_old";
ALTER TYPE "public"."FootballBetType_new" RENAME TO "FootballBetType";
DROP TYPE "public"."FootballBetType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."FootballMatchStatistics" DROP CONSTRAINT "FootballMatchStatistics_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballMatchStatistics" DROP CONSTRAINT "FootballMatchStatistics_teamId_fkey";

-- AlterTable
ALTER TABLE "public"."FootballPlayer" ADD COLUMN     "points" INTEGER;

-- AlterTable
ALTER TABLE "public"."Mails" ALTER COLUMN "whoSendId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."FootballMatchStatistics";
