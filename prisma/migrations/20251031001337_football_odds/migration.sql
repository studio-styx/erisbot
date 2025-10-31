-- CreateTable
CREATE TABLE "public"."FootballOdds" (
    "id" BIGSERIAL NOT NULL,
    "matchId" BIGINT NOT NULL,
    "homeWin" DOUBLE PRECISION NOT NULL,
    "draw" DOUBLE PRECISION NOT NULL,
    "awayWin" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FootballOdds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FootballOdds_matchId_key" ON "public"."FootballOdds"("matchId");

-- AddForeignKey
ALTER TABLE "public"."FootballOdds" ADD CONSTRAINT "FootballOdds_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."FootballMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
