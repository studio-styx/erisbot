-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('API', 'USER', 'ADMIN', 'BUY', 'SELL');

-- CreateEnum
CREATE TYPE "public"."TransactionQuitType" AS ENUM ('SUB', 'SUM');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "quitType" "public"."TransactionQuitType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guildId" TEXT,
    "channelId" TEXT,
    "reason" TEXT,
    "type" "public"."TransactionType" NOT NULL DEFAULT 'USER',
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."GuildSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
