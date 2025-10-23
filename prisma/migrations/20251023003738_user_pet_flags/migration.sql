-- AlterTable
ALTER TABLE "public"."PetPower" ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."UserPet" ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[];
