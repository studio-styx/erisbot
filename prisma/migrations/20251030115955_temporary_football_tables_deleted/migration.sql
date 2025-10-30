/*
  Warnings:

  - You are about to drop the `FootballBet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballFixture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballFixtureStatistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballLeague` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballLeagueCoverage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballLeagueStanding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballOdds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballPlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballPlayerStatistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FootballTeamStadium` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FootballBet" DROP CONSTRAINT "FootballBet_fixtureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballBet" DROP CONSTRAINT "FootballBet_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballEvent" DROP CONSTRAINT "FootballEvent_assistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballEvent" DROP CONSTRAINT "FootballEvent_fixtureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballEvent" DROP CONSTRAINT "FootballEvent_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballEvent" DROP CONSTRAINT "FootballEvent_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixture" DROP CONSTRAINT "FootballFixture_awayTeamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixture" DROP CONSTRAINT "FootballFixture_homeTeamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixture" DROP CONSTRAINT "FootballFixture_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixture" DROP CONSTRAINT "FootballFixture_venueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixtureStatistics" DROP CONSTRAINT "FootballFixtureStatistics_fixtureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballFixtureStatistics" DROP CONSTRAINT "FootballFixtureStatistics_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballLeagueCoverage" DROP CONSTRAINT "FootballLeagueCoverage_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballLeagueStanding" DROP CONSTRAINT "FootballLeagueStanding_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballLeagueStanding" DROP CONSTRAINT "FootballLeagueStanding_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballOdds" DROP CONSTRAINT "FootballOdds_fixtureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballPlayer" DROP CONSTRAINT "FootballPlayer_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballPlayerStatistics" DROP CONSTRAINT "FootballPlayerStatistics_fixtureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballPlayerStatistics" DROP CONSTRAINT "FootballPlayerStatistics_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballPlayerStatistics" DROP CONSTRAINT "FootballPlayerStatistics_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FootballTeam" DROP CONSTRAINT "FootballTeam_stadiumId_fkey";

-- DropTable
DROP TABLE "public"."FootballBet";

-- DropTable
DROP TABLE "public"."FootballEvent";

-- DropTable
DROP TABLE "public"."FootballFixture";

-- DropTable
DROP TABLE "public"."FootballFixtureStatistics";

-- DropTable
DROP TABLE "public"."FootballLeague";

-- DropTable
DROP TABLE "public"."FootballLeagueCoverage";

-- DropTable
DROP TABLE "public"."FootballLeagueStanding";

-- DropTable
DROP TABLE "public"."FootballOdds";

-- DropTable
DROP TABLE "public"."FootballPlayer";

-- DropTable
DROP TABLE "public"."FootballPlayerStatistics";

-- DropTable
DROP TABLE "public"."FootballTeam";

-- DropTable
DROP TABLE "public"."FootballTeamStadium";
