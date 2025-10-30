-- CreateTable
CREATE TABLE "public"."FootballLeague" (
    "id" BIGSERIAL NOT NULL,
    "apiId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LEAGUE',
    "emblem" TEXT,
    "areaId" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FootballLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballTeam" (
    "id" BIGSERIAL NOT NULL,
    "apiId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL DEFAULT 'Unknown',
    "tla" TEXT NOT NULL DEFAULT 'UNK',
    "crest" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT 'Desconhecido',
    "clubColors" TEXT,
    "venue" TEXT NOT NULL DEFAULT 'Desconhecido',
    "areaId" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FootballTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballPlayer" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "shirtNumber" INTEGER NOT NULL,
    "marketValue" INTEGER,
    "apiId" INTEGER NOT NULL,
    "contractStarted" TIMESTAMP(3) NOT NULL,
    "contractUntil" TIMESTAMP(3) NOT NULL,
    "teamId" BIGINT NOT NULL,

    CONSTRAINT "FootballPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballMatch" (
    "id" BIGSERIAL NOT NULL,
    "apiId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "homeTeamId" BIGINT NOT NULL,
    "awayTeamId" BIGINT NOT NULL,
    "competitionId" BIGINT NOT NULL,
    "goalsHome" INTEGER NOT NULL,
    "goalsAway" INTEGER NOT NULL,

    CONSTRAINT "FootballMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballMatchStatistics" (
    "id" BIGSERIAL NOT NULL,
    "matchId" BIGINT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "corner_kicks" INTEGER NOT NULL,
    "free_kicks" INTEGER NOT NULL,
    "goal_kicks" INTEGER NOT NULL,
    "offsides" INTEGER NOT NULL,
    "fouls" INTEGER NOT NULL,
    "ball_possession" INTEGER NOT NULL,
    "saves" INTEGER NOT NULL,
    "throw_ins" INTEGER NOT NULL,
    "shots" INTEGER NOT NULL,
    "shots_on_goal" INTEGER NOT NULL,
    "shots_off_goal" INTEGER NOT NULL,
    "yellow_cards" INTEGER NOT NULL,
    "yellow_red_cards" INTEGER NOT NULL,
    "red_cards" INTEGER NOT NULL,

    CONSTRAINT "FootballMatchStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "flag" TEXT,

    CONSTRAINT "FootballArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FootballLeagueToFootballTeam" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_FootballLeagueToFootballTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeague_apiId_key" ON "public"."FootballLeague"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeague_code_key" ON "public"."FootballLeague"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_apiId_key" ON "public"."FootballTeam"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballPlayer_apiId_key" ON "public"."FootballPlayer"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballMatch_apiId_key" ON "public"."FootballMatch"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballMatchStatistics_matchId_teamId_key" ON "public"."FootballMatchStatistics"("matchId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballArea_code_key" ON "public"."FootballArea"("code");

-- CreateIndex
CREATE INDEX "_FootballLeagueToFootballTeam_B_index" ON "public"."_FootballLeagueToFootballTeam"("B");

-- AddForeignKey
ALTER TABLE "public"."FootballLeague" ADD CONSTRAINT "FootballLeague_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."FootballArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballTeam" ADD CONSTRAINT "FootballTeam_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."FootballArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballPlayer" ADD CONSTRAINT "FootballPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballMatch" ADD CONSTRAINT "FootballMatch_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballMatch" ADD CONSTRAINT "FootballMatch_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballMatch" ADD CONSTRAINT "FootballMatch_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."FootballLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballMatchStatistics" ADD CONSTRAINT "FootballMatchStatistics_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."FootballMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballMatchStatistics" ADD CONSTRAINT "FootballMatchStatistics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FootballLeagueToFootballTeam" ADD CONSTRAINT "_FootballLeagueToFootballTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."FootballLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FootballLeagueToFootballTeam" ADD CONSTRAINT "_FootballLeagueToFootballTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
