-- DropForeignKey
ALTER TABLE "public"."UserPetPersonality" DROP CONSTRAINT "UserPetPersonality_traitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserPetPersonality" DROP CONSTRAINT "UserPetPersonality_userPetId_fkey";

-- AddForeignKey
ALTER TABLE "UserPetPersonality" ADD CONSTRAINT "UserPetPersonality_userPetId_fkey" FOREIGN KEY ("userPetId") REFERENCES "UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPetPersonality" ADD CONSTRAINT "UserPetPersonality_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "PersonalityTrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;
