-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Animal" ADD VALUE 'BAT';
ALTER TYPE "public"."Animal" ADD VALUE 'RAVEN';
ALTER TYPE "public"."Animal" ADD VALUE 'SPIDER';
ALTER TYPE "public"."Animal" ADD VALUE 'WOLF';
ALTER TYPE "public"."Animal" ADD VALUE 'BLACK_CAT';
ALTER TYPE "public"."Animal" ADD VALUE 'GHOST_DOG';
ALTER TYPE "public"."Animal" ADD VALUE 'ZOMBIE_RABBIT';
ALTER TYPE "public"."Animal" ADD VALUE 'SKELETON_HORSE';
ALTER TYPE "public"."Animal" ADD VALUE 'PUMPKIN_GOLEM';
