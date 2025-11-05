-- CreateEnum
CREATE TYPE "public"."FootballBetStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."FootballBetLogAction" AS ENUM ('CREATED', 'UPDATED', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."FootballBet" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."FootballBetStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "acceptedFootballTermsAt" TIMESTAMP(3),
ADD COLUMN     "favoriteTeamId" BIGINT,
ADD COLUMN     "readFootballBetTerms" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."FootballBetLog" (
    "id" BIGSERIAL NOT NULL,
    "matchId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    "betId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" "public"."FootballBetLogAction" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "FootballBetLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_favoriteTeamId_fkey" FOREIGN KEY ("favoriteTeamId") REFERENCES "public"."FootballTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballBetLog" ADD CONSTRAINT "FootballBetLog_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."FootballMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballBetLog" ADD CONSTRAINT "FootballBetLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballBetLog" ADD CONSTRAINT "FootballBetLog_betId_fkey" FOREIGN KEY ("betId") REFERENCES "public"."FootballBet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
