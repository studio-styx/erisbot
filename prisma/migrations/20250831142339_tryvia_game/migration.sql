-- CreateEnum
CREATE TYPE "public"."TryviaStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."TryviaTypes" AS ENUM ('BOOLEAN', 'MULTIPLE', 'WRITEINCHAT');

-- CreateEnum
CREATE TYPE "public"."TryviaOrigin" AS ENUM ('USER', 'API', 'IA', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TryviaDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "public"."GuildMember" ADD COLUMN     "tryviaGames" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tryviaPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tryviaWins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."TryviaQuestions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "difficulty" "public"."TryviaDifficulty" NOT NULL,
    "type" "public"."TryviaTypes" NOT NULL DEFAULT 'WRITEINCHAT',
    "correct" BOOLEAN,
    "tags" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "correctAnswersVariation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" TEXT NOT NULL,
    "incorrectAnswers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."TryviaStatus" NOT NULL,
    "origin" "public"."TryviaOrigin" NOT NULL,

    CONSTRAINT "TryviaQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TryviaQuestions_question_type_key" ON "public"."TryviaQuestions"("question", "type");

-- AddForeignKey
ALTER TABLE "public"."GuildMember" ADD CONSTRAINT "GuildMember_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
