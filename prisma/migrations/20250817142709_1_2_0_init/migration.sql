/*
  Warnings:

  - You are about to drop the column `carefulAnalysis` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `isSuperAvaliator` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "carefulAnalysis";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isSuperAvaliator";
