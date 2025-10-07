import { createCommand } from "#base";
import { prisma } from "#database";
import { stocksEventuals, res, icon, processApiQuestions } from "#functions";
import { menus } from "#menus";
import { GeneType, Mails, PetGeneticsColorPart, Rarity } from "#prisma";
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
        },
        {
            name: "povoar",
            description: "povoar",
            type: ApplicationCommandOptionType.Subcommand
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
            case "povoar": {
                await interaction.deferReply();
                await interaction.editReply(res.warning(`${icon.waiting_white} | Iniciando povoamento...`));

                const TIMEOUT_MS = 30_000; // 30 segundos

                try {
                    // Promise que rejeita após TIMEOUT_MS
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("TIMEOUT")), TIMEOUT_MS)
                    );

                    // Promise com a transação
                    const txPromise = (async () => {
                        await prisma.$transaction(async (tx) => {
                            // 1) Pets (muito mais entradas)
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando pets...`));
                            await tx.pet.createMany({
                                data: [
                                    { name: "Gato Siamês", rarity: "COMUM", price: 200, animal: "CAT", specie: "Siamese" },
                                    { name: "Gato Persa", rarity: "RARE", price: 450, animal: "CAT", specie: "Persian" },
                                    { name: "Gato de Rua", rarity: "COMUM", price: 80, animal: "CAT", specie: "Street" },
                                    { name: "Cachorro Labrador", rarity: "RARE", price: 500, animal: "DOG", specie: "Labrador" },
                                    { name: "Cachorro Husky", rarity: "EPIC", price: 1500, animal: "DOG", specie: "Husky" },
                                    { name: "Cachorro Pug", rarity: "UNCOMUM", price: 300, animal: "DOG", specie: "Pug" },
                                    { name: "Papagaio", rarity: "UNCOMUM", price: 350, animal: "BIRD", specie: "Parrot" },
                                    { name: "Canário", rarity: "COMUM", price: 90, animal: "BIRD", specie: "Canary" },
                                    { name: "Hamster Sírio", rarity: "COMUM", price: 100, animal: "HAMSTER", specie: "Syrian" },
                                    { name: "Hamster Anão", rarity: "UNCOMUM", price: 140, animal: "HAMSTER", specie: "Dwarf" },
                                    { name: "Coelho Branco", rarity: "UNCOMUM", price: 250, animal: "RABBIT", specie: "White" },
                                    { name: "Coelho Selvagem", rarity: "COMUM", price: 110, animal: "RABBIT", specie: "Wild" },
                                    { name: "Dragão Verde", rarity: "LEGENDARY", price: 5000, animal: "DRAGON", specie: "Emerald" },
                                    { name: "Dragão de Fogo", rarity: "LEGENDARY", price: 5500, animal: "DRAGON", specie: "Inferno" },
                                    { name: "Dragão Ancião", rarity: "EPIC", price: 3000, animal: "DRAGON", specie: "Elder" },
                                    { name: "Leão Africano", rarity: "EPIC", price: 2000, animal: "LION", specie: "African" },
                                    { name: "Leão Branco", rarity: "RARE", price: 1800, animal: "LION", specie: "White" },
                                    { name: "Jaguar Preto", rarity: "EPIC", price: 2500, animal: "JAGUAR", specie: "Black" },
                                    { name: "Jaguar das Selvas", rarity: "RARE", price: 1600, animal: "JAGUAR", specie: "Jungle" },
                                    { name: "Fênix", rarity: "LEGENDARY", price: 6000, animal: "BIRD", specie: "Phoenix" },
                                    { name: "Gato Selvagem", rarity: "RARE", price: 700, animal: "CAT", specie: "Wildcat" },
                                    { name: "Cão Pastor", rarity: "UNCOMUM", price: 400, animal: "DOG", specie: "Shepherd" },
                                    { name: "Pássaro do Paraíso", rarity: "EPIC", price: 2200, animal: "BIRD", specie: "Paradise" },
                                    { name: "Coelho Lunar", rarity: "RARE", price: 900, animal: "RABBIT", specie: "Lunar" }
                                ]
                            });

                            // 2) Personality traits (com geneType variados)
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando personalidades...`));
                            await tx.personalityTrait.createMany({
                                data: [
                                    { name: "calm", geneType: "NEUTRAL" },
                                    { name: "playful", geneType: "CODOMINANT" },
                                    { name: "curious", geneType: "CODOMINANT" },
                                    { name: "shy", geneType: "RECESSIVE" },
                                    { name: "brave", geneType: "DOMINANT" },
                                    { name: "loyal", geneType: "DOMINANT" },
                                    { name: "aggressive", geneType: "DOMINANT" },
                                    { name: "lazy", geneType: "RECESSIVE" },
                                    { name: "friendly", geneType: "CODOMINANT" },
                                    { name: "stubborn", geneType: "RECESSIVE" },
                                    { name: "gentle", geneType: "NEUTRAL" },
                                    { name: "energetic", geneType: "CODOMINANT" },
                                    { name: "protective", geneType: "DOMINANT" },
                                    { name: "independent", geneType: "NEUTRAL" },
                                    { name: "clingy", geneType: "RECESSIVE" },
                                    { name: "timid", geneType: "RECESSIVE" },
                                    { name: "mischievous", geneType: "CODOMINANT" },
                                    { name: "patient", geneType: "NEUTRAL" },
                                    { name: "dominant", geneType: "DOMINANT" },
                                    { name: "submissive", geneType: "RECESSIVE" }
                                ]
                            });

                            // 3) Skills (mais opções)
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando skills...`));
                            await tx.petSkill.createMany({
                                data: [
                                    { name: "daily_bonus" },
                                    { name: "daily_cooldown_reduction" },
                                    { name: "work_bonus" },
                                    { name: "work_xp_bonus" },
                                    { name: "job_interview_easier" },
                                    { name: "work_challenge_avoid" },
                                    { name: "work_challenge_easier" },
                                    { name: "slots_luck" },
                                    { name: "coinflip_luck" },
                                    { name: "horse_racing_luck" },
                                    { name: "lottery_luck" },
                                ]
                            });


                            // 4) Genetics: criar várias traits por pet (muito mais geneticsData)
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando genéticas (múltiplas por espécie)...`));
                            const allPets = await tx.pet.findMany();

                            const geneticsData: { petId: number; trait: string; colorPart: PetGeneticsColorPart; geneType: GeneType; }[] = allPets.flatMap((p) => ([
                                // olhos
                                { petId: p.id, trait: "Olhos Azuis", colorPart: "EYE", geneType: "DOMINANT" },
                                { petId: p.id, trait: "Olhos Verdes", colorPart: "EYE", geneType: "RECESSIVE" },
                                { petId: p.id, trait: "Olhos Dourados", colorPart: "EYE", geneType: "CODOMINANT" },
                                { petId: p.id, trait: "Olhos Pretos", colorPart: "EYE", geneType: "NEUTRAL" },

                                // pelagem - primary
                                { petId: p.id, trait: "Pelo Branco", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                { petId: p.id, trait: "Pelo Preto", colorPart: "COLOR1", geneType: "DOMINANT" },
                                { petId: p.id, trait: "Pelo Dourado", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                { petId: p.id, trait: "Pelo Acinzentado", colorPart: "COLOR1", geneType: "NEUTRAL" },

                                // pelagem - secondary / padrões
                                { petId: p.id, trait: "Manchas", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                { petId: p.id, trait: "Listras", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                { petId: p.id, trait: "Patas Marrons", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                { petId: p.id, trait: "Sobrancelha Escura", colorPart: "COLOR2", geneType: "NEUTRAL" },

                                // extras / especiais
                                { petId: p.id, trait: "Sobrancelha Dourada", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                { petId: p.id, trait: "Pelo Listrado", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                { petId: p.id, trait: "Marca de Estrela", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                { petId: p.id, trait: "Olhos Luminosos", colorPart: "EYE", geneType: "DOMINANT" }
                            ]));

                            // Inserir todas as genetics
                            // Para evitar problemas de limite por createMany, quebramos em chunks de 500
                            const chunkSize = 500;
                            for (let i = 0; i < geneticsData.length; i += chunkSize) {
                                const chunk = geneticsData.slice(i, i + chunkSize);
                                await tx.genetics.createMany({ data: chunk });
                            }

                            await interaction.editReply(res.warning(`${icon.waiting_white} | Genéticas criadas para ${allPets.length} pets.`));
                        });
                    })();

                    // Roda transação com timeout
                    await Promise.race([txPromise, timeoutPromise]);

                    await interaction.editReply(res.success(`${icon.success} | Povoamento concluído com sucesso!`));
                } catch (err: any) {
                    if (err.message === "TIMEOUT") {
                        await interaction.editReply(res.danger(`${icon.error} | Tempo limite de 30 segundos atingido durante o povoamento.`));
                    } else {
                        await interaction.editReply(res.danger(`${icon.error} | Erro ao povoar: ${err.message}`));
                    }
                }
                break;
            }

        }
    },
});