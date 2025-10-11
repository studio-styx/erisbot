-- CreateTable
CREATE TABLE "public"."Giveaway" (
    "id" SERIAL NOT NULL,
    "localId" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "blackListRoles" TEXT[],
    "blackListMembers" TEXT[],
    "onlyRoles" TEXT[],
    "rolesMultipleEntry" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserGiveaway" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "giveawayId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGiveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ConnectedGiveaways" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConnectedGiveaways_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Giveaway_messageId_key" ON "public"."Giveaway"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Giveaway_guildId_localId_key" ON "public"."Giveaway"("guildId", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGiveaway_userId_giveawayId_key" ON "public"."UserGiveaway"("userId", "giveawayId");

-- CreateIndex
CREATE INDEX "_ConnectedGiveaways_B_index" ON "public"."_ConnectedGiveaways"("B");

-- AddForeignKey
ALTER TABLE "public"."Giveaway" ADD CONSTRAINT "Giveaway_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."GuildSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGiveaway" ADD CONSTRAINT "UserGiveaway_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGiveaway" ADD CONSTRAINT "UserGiveaway_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "public"."Giveaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ConnectedGiveaways" ADD CONSTRAINT "_ConnectedGiveaways_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Giveaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ConnectedGiveaways" ADD CONSTRAINT "_ConnectedGiveaways_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."GuildSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
