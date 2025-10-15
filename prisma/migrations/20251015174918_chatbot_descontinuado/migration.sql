/*
  Warnings:

  - You are about to drop the column `chatBotChannels` on the `GuildSettings` table. All the data in the column will be lost.
  - You are about to drop the column `chatBotEnabled` on the `GuildSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."GuildSettings" DROP COLUMN "chatBotChannels",
DROP COLUMN "chatBotEnabled";
