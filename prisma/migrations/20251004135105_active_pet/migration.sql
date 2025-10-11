/*
  Warnings:

  - A unique constraint covering the columns `[activePetId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activePetId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_activePetId_key" ON "User"("activePetId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activePetId_fkey" FOREIGN KEY ("activePetId") REFERENCES "UserPet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
