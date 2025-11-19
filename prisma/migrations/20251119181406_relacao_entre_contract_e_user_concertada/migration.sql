-- DropForeignKey
ALTER TABLE "public"."Contract" DROP CONSTRAINT "Contract_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
