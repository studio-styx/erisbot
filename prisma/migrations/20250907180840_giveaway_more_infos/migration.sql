/*
  Warnings:

  - Added the required column `expiresAt` to the `Giveaway` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Giveaway" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "messagesInChannelRequired" JSONB,
ADD COLUMN     "messagesInGuidsRequired" JSONB,
ADD COLUMN     "messagesRequired" INTEGER,
ADD COLUMN     "serverStayRequired" TEXT[],
ADD COLUMN     "winnersIds" TEXT[],
ADD COLUMN     "xpRequired" INTEGER;
