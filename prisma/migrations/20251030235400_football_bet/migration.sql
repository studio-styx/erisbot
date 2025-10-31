-- CreateEnum
CREATE TYPE "public"."FootballBetType" AS ENUM ('HOME_WIN', 'DRAW', 'AWAY_WIN', 'GOALS', 'EXACT_GOALS', 'HOME_GOALS', 'AWAY_GOALS', 'YELLOW_CARDS', 'RED_CARDS');

-- CreateTable
CREATE TABLE "public"."FootballBet" (
    "id" BIGSERIAL NOT NULL,
    "matchId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "public"."FootballBetType" NOT NULL,
    "odds" DECIMAL(12,2) NOT NULL,
    "quantity" TEXT,

    CONSTRAINT "FootballBet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FootballBet" ADD CONSTRAINT "FootballBet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."FootballMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballBet" ADD CONSTRAINT "FootballBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
