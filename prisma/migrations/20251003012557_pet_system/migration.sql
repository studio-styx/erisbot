-- CreateEnum
CREATE TYPE "GeneType" AS ENUM ('DOMINANT', 'RECESSIVE', 'CODOMINANT', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "PetGeneticsColorPart" AS ENUM ('COLOR1', 'COLOR2', 'EYE');

-- CreateEnum
CREATE TYPE "Animal" AS ENUM ('CAT', 'DOG', 'BIRD', 'HAMSTER', 'RABBIT', 'DRAGON', 'LION', 'JAGUAR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "Pet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "animal" "Animal" NOT NULL,
    "specie" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPet" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "hungry" INTEGER NOT NULL DEFAULT 100,
    "life" INTEGER NOT NULL DEFAULT 100,
    "happiness" INTEGER NOT NULL DEFAULT 100,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "isDead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gender" "Gender" NOT NULL,
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "pregnantEndAt" TIMESTAMP(3),
    "humor" TEXT NOT NULL DEFAULT 'normal',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spouseId" INTEGER,
    "parent1Id" INTEGER,
    "parent2Id" INTEGER,

    CONSTRAINT "UserPet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPetPersonality" (
    "id" SERIAL NOT NULL,
    "userPetId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,

    CONSTRAINT "UserPetPersonality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genetics" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "trait" TEXT NOT NULL,
    "colorPart" "PetGeneticsColorPart" NOT NULL,
    "geneType" "GeneType" NOT NULL DEFAULT 'NEUTRAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genetics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityTrait" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "geneType" "GeneType" NOT NULL DEFAULT 'NEUTRAL',

    CONSTRAINT "PersonalityTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetGenetics" (
    "id" SERIAL NOT NULL,
    "userPetId" INTEGER NOT NULL,
    "geneId" INTEGER NOT NULL,
    "inheritedFromParent1" BOOLEAN,
    "inheritedFromParent2" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetGenetics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetSkill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPetSkill" (
    "id" SERIAL NOT NULL,
    "userPetId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPetSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdoptionCenter" (
    "id" SERIAL NOT NULL,
    "userPetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteIn" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdoptionCenter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPet_spouseId_key" ON "UserPet"("spouseId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityTrait_name_key" ON "PersonalityTrait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionCenter_userPetId_key" ON "AdoptionCenter"("userPetId");

-- AddForeignKey
ALTER TABLE "UserPet" ADD CONSTRAINT "UserPet_parent1Id_fkey" FOREIGN KEY ("parent1Id") REFERENCES "UserPet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPet" ADD CONSTRAINT "UserPet_parent2Id_fkey" FOREIGN KEY ("parent2Id") REFERENCES "UserPet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPet" ADD CONSTRAINT "UserPet_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "UserPet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPet" ADD CONSTRAINT "UserPet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPet" ADD CONSTRAINT "UserPet_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPetPersonality" ADD CONSTRAINT "UserPetPersonality_userPetId_fkey" FOREIGN KEY ("userPetId") REFERENCES "UserPet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPetPersonality" ADD CONSTRAINT "UserPetPersonality_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "PersonalityTrait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Genetics" ADD CONSTRAINT "Genetics_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetGenetics" ADD CONSTRAINT "PetGenetics_userPetId_fkey" FOREIGN KEY ("userPetId") REFERENCES "UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetGenetics" ADD CONSTRAINT "PetGenetics_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Genetics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPetSkill" ADD CONSTRAINT "UserPetSkill_userPetId_fkey" FOREIGN KEY ("userPetId") REFERENCES "UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPetSkill" ADD CONSTRAINT "UserPetSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "PetSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionCenter" ADD CONSTRAINT "AdoptionCenter_userPetId_fkey" FOREIGN KEY ("userPetId") REFERENCES "UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
