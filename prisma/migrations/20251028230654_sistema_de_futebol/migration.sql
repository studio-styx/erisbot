-- CreateTable
CREATE TABLE "public"."FootballTeam" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,
    "country" TEXT NOT NULL,
    "founded" INTEGER,
    "national" BOOLEAN NOT NULL DEFAULT false,
    "logo" TEXT NOT NULL,
    "stadiumId" BIGINT,

    CONSTRAINT "FootballTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballTeamStadium" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiId" TEXT NOT NULL,
    "image" TEXT,
    "surface" TEXT,

    CONSTRAINT "FootballTeamStadium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballLeague" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FootballLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballLeagueSeason" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "leagueId" BIGINT NOT NULL,

    CONSTRAINT "FootballLeagueSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballLeagueCoverage" (
    "id" BIGSERIAL NOT NULL,
    "leagueId" BIGINT NOT NULL,
    "seasonId" BIGINT NOT NULL,
    "fixtures" BOOLEAN NOT NULL DEFAULT false,
    "standings" BOOLEAN NOT NULL DEFAULT false,
    "players" BOOLEAN NOT NULL DEFAULT false,
    "top_scorers" BOOLEAN NOT NULL DEFAULT false,
    "top_assists" BOOLEAN NOT NULL DEFAULT false,
    "top_cards" BOOLEAN NOT NULL DEFAULT false,
    "injuries" BOOLEAN NOT NULL DEFAULT false,
    "predictions" BOOLEAN NOT NULL DEFAULT false,
    "odds" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FootballLeagueCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballFixtureCoverage" (
    "id" BIGSERIAL NOT NULL,
    "events" BOOLEAN NOT NULL DEFAULT false,
    "lineups" BOOLEAN NOT NULL DEFAULT false,
    "statistics_fixtures" BOOLEAN NOT NULL DEFAULT false,
    "statistics_players" BOOLEAN NOT NULL DEFAULT false,
    "seasonId" BIGINT,

    CONSTRAINT "FootballFixtureCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballPlayer" (
    "id" BIGSERIAL NOT NULL,
    "apiId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "age" INTEGER,
    "birthDate" TIMESTAMP(3),
    "nationality" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "injured" BOOLEAN NOT NULL DEFAULT false,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" BIGINT NOT NULL,

    CONSTRAINT "FootballPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballFixture" (
    "id" BIGSERIAL NOT NULL,
    "apiId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timestamp" INTEGER,
    "referee" TEXT,
    "venueId" BIGINT,
    "status" TEXT NOT NULL,
    "statusShort" TEXT NOT NULL,
    "elapsed" INTEGER,
    "round" TEXT,
    "periods" JSONB,
    "goalsHome" INTEGER,
    "goalsAway" INTEGER,
    "scoreHalftime" JSONB,
    "scoreFulltime" JSONB,
    "scoreExtratime" JSONB,
    "scorePenalty" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leagueId" BIGINT NOT NULL,
    "seasonId" BIGINT NOT NULL,
    "homeTeamId" BIGINT NOT NULL,
    "awayTeamId" BIGINT NOT NULL,

    CONSTRAINT "FootballFixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballFixtureStatistics" (
    "id" BIGSERIAL NOT NULL,
    "fixtureId" BIGINT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "statistics" JSONB NOT NULL,

    CONSTRAINT "FootballFixtureStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballPlayerStatistics" (
    "id" BIGSERIAL NOT NULL,
    "fixtureId" BIGINT NOT NULL,
    "playerId" BIGINT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "statistics" JSONB NOT NULL,

    CONSTRAINT "FootballPlayerStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballEvent" (
    "id" BIGSERIAL NOT NULL,
    "fixtureId" BIGINT NOT NULL,
    "time" INTEGER,
    "elapsed" INTEGER,
    "type" TEXT NOT NULL,
    "teamId" BIGINT,
    "playerId" BIGINT,
    "assistId" BIGINT,
    "description" TEXT,

    CONSTRAINT "FootballEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballOdds" (
    "id" BIGSERIAL NOT NULL,
    "fixtureId" BIGINT NOT NULL,
    "bookmaker" TEXT NOT NULL,
    "lastUpdate" TIMESTAMP(3),
    "bets" JSONB NOT NULL,

    CONSTRAINT "FootballOdds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballLeagueStanding" (
    "id" BIGSERIAL NOT NULL,
    "leagueId" BIGINT NOT NULL,
    "seasonId" BIGINT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "draw" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "goalDiff" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "form" TEXT,

    CONSTRAINT "FootballLeagueStanding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballTopScorer" (
    "id" BIGSERIAL NOT NULL,
    "leagueId" BIGINT NOT NULL,
    "seasonId" BIGINT NOT NULL,
    "playerId" BIGINT NOT NULL,
    "goals" INTEGER NOT NULL,
    "penalties" INTEGER,

    CONSTRAINT "FootballTopScorer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballTopAssist" (
    "id" BIGSERIAL NOT NULL,
    "leagueId" BIGINT NOT NULL,
    "seasonId" BIGINT NOT NULL,
    "playerId" BIGINT NOT NULL,
    "assists" INTEGER NOT NULL,

    CONSTRAINT "FootballTopAssist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballTopCard" (
    "id" BIGSERIAL NOT NULL,
    "leagueId" BIGINT NOT NULL,
    "seasonId" BIGINT NOT NULL,
    "playerId" BIGINT NOT NULL,
    "yellowCards" INTEGER NOT NULL,
    "redCards" INTEGER NOT NULL,

    CONSTRAINT "FootballTopCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FootballBet" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fixtureId" BIGINT NOT NULL,
    "betType" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "stake" DECIMAL(65,30) NOT NULL,
    "odds" DECIMAL(65,30) NOT NULL,
    "potentialPayout" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "won" BOOLEAN,

    CONSTRAINT "FootballBet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_apiId_key" ON "public"."FootballTeam"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeamStadium_apiId_key" ON "public"."FootballTeamStadium"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeague_apiId_key" ON "public"."FootballLeague"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeagueCoverage_seasonId_key" ON "public"."FootballLeagueCoverage"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeagueCoverage_leagueId_seasonId_key" ON "public"."FootballLeagueCoverage"("leagueId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballFixtureCoverage_seasonId_key" ON "public"."FootballFixtureCoverage"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballPlayer_apiId_key" ON "public"."FootballPlayer"("apiId");

-- CreateIndex
CREATE INDEX "FootballPlayer_teamId_idx" ON "public"."FootballPlayer"("teamId");

-- CreateIndex
CREATE INDEX "FootballPlayer_name_idx" ON "public"."FootballPlayer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FootballFixture_apiId_key" ON "public"."FootballFixture"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballFixtureStatistics_fixtureId_teamId_key" ON "public"."FootballFixtureStatistics"("fixtureId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballPlayerStatistics_fixtureId_playerId_key" ON "public"."FootballPlayerStatistics"("fixtureId", "playerId");

-- CreateIndex
CREATE INDEX "FootballEvent_fixtureId_type_idx" ON "public"."FootballEvent"("fixtureId", "type");

-- CreateIndex
CREATE INDEX "FootballLeagueStanding_leagueId_seasonId_idx" ON "public"."FootballLeagueStanding"("leagueId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballLeagueStanding_leagueId_seasonId_teamId_key" ON "public"."FootballLeagueStanding"("leagueId", "seasonId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTopScorer_playerId_key" ON "public"."FootballTopScorer"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTopScorer_leagueId_seasonId_playerId_key" ON "public"."FootballTopScorer"("leagueId", "seasonId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTopAssist_playerId_key" ON "public"."FootballTopAssist"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTopAssist_leagueId_seasonId_playerId_key" ON "public"."FootballTopAssist"("leagueId", "seasonId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTopCard_playerId_key" ON "public"."FootballTopCard"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTopCard_leagueId_seasonId_playerId_key" ON "public"."FootballTopCard"("leagueId", "seasonId", "playerId");

-- CreateIndex
CREATE INDEX "FootballBet_userId_idx" ON "public"."FootballBet"("userId");

-- CreateIndex
CREATE INDEX "FootballBet_fixtureId_idx" ON "public"."FootballBet"("fixtureId");

-- CreateIndex
CREATE INDEX "FootballBet_status_idx" ON "public"."FootballBet"("status");

-- AddForeignKey
ALTER TABLE "public"."FootballTeam" ADD CONSTRAINT "FootballTeam_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "public"."FootballTeamStadium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballLeagueSeason" ADD CONSTRAINT "FootballLeagueSeason_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."FootballLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballLeagueCoverage" ADD CONSTRAINT "FootballLeagueCoverage_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."FootballLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballLeagueCoverage" ADD CONSTRAINT "FootballLeagueCoverage_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."FootballLeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixtureCoverage" ADD CONSTRAINT "FootballFixtureCoverage_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."FootballLeagueSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballPlayer" ADD CONSTRAINT "FootballPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixture" ADD CONSTRAINT "FootballFixture_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."FootballTeamStadium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixture" ADD CONSTRAINT "FootballFixture_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."FootballLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixture" ADD CONSTRAINT "FootballFixture_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."FootballLeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixture" ADD CONSTRAINT "FootballFixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixture" ADD CONSTRAINT "FootballFixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixtureStatistics" ADD CONSTRAINT "FootballFixtureStatistics_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."FootballFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballFixtureStatistics" ADD CONSTRAINT "FootballFixtureStatistics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballPlayerStatistics" ADD CONSTRAINT "FootballPlayerStatistics_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."FootballFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballPlayerStatistics" ADD CONSTRAINT "FootballPlayerStatistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."FootballPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballPlayerStatistics" ADD CONSTRAINT "FootballPlayerStatistics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballEvent" ADD CONSTRAINT "FootballEvent_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."FootballFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballEvent" ADD CONSTRAINT "FootballEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballEvent" ADD CONSTRAINT "FootballEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."FootballPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballEvent" ADD CONSTRAINT "FootballEvent_assistId_fkey" FOREIGN KEY ("assistId") REFERENCES "public"."FootballPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballOdds" ADD CONSTRAINT "FootballOdds_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."FootballFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballLeagueStanding" ADD CONSTRAINT "FootballLeagueStanding_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."FootballLeague"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballLeagueStanding" ADD CONSTRAINT "FootballLeagueStanding_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."FootballLeagueSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballLeagueStanding" ADD CONSTRAINT "FootballLeagueStanding_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."FootballTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballTopScorer" ADD CONSTRAINT "FootballTopScorer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."FootballPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballTopAssist" ADD CONSTRAINT "FootballTopAssist_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."FootballPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballTopCard" ADD CONSTRAINT "FootballTopCard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."FootballPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballBet" ADD CONSTRAINT "FootballBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FootballBet" ADD CONSTRAINT "FootballBet_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."FootballFixture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
