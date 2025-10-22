/*
  Warnings:

  - You are about to drop the column `mailsTagsIgnored` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PetPowerType" AS ENUM ('HEAL', 'AUTOHEAL', 'DAMAGE', 'AUTODAMAGE', 'BUFF', 'DEBUFF');

-- CreateEnum
CREATE TYPE "public"."PetElement" AS ENUM ('NORMAL', 'FIRE', 'WATER', 'EARTH', 'AIR', 'ELECTRIC', 'ICE', 'DARK', 'LIGHT');

-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Pet" ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "mailsTagsIgnored",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."PetPower" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."PetPowerType" NOT NULL,
    "element" "public"."PetElement" NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetPower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PetPowerEffectiveness" (
    "id" SERIAL NOT NULL,
    "fromElement" "public"."PetElement" NOT NULL,
    "toElement" "public"."PetElement" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "fromPowerId" INTEGER,
    "toPowerId" INTEGER,

    CONSTRAINT "PetPowerEffectiveness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPetPower" (
    "id" SERIAL NOT NULL,
    "userPetId" INTEGER NOT NULL,
    "powerId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPetPower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CombatHistory" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "pet1Id" INTEGER NOT NULL,
    "pet2Id" INTEGER NOT NULL,
    "winnerPetId" INTEGER,
    "loserPetId" INTEGER,
    "amount" INTEGER,
    "roundCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CombatPowerHistory" (
    "id" SERIAL NOT NULL,
    "combatId" INTEGER NOT NULL,
    "userPetPowerId" INTEGER,
    "petId" INTEGER NOT NULL,
    "damage" INTEGER,
    "heal" INTEGER,
    "turn" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombatPowerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CombatHistory_messageId_key" ON "public"."CombatHistory"("messageId");

-- AddForeignKey
ALTER TABLE "public"."PetPowerEffectiveness" ADD CONSTRAINT "PetPowerEffectiveness_fromPowerId_fkey" FOREIGN KEY ("fromPowerId") REFERENCES "public"."PetPower"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PetPowerEffectiveness" ADD CONSTRAINT "PetPowerEffectiveness_toPowerId_fkey" FOREIGN KEY ("toPowerId") REFERENCES "public"."PetPower"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPetPower" ADD CONSTRAINT "UserPetPower_userPetId_fkey" FOREIGN KEY ("userPetId") REFERENCES "public"."UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPetPower" ADD CONSTRAINT "UserPetPower_powerId_fkey" FOREIGN KEY ("powerId") REFERENCES "public"."PetPower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatHistory" ADD CONSTRAINT "CombatHistory_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatHistory" ADD CONSTRAINT "CombatHistory_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatHistory" ADD CONSTRAINT "CombatHistory_pet1Id_fkey" FOREIGN KEY ("pet1Id") REFERENCES "public"."UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatHistory" ADD CONSTRAINT "CombatHistory_pet2Id_fkey" FOREIGN KEY ("pet2Id") REFERENCES "public"."UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatHistory" ADD CONSTRAINT "CombatHistory_winnerPetId_fkey" FOREIGN KEY ("winnerPetId") REFERENCES "public"."UserPet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatHistory" ADD CONSTRAINT "CombatHistory_loserPetId_fkey" FOREIGN KEY ("loserPetId") REFERENCES "public"."UserPet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatPowerHistory" ADD CONSTRAINT "CombatPowerHistory_combatId_fkey" FOREIGN KEY ("combatId") REFERENCES "public"."CombatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatPowerHistory" ADD CONSTRAINT "CombatPowerHistory_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombatPowerHistory" ADD CONSTRAINT "CombatPowerHistory_userPetPowerId_fkey" FOREIGN KEY ("userPetPowerId") REFERENCES "public"."UserPetPower"("id") ON DELETE SET NULL ON UPDATE CASCADE;
