-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "money" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "bank" DECIMAL(12,2) NOT NULL DEFAULT 50.0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "companyId" INTEGER,
    "mailsTagsIgnored" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dmNotification" BOOLEAN NOT NULL DEFAULT false,
    "token" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "money" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "token" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Requisition" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "Requisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'info',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cooldown" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "willEndIn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cooldown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "wage" DECIMAL(12,2) NOT NULL DEFAULT 100.0,
    "expectations" JSONB NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "iaAvaliation" TEXT,
    "trend" TEXT,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockHistory" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockHolding" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StockHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildSettings" (
    "id" TEXT NOT NULL,
    "chatBotChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chatBotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "channelsCommandDisabled" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelsCommandDisabledIsHabilited" BOOLEAN NOT NULL DEFAULT false,
    "channelsCommandEnabled" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelsCommandEnabledIsHabilited" BOOLEAN NOT NULL DEFAULT false,
    "xpSystemEnabled" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "rolesXpBonus" JSONB NOT NULL DEFAULT '[]',
    "rolesNotWinXp" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channelsXpBonus" JSONB NOT NULL DEFAULT '[]',
    "channelsNotWinXp" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warnLevelUp" JSONB NOT NULL DEFAULT '{}',
    "levelGrant" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildMember" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("guildId","id")
);

-- CreateTable
CREATE TABLE "public"."Mails" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "asRead" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "whoSendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_token_key" ON "public"."Application"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Cooldown_userId_name_key" ON "public"."Cooldown"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_stockId_date_key" ON "public"."StockHistory"("stockId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StockHolding_userId_stockId_key" ON "public"."StockHolding"("userId", "stockId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requisition" ADD CONSTRAINT "Requisition_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cooldown" ADD CONSTRAINT "Cooldown_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHolding" ADD CONSTRAINT "StockHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHolding" ADD CONSTRAINT "StockHolding_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."GuildSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mails" ADD CONSTRAINT "Mails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mails" ADD CONSTRAINT "Mails_whoSendId_fkey" FOREIGN KEY ("whoSendId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
