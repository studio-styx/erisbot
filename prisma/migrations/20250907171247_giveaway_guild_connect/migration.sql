/*
  Warnings:

  - You are about to drop the `_ConnectedGiveaways` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ConnectedGiveaways" DROP CONSTRAINT "_ConnectedGiveaways_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ConnectedGiveaways" DROP CONSTRAINT "_ConnectedGiveaways_B_fkey";

-- DropTable
DROP TABLE "public"."_ConnectedGiveaways";

-- CreateTable
CREATE TABLE "public"."GuildGiveaway" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "giveawayId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildGiveaway_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildGiveaway_messageId_key" ON "public"."GuildGiveaway"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildGiveaway_guildId_giveawayId_key" ON "public"."GuildGiveaway"("guildId", "giveawayId");

-- AddForeignKey
ALTER TABLE "public"."GuildGiveaway" ADD CONSTRAINT "GuildGiveaway_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."GuildSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildGiveaway" ADD CONSTRAINT "GuildGiveaway_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "public"."Giveaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
