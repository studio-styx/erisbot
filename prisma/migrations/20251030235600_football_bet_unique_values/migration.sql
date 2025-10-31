/*
  Warnings:

  - A unique constraint covering the columns `[type,userId,matchId]` on the table `FootballBet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FootballBet_type_userId_matchId_key" ON "public"."FootballBet"("type", "userId", "matchId");
