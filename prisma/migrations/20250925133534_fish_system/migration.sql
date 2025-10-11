-- CreateEnum
CREATE TYPE "public"."Rarity" AS ENUM ('LEGENDARY', 'EPIC', 'RARE', 'UNCOMUM', 'COMUM');

-- CreateTable
CREATE TABLE "public"."UserFish" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fishId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fish" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "public"."Rarity" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserFishingRod" (
    "id" SERIAL NOT NULL,
    "fishingRodId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "durability" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFishingRod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FishingRod" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "public"."Rarity" NOT NULL,
    "durability" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FishingRod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFishingRod_userId_fishingRodId_key" ON "public"."UserFishingRod"("userId", "fishingRodId");

-- AddForeignKey
ALTER TABLE "public"."UserFish" ADD CONSTRAINT "UserFish_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "public"."Fish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFish" ADD CONSTRAINT "UserFish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFishingRod" ADD CONSTRAINT "UserFishingRod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFishingRod" ADD CONSTRAINT "UserFishingRod_fishingRodId_fkey" FOREIGN KEY ("fishingRodId") REFERENCES "public"."FishingRod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
