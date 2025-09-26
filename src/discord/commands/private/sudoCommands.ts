import { createCommand } from "#base";
import { prisma } from "#database";
import { stocksEventuals, res, icon, processApiQuestions } from "#functions";
import { menus } from "#menus";
import { Mails, Rarity } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createSeparator } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, time } from "discord.js";

createCommand({
    name: "sudo",
    description: "sudo commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "database",
            description: "database function",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "test",
            description: "test function",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "giveawaystress",
            description: "make a giveaway stress",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "force-stock-variation",
            description: "force stock variation",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "send-mail",
            description: "send a mail to one or more users",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "users",
                    description: "id(s), or all",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "content",
                    description: "contents for the mail",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "set-work",
            description: "give work to a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "user",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "work",
                    description: "work",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: "db-manage",
            description: "database management",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "ephemeral",
                    description: "ephemeral",
                    type: ApplicationCommandOptionType.Boolean,
                }
            ]
        },
        {
            name: "eval",
            description: "eval",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "code",
                    description: "code",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "depth",
                    description: "depth",
                    type: ApplicationCommandOptionType.Integer,
                    required: false
                },
                {
                    name: "show-hidden",
                    description: "show hidden",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false
                }
            ]
        },
        {
            name: "dashboard",
            description: "open the dev dashboard",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "force-pipeline",
            description: "force pipeline",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async autocomplete(interaction) {
        if (interaction.user.id !== "1171963692984844401") return;
        const { options } = interaction;
        const focused = options.getFocused();
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "set-work": {
                const companys = await prisma.company.findMany({
                    where: {
                        OR: [
                            {
                                name: {
                                    contains: focused,
                                    mode: "insensitive"
                                }
                            },
                            {
                                description: {
                                    contains: focused,
                                    mode: "insensitive"
                                }
                            },
                            {
                                id: {
                                    equals: Number(focused),
                                }
                            }
                        ]
                    },
                    select: {
                        name: true,
                        id: true
                    }
                });

                if (companys.length === 0) {
                    await interaction.respond([
                        {
                            name: "Nenhuma empresa encontrada",
                            value: "null"
                        }
                    ])
                } else {
                    await interaction.respond(companys.map(c => ({
                        name: c.name,
                        value: c.id.toString()
                    })))
                }
                return;
            }
        }
    },
    async run(interaction): Promise<any> {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("You are not allowed to use this command!"));
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "database": {
                await interaction.deferReply();
                /*
                const raw = await fs.readFile("database.json", "utf-8")
                const { company, user, stock, stockHolding, stockHistory, guildMember, guildSettings, tryviaQuestions, application } = JSON.parse(raw);

                await prisma.$transaction([
                    prisma.log.deleteMany(),
                    prisma.user.deleteMany(),
                    prisma.guildSettings.deleteMany(),
                ]);

                await prisma.$transaction(async (tx) => {
                    await interaction.editReply(res.warning(`${icon.waiting_white} | Migrando empresas...`));
                    // companias
                    for (const c of company) {
                        await tx.company.create({
                            data: {
                                name: c.name,
                                description: c.description,
                                expectations: c.expectations,
                                difficulty: c.difficulty,
                                wage: c.wage,
                                experience: c.experience,
                            }
                        })
                    }
                    
                    await interaction.editReply(res.warning(`${icon.waiting_white} | Migrando usuários...`));
                    // usuários
                    for (const u of user) {
                        await tx.user.create({
                            data: {
                                id: u.id,
                                bank: u.bank,
                                money: u.money,
                                xp: u.xp,
                                mailsTagsIgnored: u.mailsTagsIgnored,
                                dmNotification: u.dmNotification,
                            }
                        })
                    }

                    await interaction.editReply(res.warning(`${icon.waiting_white} | Migrando ações...`));
                    // stocks
                    for (const s of stock) {
                        await tx.stock.create({
                            data: {
                                name: s.name,
                                description: s.description,
                                price: s.price,
                                trend: s.trend,
                                iaAvaliation: s.iaAvaliation
                            }
                        })
                    }

                    await interaction.editReply(res.warning(`${icon.waiting_white} | Migrando configurações de servers...`));
                    // guilds
                    for (const g of guildSettings) {
                        await tx.guildSettings.create({
                            data: {
                                id: g.id,
                                channelsCommandDisabled: g.channelsCommandDisabled,
                                channelsCommandDisabledIsHabilited: g.channelsCommandDisabledIsHabilited,
                                channelsCommandEnabled: g.channelsCommandEnabled,
                                channelsCommandEnabledIsHabilited: g.channelsCommandEnabledIsHabilited,
                                channelsNotWinXp: g.channelsNotWinXp,
                                channelsXpBonus: g.channelsXpBonus,
                                chatBotChannels: g.chatBotChannels,
                                chatBotEnabled: g.chatBotEnabled,
                                difficulty: g.difficulty,
                                levelGrant: g.levelGrant,
                                rolesNotWinXp: g.rolesNotWinXp,
                                rolesXpBonus: g.rolesXpBonus,
                                warnLevelUp: g.warnLevelUp,
                                xpSystemEnabled: g.xpSystemEnabled,
                            }
                        })
                    }
                    await interaction.editReply(res.warning(`${icon.waiting_white} | Migrando membros...`));
                    for (const g of guildMember) {
                        await tx.user.upsert({
                            where: {
                                id: g.id
                            },
                            update: {},
                            create: {
                                id: g.id
                            }
                        })
                        await tx.guildMember.create({
                            data: {
                                id: g.id,
                                guildId: g.guildId,
                                xp: g.xp,
                            },
                        });
                    }

                    await interaction.editReply(res.warning(`${icon.waiting_white} | Migrando questões de trivia...`));
                    // tryvia questions
                    await tx.tryviaQuestions.createMany({
                        data: tryviaQuestions.map((q: TryviaQuestions) => ({
                            question: q.question,
                            correctAnswer: q.correctAnswer,
                            difficulty: q.difficulty,
                            type: q.type,
                            correct: q.correct,
                            tags: q.tags,
                            correctAnswersVariation: q.correctAnswersVariation,
                            explanation: q.explanation,
                            incorrectAnswers: q.incorrectAnswers,
                            createdAt: q.createdAt,
                            updatedAt: q.updatedAt,
                            status: q.status,
                            origin: q.origin
                        }))
                    })

                    await interaction.editReply(res.warning(`${icon.waiting_white} | migrando aplicações...`));
                    // applications
                    await tx.application.createMany({
                        data: application
                    })
                }, {
                    timeout: 120000,
                    maxWait: 120000
                })
                */

                interaction.editReply(res.success("Migração concluída"))
                return;
            }
            case "test": {
                await interaction.deferReply()

                const fishesByRarity: { name: string; rarity: Rarity; price: number; }[] = [
                    // COMUNS
                    { name: "Tilápia", rarity: "COMUM", price: 3 },
                    { name: "Sardinha", rarity: "COMUM", price: 4 },
                    { name: "Lambari", rarity: "COMUM", price: 2 },
                    { name: "Bagre", rarity: "COMUM", price: 2 },
                    { name: "Mandí", rarity: "COMUM", price: 5 },
                    { name: "Jundiá", rarity: "COMUM", price: 6 },

                    // UNCOMUNS
                    { name: "Pacu", rarity: "UNCOMUM", price: 8 },
                    { name: "Tambaqui", rarity: "UNCOMUM", price: 7 },
                    { name: "Carpa", rarity: "UNCOMUM", price: 9 },
                    { name: "Curimbatá", rarity: "UNCOMUM", price: 10 },
                    { name: "Traíra", rarity: "UNCOMUM", price: 11 },
                    { name: "Piraputanga", rarity: "UNCOMUM", price: 12 },

                    // RARES
                    { name: "Dourado", rarity: "RARE", price: 20 },
                    { name: "Atum", rarity: "RARE", price: 25 },
                    { name: "Salmão", rarity: "RARE", price: 18 },
                    { name: "Tucunaré", rarity: "RARE", price: 22 },
                    { name: "Robalo", rarity: "RARE", price: 28 },
                    { name: "Garoupa", rarity: "RARE", price: 30 },

                    // EPICS
                    { name: "Peixe-Espada", rarity: "EPIC", price: 60 },
                    { name: "Polvo Gigante", rarity: "EPIC", price: 65 },
                    { name: "Arraia", rarity: "EPIC", price: 50 },
                    { name: "Enguia Elétrica", rarity: "EPIC", price: 55 },
                    { name: "Peixe-Lua", rarity: "EPIC", price: 70 },

                    // LEGENDARIES
                    { name: "Lula Colossal", rarity: "LEGENDARY", price: 200 },
                    { name: "Peixe-Dragão", rarity: "LEGENDARY", price: 250 },
                    { name: "Leviatã", rarity: "LEGENDARY", price: 300 },
                    { name: "Serpente Marinha", rarity: "LEGENDARY", price: 280 },
                    { name: "Koi Dourado", rarity: "LEGENDARY", price: 220 },
                    { name: "Kraken Ancestral", rarity: "LEGENDARY", price: 350 }
                ];



                const rodsByRarity: Record<Rarity, { names: string[], priceRange: [number, number], durability: [number, number] }> = {
                    COMUM: {
                        names: ['Vara Simples', 'Vara de Bambu'],
                        priceRange: [100, 200],
                        durability: [25, 35],
                    },
                    UNCOMUM: {
                        names: ['Vara Reforçada', 'Vara de Madeira Polida'],
                        priceRange: [200, 400],
                        durability: [40, 60],
                    },
                    RARE: {
                        names: ['Vara de Fibra de Carbono', 'Vara Profissional'],
                        priceRange: [350, 600],
                        durability: [70, 90],
                    },
                    EPIC: {
                        names: ['Vara Encantada', 'Vara Real'],
                        priceRange: [700, 1000],
                        durability: [100, 140],
                    },
                    LEGENDARY: {
                        names: ['Vara Divina', 'Vara do Leviatã'],
                        priceRange: [1100, 1600],
                        durability: [180, 220],
                    },
                }

                function randomInRange([min, max]: [number, number]) {
                    return Math.floor(Math.random() * (max - min + 1)) + min
                }

                async function main() {
                    interaction.editReply(res.warning(`${icon.waiting_white} | Iniciando seed...`))
                    await prisma.fish.deleteMany();
                    await prisma.fish.createMany({
                        data: fishesByRarity
                    })

                    interaction.editReply(res.warning(`${icon.waiting_white} | Peixes criados, agora criando varas...`))
                    for (const [rarity, data] of Object.entries(rodsByRarity)) {
                        for (const name of data.names) {
                            await prisma.fishingRod.create({
                                data: {
                                    name,
                                    rarity: rarity as Rarity,
                                    price: randomInRange(data.priceRange),
                                    durability: randomInRange(data.durability),
                                },
                            })
                        }
                    }
                }

                await main();

                /*
                const [application, company, guildMember, guildSettings, mails, stock, stockHistory, stockHolding, user, tryviaQuestions] = await prisma.$transaction([
                    prisma.application.findMany(),
                    prisma.company.findMany(),
                    prisma.guildMember.findMany(),
                    prisma.guildSettings.findMany(),
                    prisma.mails.findMany(),
                    prisma.stock.findMany(),
                    prisma.stockHistory.findMany(),
                    prisma.stockHolding.findMany(),
                    prisma.user.findMany(),
                    prisma.tryviaQuestions.findMany()
                ])

                await fs.writeFile(
                    "database.json",
                    JSON.stringify({
                        application,
                        company,
                        guildMember,
                        guildSettings,
                        mails,
                        stock,
                        stockHistory,
                        stockHolding,
                        user,
                        tryviaQuestions
                    }, null, 2)
                )
                    */
                interaction.editReply(res.success("Database povoada! concluído"))
                return;
            }
            case "force-stock-variation": {
                await interaction.deferReply();

                await stocksEventuals();

                interaction.editReply(res.success("Forced stock variation"));
                return;
            }
            case "force-pipeline": {
                await interaction.deferReply();

                try {
                    await interaction.editReply(res.warning(`${icon.waiting_white} | Reproduzindo...`))
                    await processApiQuestions();
                    await interaction.editReply(res.success(`${icon.success} | Reproduzido com sucesso!`))
                } catch (error) {
                    console.error(error);
                    await interaction.editReply(res.danger(`${icon.error} | Um erro ocorreu ao tentar reproduzir: ${error}`))
                }
                return;
            }
            case "send-mail": {
                await interaction.deferReply({ flags });
                const users = interaction.options.getString("users", true);
                const content = interaction.options.getString("content", true);

                const sendMailDm = async (mail: Mails) => {
                    const components: any[] = [
                        brBuilder(
                            `# ${icon.mail} | Carta recebida de: ${interaction.user.username}`,
                            `-# ╰ ID da carta: ${mail.id}`,
                            `-# ╰ Data de recebimento: ${time(mail.createdAt, "D")}`
                        ),
                        createSeparator(),
                        "### Conteúdo:",
                        mail.content,
                    ]
                    return createContainer({
                        accentColor: settings.colors.fuchsia,
                        components,
                    })
                }

                if (users === "all") {
                    const allUsers = await prisma.user.findMany();

                    try {
                        await prisma.$transaction(async (tx) => {
                            let usersCount = 0
                            for (const user of allUsers) {
                                const mail = await tx.mails.create({
                                    data: {
                                        content,
                                        userId: user.id,
                                        whoSendId: interaction.user.id
                                    }
                                })
                                usersCount++;
                                if (!user.mailsTagsIgnored) continue;
                                try {
                                    const discordUser = await interaction.client.users.fetch(user.id);
                                    if (discordUser) {
                                        const container = await sendMailDm(mail);
                                        await discordUser.send({ flags: ["IsComponentsV2"], components: [container] })
                                    }
                                } catch (error) {
                                    continue;
                                }
                            }

                            interaction.editReply(res.success(`Sent ${usersCount} mails`));
                        })
                    } catch (error) {
                        console.error(error);
                        interaction.editReply(res.danger("Something went wrong"));
                    }
                    return;
                } else {
                    const usersSeparated: string[] = users.split(",");

                    if (usersSeparated.length === 0) {
                        interaction.editReply(res.danger("No users found"));
                        return;
                    }
                    try {
                        await prisma.$transaction(async (tx) => {
                            const successUsers: string[] = [];
                            const failedUsers: { id: string; reason: string }[] = [];
                            for (const id of usersSeparated) {
                                const discordUser = await interaction.client.users.fetch(id).catch(() => null);

                                if (!discordUser) {
                                    failedUsers.push({ id, reason: "User not found" });
                                    continue;
                                }

                                const user = await tx.user.upsert({
                                    where: { id },
                                    create: { id },
                                    update: {}
                                });

                                const mail = await tx.mails.create({
                                    data: {
                                        content,
                                        userId: id,
                                        whoSendId: interaction.user.id
                                    }
                                });

                                successUsers.push(discordUser.displayName);
                                if (!user.mailsTagsIgnored) continue;
                                try {
                                    const container = await sendMailDm(mail);
                                    await discordUser.send({ flags: ["IsComponentsV2"], components: [container] })
                                } catch (error) {
                                    continue;
                                }
                            }

                            interaction.editReply(res.success(`Sent ${successUsers.length} mails to **${successUsers.length === 0 ? "\`no one\`" : successUsers.join(", ")}** ${failedUsers.length === 0 ? "" : `But failed in: **${failedUsers.map(u => `${u.id} - \`${u.reason}\`**`).join(", ")}`}`))
                        })
                    } catch (error) {
                        console.error(error);
                        interaction.editReply(res.danger("Something went wrong"));
                    }
                    return;
                }
            }
            case "set-work": {
                await interaction.deferReply({ flags });
                const user = interaction.options.getUser("user", true);
                const work = interaction.options.getString("work", true);

                const company = await prisma.company.findUnique({
                    where: {
                        id: Number(work)
                    }
                });

                if (!company) {
                    interaction.editReply(res.danger("Company not found"));
                    return;
                }

                try {
                    await prisma.user.upsert({
                        where: {
                            id: user.id
                        },
                        update: {
                            companyId: company.id
                        },
                        create: {
                            id: user.id,
                            companyId: company.id
                        }
                    })
                } catch (error) {
                    interaction.editReply(res.danger("Something went wrong"));
                    return;
                }
                interaction.editReply(res.success(`Sucesso ao dar o emprego para ${user.username}`));
                return
            }
            case "eval": {
                const code = interaction.options.getString("code", true);

                await interaction.deferReply();

                try {
                    let result;
                    let isPrisma = code.includes("prisma.");
                    let isCtx = code.includes("ctx.");

                    if (isPrisma && !code.includes("await")) {
                        await interaction.editReply(res.danger("Operações Prisma devem usar 'await'. Exemplo: \`'await prisma.user.findUnique(...)'\`"));
                        return;
                    }

                    if (isPrisma) {
                        // Validação para operações Prisma
                        const prismaOperations = [
                            "findUnique", "findMany", "create", "update",
                            "delete", "upsert", "findFirst", "count", "deleteMany",
                            "createMany", "updateMany", "updateManyAndReturn"
                        ];
                        const hasValidOperation = prismaOperations.some(op => code.includes(`.${op}(`));
                        if (!hasValidOperation) {
                            await interaction.editReply(res.danger("Operação Prisma inválida ou não suportada detectada."));
                            return;
                        }

                        // Executa código Prisma
                        result = await eval(`(async () => { return ${code} })()`);
                    } else if (isCtx) {
                        // Executa código com ctx no estilo aoi.js
                        result = await eval(`(async () => { return ${code} })()`);
                    } else {
                        // Executa JavaScript puro
                        result = eval(code);
                    }

                    // Formata e envia o resultado
                    const formattedResult = JSON.stringify(result, null, 2);
                    await interaction.editReply(res.success(`Resultado: \`\`\`json\n${formattedResult.slice(0, 3000)}\`\`\``, { flags: [] }));

                    // Envia o restante do resultado, se necessário
                    if (formattedResult.length > 3000) {
                        let remaining = formattedResult.slice(3000);
                        while (remaining.length > 0) {
                            const chunk = remaining.slice(0, 3900);
                            await interaction.followUp(res.success(`\`\`\`json\n${chunk}\`\`\``, { flags: [] }));
                            remaining = remaining.slice(3900);
                        }
                    }
                } catch (error: any) {
                    await interaction.editReply(res.danger(`Ocorreu um erro: ${error.message}`));
                } finally {
                    if (code.includes("prisma.")) {
                        await prisma.$disconnect();
                    }
                }
                return;
            }
            case "dashboard": {
                interaction.reply(menus.dev.dashboard())
                return;
            }
            /*
            case "giveawaystress": {
                await interaction.deferReply();

                const giveawaysExpiresAt = new Date(Date.now() + 1000 * 60 * 4); // 4 minutos
                const staggeredExpiresAt = new Date(giveawaysExpiresAt.getTime() + 1000 * 30); // 30s depois

                await interaction.editReply(res.warning(`${icon.waiting_white} | Fazendo estresse para o horário ${time(giveawaysExpiresAt, "D")}`));

                const giveawaysToDate = 30;
                const ids = [
                    { channelId: "1397264957736882196", guildId: "1397263644315750411" },
                    { channelId: "1418740291736961124", guildId: "1397263644315750411" },
                    { channelId: "1397264968520433755", guildId: "1397263644315750411" },
                    { channelId: "1397264957736882196", guildId: "1397263644315750411" },
                    { channelId: "1397263817049636884", guildId: "1397263644315750411" },
                    { guildId: "1395383469210865694", channelId: "1395418989911478362" },
                    { guildId: "1172930138770526248", channelId: "1172930138770526251" },
                    { guildId: "1172930138770526248", channelId: "1178024982887014470" },
                ];

                // IDs únicos de guilds para sorteios conectados
                const uniqueGuildIds = [...new Set(ids.map(id => id.guildId))];
                console.log(`DEBUG: Guilds únicas disponíveis: ${uniqueGuildIds.length} - ${uniqueGuildIds.join(', ')}`);

                let localId = 110;
                let successCount = 0;
                let errorCount = 0;

                // PRIMEIRO LOOP: 30 sorteios principais
                console.log(`🔄 Criando ${giveawaysToDate} sorteios principais...`);
                for (let i = 0; i < giveawaysToDate; i++) {
                    try {
                        const isConnectedGiveaway = Math.random() < 0.3; // 30% de chance de ser conectado
                        const isUniversalGiveaway = i === 0; // Primeiro sorteio é universal (conectado a todos)

                        // Dados base do sorteio
                        const giveawayData = {
                            expiresAt: giveawaysExpiresAt,
                            title: `Sorteio de Estresse ${i + 1}`,
                            description: `Sorteio de teste de estresse - ${isConnectedGiveaway ? 'CONECTADO' : 'SIMPLES'} ${isUniversalGiveaway ? '(UNIVERSAL)' : ''}`,
                            localId: localId + i,
                            serverStayRequired: false, // Simplificado para testes
                            usersWins: 1
                        };

                        // Criar sorteio no banco
                        const giveawayCreated = await prisma.giveaway.create({
                            data: giveawayData
                        });

                        let connectedGuildCount = 0;

                        if (isConnectedGiveaway || isUniversalGiveaway) {
                            // Sorteio conectado - conectar a múltiplas guilds
                            const guildsToConnect = isUniversalGiveaway
                                ? uniqueGuildIds // Todos os servers
                                : uniqueGuildIds.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 servers aleatórios

                            console.log(`DEBUG: Sorteio ${giveawayCreated.id} será conectado a ${guildsToConnect.length} guilds`);

                            // Criar conexões para cada guild
                            const guildConnections = guildsToConnect.map(async (guildId, index) => {
                                const id = ids.find(item => item.guildId === guildId);
                                if (!id) return null;

                                const guild = interaction.client.guilds.cache.get(guildId);
                                if (!guild) return null;

                                const channel = guild.channels.cache.get(id.channelId);
                                if (!channel || !channel.isTextBased()) return null;

                                // Criar mensagem placeholder para messageId
                                const placeholderMessageId = `placeholder_${giveawayCreated.id}_${guildId}`;

                                const connectionData = {
                                    giveawayId: giveawayCreated.id,
                                    channelId: channel.id,
                                    guildId: guild.id,
                                    messageId: placeholderMessageId,
                                    blackListRoles: [],
                                    xpRequired: null,
                                    isHost: index === 0 // Primeira guild é host
                                };

                                return {
                                    data: connectionData,
                                    channel,
                                    guildName: guild.name
                                };
                            });

                            const validConnections = (await Promise.all(guildConnections)).filter(Boolean);
                            connectedGuildCount = validConnections.length;

                            if (connectedGuildCount > 0) {
                                // Criar todas as conexões em uma transação
                                await prisma.$transaction([
                                    ...validConnections.map(({ data }) => prisma.guildGiveaway.create({ data })),
                                    // Adicionar participante
                                    prisma.userGiveaway.create({
                                        data: {
                                            giveawayId: giveawayCreated.id,
                                            userId: "1171963692984844401",
                                            isWinner: false
                                        }
                                    })
                                ]);

                                // Enviar mensagens para todas as guilds conectadas
                                const messagePromises = validConnections.map(async ({ channel, guildName }) => {
                                    try {
                                        const dbConnectedGuilds = await prisma.guildGiveaway.findMany({
                                            where: { giveawayId: giveawayCreated.id, guildId: guild.id }
                                        });

                                        const connectedGuildsWithNames = dbConnectedGuilds.map(g => ({
                                            ...g,
                                            guildName: guild.name
                                        }));

                                        const completeData = {
                                            ...giveawayCreated,
                                            roleEntries: [],
                                            connectedGuilds: connectedGuildsWithNames.map(g => ({ ...g, guildName: guild.name })),
                                            participants: [{
                                                userId: "1171963692984844401",
                                                isWinner: false,
                                                giveawayId: giveawayCreated.id,
                                                id: 0,
                                                createdAt: new Date()
                                            }]
                                        };
                                        const message = await channel.send(
                                            menus.giveaway.giveawayInterface(completeData, channel.guildId)
                                        );

                                        // Atualizar messageId real
                                        await prisma.guildGiveaway.updateMany({
                                            where: {
                                                giveawayId: giveawayCreated.id,
                                                guildId: channel.guildId,
                                                messageId: { startsWith: `placeholder_${giveawayCreated.id}` }
                                            },
                                            data: { messageId: message.id }
                                        });

                                        console.log(`✅ Mensagem enviada para ${guildName} (${channel.id})`);
                                        return true;
                                    } catch (error) {
                                        console.error(`❌ Erro ao enviar mensagem para ${guildName}:`, error);
                                        return false;
                                    }
                                });

                                const messageResults = await Promise.all(messagePromises);
                                const successMessages = messageResults.filter(Boolean).length;

                                console.log(`🎯 Sorteio ${giveawayCreated.id} conectado: ${successMessages}/${connectedGuildCount} mensagens enviadas`);
                            }
                        } else {
                            // Sorteio simples - apenas uma guild
                            const id = ids[Math.floor(Math.random() * ids.length)];
                            const guild = interaction.client.guilds.cache.get(id.guildId);

                            if (guild) {
                                const channel = guild.channels.cache.get(id.channelId);
                                if (channel && channel.isTextBased()) {
                                    // Criar conexão simples
                                    await prisma.$transaction([
                                        prisma.guildGiveaway.create({
                                            data: {
                                                giveawayId: giveawayCreated.id,
                                                channelId: channel.id,
                                                guildId: guild.id,
                                                messageId: `placeholder_${giveawayCreated.id}`,
                                                blackListRoles: [],
                                                xpRequired: null
                                            }
                                        }),
                                        // Adicionar participante
                                        prisma.userGiveaway.create({
                                            data: {
                                                giveawayId: giveawayCreated.id,
                                                userId: "1171963692984844401",
                                                isWinner: false
                                            }
                                        })
                                    ]);

                                    try {
                                        const dbConnectedGuilds = await prisma.guildGiveaway.findMany({
                                            where: { giveawayId: giveawayCreated.id, guildId: guild.id }
                                        });

                                        const connectedGuildsWithNames = dbConnectedGuilds.map(g => ({
                                            ...g,
                                            guildName: guild.name
                                        }));

                                        const completeData = {
                                            ...giveawayCreated,
                                            roleEntries: [],
                                            connectedGuilds: connectedGuildsWithNames.map(g => ({ ...g, guildName: guild.name })),
                                            participants: [{
                                                userId: "1171963692984844401",
                                                isWinner: false,
                                                giveawayId: giveawayCreated.id,
                                                id: 0,
                                                createdAt: new Date()
                                            }]
                                        };

                                        const message = await channel.send(
                                            menus.giveaway.giveawayInterface(completeData, guild.id)
                                        );

                                        // Atualizar messageId real
                                        await prisma.guildGiveaway.update({
                                            where: {
                                                guildId_giveawayId: {
                                                    guildId: guild.id,
                                                    giveawayId: giveawayCreated.id
                                                }
                                            },
                                            data: { messageId: message.id }
                                        });

                                        connectedGuildCount = 1;
                                        console.log(`✅ Sorteio simples ${giveawayCreated.id} criado em ${guild.name}`);
                                    } catch (error) {
                                        console.error(`❌ Erro ao criar sorteio simples ${giveawayCreated.id}:`, error);
                                    }
                                }
                            }
                        }

                        if (connectedGuildCount > 0) {
                            successCount++;
                            // Agendar finalização se for sorteio curto
                            if (giveawayCreated.expiresAt.getTime() <= Date.now() + 1000 * 60 * 12) {
                                console.log(`⏰ Agendando finalização imediata para sorteio ${giveawayCreated.id}`);
                                // Aqui você pode chamar scheduleGiveaway se quiser testar o agendamento
                            }
                        } else {
                            errorCount++;
                            // Cleanup: deletar sorteio sem conexões
                            await prisma.giveaway.delete({ where: { id: giveawayCreated.id } }).catch(() => { });
                        }

                    } catch (error) {
                        console.error(`❌ Erro ao criar sorteio ${i + 1}:`, error);
                        errorCount++;
                    }
                }

                // SEGUNDO LOOP: 10 sorteios escalonados (expiram 30s depois)
                console.log(`\n🔄 Criando 10 sorteios escalonados...`);
                const staggeredGiveaways = 10;
                let staggeredSuccess = 0;

                for (let i = 0; i < staggeredGiveaways; i++) {
                    try {
                        const staggeredExpiresAtOffset = new Date(staggeredExpiresAt.getTime() + (i * 1000 * 5)); // 5s entre cada
                        const isStaggeredConnected = Math.random() < 0.4; // 40% chance de conectado

                        const giveawayData = {
                            expiresAt: staggeredExpiresAtOffset,
                            title: `Sorteio Escal. ${i + 1}`,
                            description: `Sorteio escalonado de teste - Expira ${time(staggeredExpiresAtOffset, "R")}s`,
                            localId: localId + giveawaysToDate + i,
                            serverStayRequired: false,
                            usersWins: 1
                        };

                        const giveawayCreated = await prisma.giveaway.create({
                            data: giveawayData
                        });

                        let connectedGuildCount = 0;

                        if (isStaggeredConnected) {
                            // Conectar a 1-2 guilds aleatórias
                            const guildsToConnect = uniqueGuildIds.slice(0, Math.floor(Math.random() * 2) + 1);

                            const validConnections = guildsToConnect.map(async (guildId) => {
                                const id = ids.find(item => item.guildId === guildId);
                                if (!id) return null;

                                const guild = interaction.client.guilds.cache.get(guildId);
                                if (!guild) return null;

                                const channel = guild.channels.cache.get(id.channelId);
                                if (!channel || !channel.isTextBased()) return null;

                                const placeholderMessageId = `staggered_${giveawayCreated.id}_${guildId}`;

                                await prisma.guildGiveaway.create({
                                    data: {
                                        giveawayId: giveawayCreated.id,
                                        channelId: channel.id,
                                        guildId: guild.id,
                                        messageId: placeholderMessageId,
                                        blackListRoles: [],
                                        xpRequired: null
                                    }
                                });

                                await prisma.userGiveaway.create({
                                    data: {
                                        giveawayId: giveawayCreated.id,
                                        userId: "1171963692984844401",
                                        isWinner: false
                                    }
                                });

                                const dbConnectedGuilds = await prisma.guildGiveaway.findMany({
                                    where: { giveawayId: giveawayCreated.id, guildId: guild.id }
                                });

                                const connectedGuildsWithNames = dbConnectedGuilds.map(g => ({
                                    ...g,
                                    guildName: guild.name
                                }));

                                const completeData = {
                                    ...giveawayCreated,
                                    roleEntries: [],
                                    connectedGuilds: connectedGuildsWithNames.map(g => ({ ...g, guildName: guild.name })),
                                    participants: [{
                                        userId: "1171963692984844401",
                                        isWinner: false,
                                        giveawayId: giveawayCreated.id,
                                        id: 0,
                                        createdAt: new Date()
                                    }]
                                };

                                const message = await channel.send(
                                    menus.giveaway.giveawayInterface(completeData, guild.id)
                                );

                                await prisma.guildGiveaway.update({
                                    where: {
                                        guildId_giveawayId: {
                                            guildId: guild.id,
                                            giveawayId: giveawayCreated.id
                                        }
                                    },
                                    data: { messageId: message.id }
                                });

                                return { guild: guild.name, channel: channel.id };
                            });

                            const results = await Promise.all(validConnections);
                            connectedGuildCount = results.filter(r => r !== null).length;

                            if (connectedGuildCount > 0) {
                                staggeredSuccess++;
                                console.log(`✅ Sorteio escalonado ${giveawayCreated.id} criado (${connectedGuildCount} guilds)`);
                            }
                        } else {
                            // Sorteio simples escalonado
                            const id = ids[Math.floor(Math.random() * ids.length)];
                            const guild = interaction.client.guilds.cache.get(id.guildId);

                            if (guild) {
                                const channel = guild.channels.cache.get(id.channelId);
                                if (channel && channel.isTextBased()) {
                                    await prisma.$transaction([
                                        prisma.guildGiveaway.create({
                                            data: {
                                                giveawayId: giveawayCreated.id,
                                                channelId: channel.id,
                                                guildId: guild.id,
                                                messageId: `staggered_${giveawayCreated.id}`,
                                                blackListRoles: [],
                                                xpRequired: null
                                            }
                                        }),
                                        prisma.userGiveaway.create({
                                            data: {
                                                giveawayId: giveawayCreated.id,
                                                userId: "1171963692984844401",
                                                isWinner: false
                                            }
                                        })
                                    ]);

                                    // Fetch the connectedGuilds from the database to get all required fields
                                    const dbConnectedGuilds = await prisma.guildGiveaway.findMany({
                                        where: { giveawayId: giveawayCreated.id, guildId: guild.id }
                                    });

                                    const connectedGuildsWithNames = dbConnectedGuilds.map(g => ({
                                        ...g,
                                        guildName: guild.name
                                    }));

                                    const completeData = {
                                        ...giveawayCreated,
                                        roleEntries: [],
                                        connectedGuilds: connectedGuildsWithNames.map(g => ({ ...g, guildName: guild.name })),
                                        participants: [{
                                            userId: "1171963692984844401",
                                            isWinner: false,
                                            giveawayId: giveawayCreated.id,
                                            id: 0,
                                            createdAt: new Date()
                                        }]
                                    };

                                    const message = await channel.send(
                                        menus.giveaway.giveawayInterface(completeData, guild.id)
                                    );

                                    await prisma.guildGiveaway.update({
                                        where: {
                                            guildId_giveawayId: {
                                                guildId: guild.id,
                                                giveawayId: giveawayCreated.id
                                            }
                                        },
                                        data: { messageId: message.id }
                                    });

                                    connectedGuildCount = 1;
                                    staggeredSuccess++;
                                    console.log(`✅ Sorteio escalonado simples ${giveawayCreated.id} em ${guild.name}`);
                                }
                            }
                        }

                        if (connectedGuildCount === 0) {
                            await prisma.giveaway.delete({ where: { id: giveawayCreated.id } }).catch(() => { });
                        }

                    } catch (error) {
                        console.error(`❌ Erro ao criar sorteio escalonado ${i + 1}:`, error);
                    }
                }

                // Relatório final
                const totalCreated = successCount + staggeredSuccess;
                const totalErrors = errorCount + (staggeredGiveaways - staggeredSuccess);

                await interaction.editReply(res.success(
                    `✅ **Estresse de Sorteios Concluído!**\n` +
                    `📊 **Estatísticas:**\n` +
                    `• ${successCount}/30 sorteios principais criados\n` +
                    `• ${staggeredSuccess}/10 sorteios escalonados criados\n` +
                    `• ${totalCreated} sorteios totais\n` +
                    `• ${totalErrors} erros\n` +
                    `⏰ Expiração principal: ${time(giveawaysExpiresAt, "d")}\n` +
                    `⏰ Expiração escalonada: ${time(staggeredExpiresAt, "d")}`
                ));

                console.log(`\n🎉 RESUMO FINAL:\n` +
                    `✅ ${successCount} sorteios principais OK\n` +
                    `✅ ${staggeredSuccess} sorteios escalonados OK\n` +
                    `❌ ${totalErrors} erros\n` +
                    `⏰ Todos expiram em ${time(giveawaysExpiresAt, "d")}`);

                scheduleAllEndGiveaways(interaction.client)
                break;
            }
            */
        }
    },
});