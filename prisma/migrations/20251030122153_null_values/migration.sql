-- AlterTable
ALTER TABLE "public"."FootballPlayer" ALTER COLUMN "shirtNumber" DROP NOT NULL,
ALTER COLUMN "contractStarted" DROP NOT NULL,
ALTER COLUMN "contractUntil" DROP NOT NULL;
