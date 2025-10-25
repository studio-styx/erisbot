/*
  Warnings:

  - You are about to drop the column `bank` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PetElement" ADD VALUE 'POISON';
ALTER TYPE "public"."PetElement" ADD VALUE 'PSYCHIC';
ALTER TYPE "public"."PetElement" ADD VALUE 'METAL';
ALTER TYPE "public"."PetElement" ADD VALUE 'GHOST';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "bank";
