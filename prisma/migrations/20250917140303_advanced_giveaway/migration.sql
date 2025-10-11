/*
  Warnings:

  - You are about to drop the column `blackListMembers` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `blackListRoles` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `channelId` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `guildId` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `messagesInChannelRequired` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `messagesInGuidsRequired` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `messagesRequired` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `onlyRoles` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `rolesMultipleEntry` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `winnersIds` on the `Giveaway` table. All the data in the column will be lost.
  - You are about to drop the column `xpRequired` on the `Giveaway` table. All the data in the column will be lost.
  - The `serverStayRequired` column on the `Giveaway` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `GuildGiveaway` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Giveaway" DROP CONSTRAINT "Giveaway_guildId_fkey";

-- DropIndex
DROP INDEX "public"."Giveaway_guildId_localId_key";

-- DropIndex
DROP INDEX "public"."Giveaway_messageId_key";

-- AlterTable
ALTER TABLE "public"."Giveaway" DROP COLUMN "blackListMembers",
DROP COLUMN "blackListRoles",
DROP COLUMN "channelId",
DROP COLUMN "guildId",
DROP COLUMN "messageId",
DROP COLUMN "messagesInChannelRequired",
DROP COLUMN "messagesInGuidsRequired",
DROP COLUMN "messagesRequired",
DROP COLUMN "onlyRoles",
DROP COLUMN "rolesMultipleEntry",
DROP COLUMN "winnersIds",
DROP COLUMN "xpRequired",
ADD COLUMN     "usersWins" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "serverStayRequired",
ADD COLUMN     "serverStayRequired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."GuildGiveaway" ADD COLUMN     "blackListRoles" TEXT[],
ADD COLUMN     "isHost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "xpRequired" INTEGER;

-- AlterTable
ALTER TABLE "public"."UserGiveaway" ADD COLUMN     "isWinner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."RoleMultipleEntry" (
    "id" SERIAL NOT NULL,
    "giveawayId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,
    "extraEntries" INTEGER NOT NULL,

    CONSTRAINT "RoleMultipleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleMultipleEntry_giveawayId_roleId_key" ON "public"."RoleMultipleEntry"("giveawayId", "roleId");

-- CreateIndex
CREATE INDEX "Giveaway_expiresAt_idx" ON "public"."Giveaway"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."RoleMultipleEntry" ADD CONSTRAINT "RoleMultipleEntry_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "public"."Giveaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
