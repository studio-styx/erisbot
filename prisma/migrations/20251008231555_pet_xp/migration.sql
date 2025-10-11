-- AlterTable
ALTER TABLE "PersonalityTrait" ADD COLUMN     "personalityConflictNames" TEXT[];

-- AlterTable
ALTER TABLE "UserPetSkill" ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "level" SET DEFAULT 1;
