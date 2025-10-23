-- AlterTable
ALTER TABLE "public"."UserPetPower" ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[];
