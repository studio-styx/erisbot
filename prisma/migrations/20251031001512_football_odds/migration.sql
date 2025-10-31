/*
  Warnings:

  - You are about to drop the `FootballOdds` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FootballOdds" DROP CONSTRAINT "FootballOdds_matchId_fkey";

-- DropTable
DROP TABLE "public"."FootballOdds";
