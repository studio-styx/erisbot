import { createCommand, createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { stocksEventuals, res, icon, processApiQuestions, removeFromBlacklist, addToBlacklist, convertTime } from "#functions";
import { menus } from "#menus";
import {  GeneType, Mails, PetGeneticsColorPart } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createLabel, createModalFields, createSeparator } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, time, UserSelectMenuBuilder } from "discord.js";
import crypto from "node:crypto";

function generateToken() {
    const apiKey = `ErisApiKey-${crypto.randomBytes(16).toString("hex")}`;
    const apiHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    return { key: apiKey, hash: apiHash };
}

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
            name: "apikey",
            description: "manage apikeys",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "permissions",
                    description: "manage apikey permissions",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "bot",
                            description: "bot to manage the permissions",
                            required: true,
                            autocomplete: true,
                            type: ApplicationCommandOptionType.String
                        }
                    ]
                },
                {
                    name: "delete",
                    description: "delete the bot",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "bot",
                            description: "bot to delete",
                            type: ApplicationCommandOptionType.String,
                            required,
                            autocomplete
                        }
                    ]
                },
                {
                    name: "generate",
                    description: "generate a new API key",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "regenerate",
                    description: "regenerate an API key from a bot",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "bot",
                            description: "regenerate a bot API key",
                            type: ApplicationCommandOptionType.String,
                        }
                    ]
                }
            ]
        },
        {
            name: "blacklist",
            description: "manage blacklist",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "add",
                    description: "add user to blacklist",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user",
                            description: "user to add to the blacklist",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "reason for adding the user to the blacklist",
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: "endat",
                            description: "end at",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "remove user from blacklist",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user",
                            description: "user to remove from the blacklist",
                            type: ApplicationCommandOptionType.User,
                            required: true
                        }
                    ]
                }
            ]
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
        },
        {
            name: "clear",
            description: "clear a table",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async autocomplete(interaction) {
        if (interaction.user.id !== "1171963692984844401") return;
        const { options, client } = interaction;
        const focused = options.getFocused(true);
        const subCommandGroup = options.getSubcommandGroup();
        const subcommand = options.getSubcommand();

        if (subCommandGroup === "apikey") {
            const getBotsNames = async () => {
                const raw = await redis.get(`apikey:bots:cache:admin`);
                if (!raw) {
                    const bots = await prisma.application.findMany({});
                    const names: { name: string; id: string }[] = [];
                    await Promise.all(bots.map(async (bot) => {
                        try {
                            const discordBot = client.users.cache.get(bot.id);
                            if (discordBot) {
                                names.push({ name: discordBot.username, id: bot.id });
                            } else {
                                const fetchedBot = await client.users.fetch(bot.id).catch(() => null);
                                if (fetchedBot) {
                                    names.push({ name: fetchedBot.username, id: bot.id });
                                } else {
                                    await prisma.application.delete({
                                        where: { id: bot.id }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }));
                    await redis.set(`apikey:bots:cache:admin`, JSON.stringify(names));
                    return names;
                } else {
                    return JSON.parse(raw) as { name: string; id: string }[];
                }
            };

            if (focused.name === "bot") {
                const bots = await getBotsNames();
                await interaction.respond(bots.filter(bot => bot.name.toLowerCase().includes(focused.value.toLowerCase())).map(bot => ({
                    name: bot.name,
                    value: bot.id
                })));
                return;
            }
        }

        if (subcommand === "set-work") {
            const companys = await prisma.company.findMany({
                where: {
                    OR: [
                        { name: { contains: focused.value, mode: "insensitive" } },
                        { description: { contains: focused.value, mode: "insensitive" } },
                        { id: { equals: Number(focused.value) } }
                    ]
                },
                select: { name: true, id: true }
            });

            if (companys.length === 0) {
                await interaction.respond([{ name: "Nenhuma empresa encontrada", value: "null" }]);
            } else {
                await interaction.respond(companys.map(c => ({ name: c.name, value: c.id.toString() })));
            }
            return;
        }
    },
    async run(interaction): Promise<any> {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("You are not allowed to use this command!"));
            return;
        }
        const { options } = interaction;
        const subcommand = options.getSubcommand();
        const subCommandGroup = options.getSubcommandGroup();

        if (subCommandGroup) {
            switch (subCommandGroup) {
                case "blacklist": {
                    await interaction.deferReply();
                    const user = options.getUser("user", true);
                    switch (subcommand) {
                        case "add": {
                            const reason = options.getString("reason", true);
                            const endAt = options.getString("endat");

                            await addToBlacklist(user.id, { reason, endAt: endAt ? new Date(Date.now() + convertTime({ time: endAt as any, to: "milliseconds" })) : null, bannedAt: new Date(), responsibleId: interaction.user.id });
                            break;
                        }
                        case "remove": {
                            await removeFromBlacklist(user.id);
                            break;
                        }
                    }

                    interaction.editReply(res.success(`${icon.success} | Sucesso ao ${subcommand === "add" ? "adicionar" : "remover"} o usuário ${user.displayName} da blacklist`))
                    break;
                }
                case "apikey": {
                    switch (subcommand) {
                        case "generate": {
                            interaction.showModal({
                                title: "Gerar um token",
                                customId: "sudo/apikey/generate",
                                components: createModalFields(
                                    createLabel({
                                        label: "Id do bot",
                                        description: "Escreva o id do bot",
                                        component: new TextInputBuilder({
                                            customId: "botId",
                                            required: true,
                                            style: TextInputStyle.Short,
                                            placeholder: "Digite o id do bot"
                                        })
                                    }),
                                    createLabel({
                                        label: "Id do dono do bot",
                                        description: "Qual é o id do dono do bot",
                                        component: new UserSelectMenuBuilder({
                                            customId: "onwerId",
                                            minValues: 1,
                                            maxValues: 1,
                                            required: true,
                                        })
                                    }),
                                    createLabel({
                                        label: "Permissões",
                                        description: "As permissões que o bot obterá",
                                        component: new StringSelectMenuBuilder({
                                            customId: "permissions",
                                            placeholder: "Selecione as permissões",
                                            options: [
                                                { label: "Ler a economia", value: "ECONOMY.READ" },
                                                { label: "Ler informações de usuário", value: "USER.INFO.READ" },
                                                { label: "Ler informações de sorteios", value: "GIVEAWAY.INFO.READ" },
                                                { label: "Gerenciar stx", value: "ECONOMY.WRITE" },
                                                { label: "TODAS", value: "ALL" }
                                            ],
                                            minValues: 1,
                                            maxValues: 4,
                                            required: true
                                        })
                                    })
                                )
                            });
                            return;
                        }
                        case "permissions": {
                            const botId = options.getString("bot", true);
                            await interaction.deferReply();
                            const bot = await prisma.application.findUnique({ where: { id: botId } });
                            if (!bot) {
                                interaction.editReply(res.danger(`${icon.error} | Bot não encontrado!`));
                                return;
                            }
                            interaction.showModal({
                                title: "Gerenciar permissões",
                                customId: `sudo/apikey/permissions/${botId}`,
                                components: createModalFields(
                                    createLabel({
                                        label: "Permissões",
                                        description: "As permissões que o bot obterá",
                                        component: new StringSelectMenuBuilder({
                                            customId: "permissions",
                                            placeholder: "Selecione as permissões",
                                            options: [
                                                { label: "Ler a economia", value: "ECONOMY.READ" },
                                                { label: "Ler informações de usuário", value: "USER.INFO.READ" },
                                                { label: "Ler informações de sorteios", value: "GIVEAWAY.INFO.READ" },
                                                { label: "Gerenciar stx", value: "ECONOMY.WRITE" },
                                                { label: "TODAS", value: "ALL" }
                                            ],
                                            minValues: 1,
                                            maxValues: 4,
                                            required: true
                                        })
                                    })
                                )
                            });
                            return;
                        }
                        case "delete": {
                            const botId = options.getString("bot", true);
                            await interaction.deferReply();
                            const bot = await prisma.application.findUnique({ where: { id: botId } });
                            if (!bot) {
                                interaction.editReply(res.danger(`${icon.error} | Bot não encontrado!`));
                                return;
                            }
                            await prisma.application.delete({ where: { id: botId } });
                            await redis.del(`apikey:bots:cache:admin`);
                            interaction.editReply(res.success(`${icon.success} | Bot e token deletados com sucesso!`));
                            return;
                        }
                        case "regenerate": {
                            const botId = options.getString("bot", true);
                            await interaction.deferReply();
                            const bot = await prisma.application.findUnique({ where: { id: botId } });
                            if (!bot) {
                                interaction.editReply(res.danger(`${icon.error} | Bot não encontrado!`));
                                return;
                            }
                            const newToken = generateToken();
                            await prisma.application.update({
                                where: { id: botId },
                                data: { token: newToken.hash }
                            });
                            interaction.editReply(res.success(`${icon.success} | Novo token gerado: **\`${newToken.key}\`**`));
                            return;
                        }
                    }
                }
            }
            return;
        }

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

                await prisma.userPet.create({
                    data: {
                        gender: "MALE",
                        name: "SHOYO",
                        humor: "happy",
                        petId: 14,
                        userId: "1419906960354181120",
                        // 12 e 5,
                        personality: {
                            createMany: {
                                data: [
                                    {
                                        traitId: 12,
                                    },
                                    {
                                        traitId: 5,
                                    }
                                ]
                            }
                        },
                        genetics: {
                            createMany: {
                                data: [
                                    {
                                        geneId: 211
                                    },
                                    {
                                        geneId: 216
                                    },
                                    {
                                        geneId: 220
                                    }
                                ]
                            }
                        },
                        skills: {
                            create: {
                                skillId: 1,
                                level: 2,
                            }
                        }
                    }
                })

                interaction.editReply(res.success("Concluído"))
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
                                    { name: "Cachorro Pug", rarity: "COMUM", price: 300, animal: "DOG", specie: "Pug" },
                                    { name: "Papagaio", rarity: "COMUM", price: 350, animal: "BIRD", specie: "Parrot" },
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
                                    { name: "Coelho Lunar", rarity: "RARE", price: 900, animal: "RABBIT", specie: "Lunar" },
                                    { name: "Gato Bengal", rarity: "RARE", price: 600, animal: "CAT", specie: "Bengal" },
                                    { name: "Gato Maine Coon", rarity: "EPIC", price: 1200, animal: "CAT", specie: "MaineCoon" },
                                    { name: "Cachorro Golden Retriever", rarity: "RARE", price: 550, animal: "DOG", specie: "GoldenRetriever" },
                                    { name: "Cachorro Bulldog", rarity: "UNCOMUM", price: 350, animal: "DOG", specie: "Bulldog" },
                                    { name: "Arara Azul", rarity: "EPIC", price: 1800, animal: "BIRD", specie: "BlueMacaw" },
                                    { name: "Coruja", rarity: "RARE", price: 800, animal: "BIRD", specie: "Owl" },
                                    { name: "Hamster Roborovski", rarity: "UNCOMUM", price: 120, animal: "HAMSTER", specie: "Roborovski" },
                                    { name: "Hamster Chinês", rarity: "COMUM", price: 80, animal: "HAMSTER", specie: "Chinese" },
                                    { name: "Coelho Holland Lop", rarity: "RARE", price: 300, animal: "RABBIT", specie: "HollandLop" },
                                    { name: "Coelho Rex", rarity: "UNCOMUM", price: 200, animal: "RABBIT", specie: "Rex" },
                                    { name: "Dragão de Gelo", rarity: "LEGENDARY", price: 5200, animal: "DRAGON", specie: "Ice" },
                                    { name: "Dragão das Sombras", rarity: "EPIC", price: 2800, animal: "DRAGON", specie: "Shadow" },
                                    { name: "Leão Asiático", rarity: "RARE", price: 1600, animal: "LION", specie: "Asiatic" },
                                    { name: "Leão das Cavernas", rarity: "EPIC", price: 2200, animal: "LION", specie: "Cave" },
                                    { name: "Jaguar Dourado", rarity: "LEGENDARY", price: 3000, animal: "JAGUAR", specie: "Golden" },
                                    { name: "Jaguar Albino", rarity: "RARE", price: 2000, animal: "JAGUAR", specie: "Albino" },
                                    { name: "Falcão Peregrino", rarity: "EPIC", price: 1500, animal: "BIRD", specie: "Falcon" },
                                    { name: "Pinguim", rarity: "UNCOMUM", price: 400, animal: "BIRD", specie: "Penguin" },
                                    { name: "Gato Sphynx", rarity: "EPIC", price: 1000, animal: "CAT", specie: "Sphynx" },
                                    { name: "Cachorro Beagle", rarity: "COMUM", price: 250, animal: "DOG", specie: "Beagle" },
                                    { name: "Coelho Angorá", rarity: "RARE", price: 350, animal: "RABBIT", specie: "Angora" },
                                    { name: "Dragão Elétrico", rarity: "LEGENDARY", price: 5800, animal: "DRAGON", specie: "Electric" },
                                    { name: "Leão Marinho", rarity: "UNCOMUM", price: 500, animal: "LION", specie: "Sea" },
                                    { name: "Jaguar das Montanhas", rarity: "EPIC", price: 2400, animal: "JAGUAR", specie: "Mountain" },
                                    { name: "Águia Real", rarity: "RARE", price: 900, animal: "BIRD", specie: "GoldenEagle" }
                                ]
                            });

                            // 2) Personality traits (com geneType variados)
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando personalidades...`));
                            await tx.personalityTrait.createMany({
                                data: [
                                    { name: "calm", geneType: "NEUTRAL", personalityConflictNames: ["aggressive", "energetic", "mischievous"] },
                                    { name: "playful", geneType: "CODOMINANT", personalityConflictNames: ["lazy", "timid", "submissive"] },
                                    { name: "curious", geneType: "CODOMINANT", personalityConflictNames: ["shy", "stubborn", "patient"] },
                                    { name: "shy", geneType: "RECESSIVE", personalityConflictNames: ["brave", "dominant", "protective"] },
                                    { name: "brave", geneType: "DOMINANT", personalityConflictNames: ["timid", "submissive", "clingy"] },
                                    { name: "loyal", geneType: "DOMINANT", personalityConflictNames: ["independent", "mischievous"] },
                                    { name: "aggressive", geneType: "DOMINANT", personalityConflictNames: ["calm", "gentle", "patient"] },
                                    { name: "lazy", geneType: "RECESSIVE", personalityConflictNames: ["energetic", "playful", "curious"] },
                                    { name: "friendly", geneType: "CODOMINANT", personalityConflictNames: ["aggressive", "stubborn"] },
                                    { name: "stubborn", geneType: "RECESSIVE", personalityConflictNames: ["submissive", "friendly", "gentle"] },
                                    { name: "gentle", geneType: "NEUTRAL", personalityConflictNames: ["aggressive", "dominant"] },
                                    { name: "energetic", geneType: "CODOMINANT", personalityConflictNames: ["lazy", "calm", "timid"] },
                                    { name: "protective", geneType: "DOMINANT", personalityConflictNames: ["independent", "submissive"] },
                                    { name: "independent", geneType: "NEUTRAL", personalityConflictNames: ["clingy", "loyal", "protective"] },
                                    { name: "clingy", geneType: "RECESSIVE", personalityConflictNames: ["independent", "brave"] },
                                    { name: "timid", geneType: "RECESSIVE", personalityConflictNames: ["brave", "energetic", "dominant"] },
                                    { name: "mischievous", geneType: "CODOMINANT", personalityConflictNames: ["patient", "loyal", "calm"] },
                                    { name: "patient", geneType: "NEUTRAL", personalityConflictNames: ["aggressive", "mischievous", "curious"] },
                                    { name: "dominant", geneType: "DOMINANT", personalityConflictNames: ["submissive", "shy", "gentle"] },
                                    { name: "submissive", geneType: "RECESSIVE", personalityConflictNames: ["dominant", "brave", "stubborn"] }
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
                                    { name: "coinflip_bonus" },
                                    { name: "horse_racing_luck" },
                                    { name: "horse_racing_bonus" }
                                ]
                            });


                            // 4) Genetics: criar várias traits por pet (muito mais geneticsData)
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando genéticas (múltiplas por espécie)...`));
                            const allPets = await tx.pet.findMany();

                            const geneticsData: { petId: number; trait: string; colorPart: PetGeneticsColorPart; geneType: GeneType; }[] = allPets.flatMap((p) => {
                                const baseTraits = [
                                    // olhos comuns
                                    { trait: "Olhos Azuis", colorPart: "EYE", geneType: "DOMINANT" },
                                    { trait: "Olhos Verdes", colorPart: "EYE", geneType: "RECESSIVE" },
                                    { trait: "Olhos Dourados", colorPart: "EYE", geneType: "CODOMINANT" },
                                    { trait: "Olhos Pretos", colorPart: "EYE", geneType: "NEUTRAL" },
                                ];

                                const animalSpecificTraits = (() => {
                                    switch (p.animal) {
                                        case "CAT":
                                            return [
                                                // pelagem - primary para gatos
                                                { trait: "Pelo Cinza", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Pelo Laranja", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Pelo Branco", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Pelo Preto", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                // pelagem - secondary / padrões para gatos
                                                { trait: "Manchas Brancas", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Listras Tabby", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Patas Pretas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Orelhas Pontudas", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                // extras para gatos
                                                { trait: "Cauda Curta", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                { trait: "Bigodes Longos", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Pelo Curto", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Pelo Longo", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                            ];
                                        case "DOG":
                                            return [
                                                // pelagem - primary para cães
                                                { trait: "Pelo Marrom", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Pelo Dourado", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Pelo Branco", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Pelo Preto", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                // pelagem - secondary / padrões para cães
                                                { trait: "Manchas Pretas", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Listras Brindle", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Colar Branco", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Orelhas Caídas", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                // extras para cães
                                                { trait: "Cauda Enrolada", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Focinho Curto", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                { trait: "Pelo Ondulado", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Pelo Liso", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            ];
                                        case "BIRD":
                                            return [
                                                // pelagem (penas) - primary para pássaros
                                                { trait: "Penas Azuis", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Penas Verdes", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Penas Amarelas", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Penas Pretas", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                // pelagem - secondary / padrões para pássaros
                                                { trait: "Manchas Coloridas", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Listras nas Asas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Bico Curvo", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Crista Alta", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                // extras para pássaros
                                                { trait: "Asas Longas", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Penas Iridescentes", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Cauda Bifurcada", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Olhos Vermelhos", colorPart: "EYE", geneType: "RECESSIVE" },
                                            ];
                                        case "HAMSTER":
                                            return [
                                                // pelagem - primary para hamsters
                                                { trait: "Pelo Cinza Claro", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Pelo Marrom", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Pelo Branco", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Pelo Dourado", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                // pelagem - secondary / padrões para hamsters
                                                { trait: "Manchas Pretas", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Listras Dorsais", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Patas Rosadas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Orelhas Pequenas", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                // extras para hamsters
                                                { trait: "Cauda Curta", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                { trait: "Pelo Espesso", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Bochechas Grandes", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Olhos Negros", colorPart: "EYE", geneType: "DOMINANT" },
                                            ];
                                        case "RABBIT":
                                            return [
                                                // pelagem - primary para coelhos
                                                { trait: "Pelo Branco", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Pelo Cinza", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Pelo Marrom", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Pelo Preto", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                // pelagem - secondary / padrões para coelhos
                                                { trait: "Manchas Negras", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Listras Agouti", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Orelhas Longas", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                { trait: "Patas Brancas", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                // extras para coelhos
                                                { trait: "Pelo Angorá", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Nariz Rosa", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Olhos Rubi", colorPart: "EYE", geneType: "RECESSIVE" },
                                                { trait: "Cauda Fofa", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                            ];
                                        case "DRAGON":
                                            return [
                                                // pelagem (escamas) - primary para dragões
                                                { trait: "Escamas Verdes", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Escamas Vermelhas", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Escamas Azuis", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Escamas Douradas", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                // pelagem - secondary / padrões para dragões
                                                { trait: "Chifres Curvos", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                { trait: "Asas Membranosas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Espinhos Dorsais", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Cauda Espinhosa", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                // extras para dragões
                                                { trait: "Olhos Flamejantes", colorPart: "EYE", geneType: "DOMINANT" },
                                                { trait: "Escamas Iridescentes", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Garras Afiadas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Respiração de Fogo", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                            ];
                                        case "LION":
                                            return [
                                                // pelagem - primary para leões
                                                { trait: "Juba Dourada", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Pelo Amarelo", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Pelo Branco", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                { trait: "Pelo Preto", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                // pelagem - secondary / padrões para leões
                                                { trait: "Manchas no Corpo", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Listras na Cauda", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Juba Espessa", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                { trait: "Patas Grandes", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                // extras para leões
                                                { trait: "Olhos Âmbar", colorPart: "EYE", geneType: "CODOMINANT" },
                                                { trait: "Garras Retráteis", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                { trait: "Rugido Alto", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Cauda com Tufo", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                            ];
                                        case "JAGUAR":
                                            return [
                                                // pelagem - primary para jaguares
                                                { trait: "Pelo Amarelo", colorPart: "COLOR1", geneType: "NEUTRAL" },
                                                { trait: "Pelo Preto", colorPart: "COLOR1", geneType: "DOMINANT" },
                                                { trait: "Pelo Manchado", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Pelo Albino", colorPart: "COLOR1", geneType: "RECESSIVE" },
                                                // pelagem - secondary / padrões para jaguares
                                                { trait: "Rosetas Pretas", colorPart: "COLOR2", geneType: "DOMINANT" },
                                                { trait: "Listras nas Patas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Cauda Longa", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                                { trait: "Orelhas Arredondadas", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                                // extras para jaguares
                                                { trait: "Olhos Verdes", colorPart: "EYE", geneType: "DOMINANT" },
                                                { trait: "Mandíbula Forte", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                                { trait: "Pelo Lustroso", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                                { trait: "Garras Curvas", colorPart: "COLOR2", geneType: "DOMINANT" },
                                            ];
                                        default:
                                            return [];
                                    }
                                })();

                                return [...baseTraits, ...animalSpecificTraits].map(trait => ({
                                    petId: p.id,
                                    trait: trait.trait,
                                    colorPart: trait.colorPart as PetGeneticsColorPart,
                                    geneType: trait.geneType as GeneType,
                                }));
                            });

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
                    console.error(err)
                    if (err.message === "TIMEOUT") {
                        await interaction.editReply(res.danger(`${icon.error} | Tempo limite de 30 segundos atingido durante o povoamento.`));
                    } else {
                        await interaction.editReply(res.danger(`${icon.error} | Erro ao povoar: ${err.message}`));
                    }
                }
                break;
            }
            case "clear": {
                await interaction.deferReply();
                await prisma.$transaction([
                    prisma.userPet.deleteMany(),
                    prisma.petSkill.deleteMany(),
                    prisma.pet.deleteMany(),
                    prisma.personalityTrait.deleteMany(),
                    prisma.genetics.deleteMany(),
                    prisma.userPetPersonality.deleteMany(),
                    prisma.petGenetics.deleteMany(),
                    prisma.user.updateMany({
                        data: {
                            activePetId: null
                        }
                    })
                ])

                await interaction.editReply(res.success(`${icon.success} | Sucesso ao limpar as tabelas de pet!`))
                return;
            }
        }
    },
});

createResponder({
    customId: "sudo/apikey/generate",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("Você não tem permissão para usar este comando!"));
            return;
        }
        const { fields, client } = interaction;
        const botId = fields.getTextInputValue("botId");
        const selectedUsers = fields.getSelectedUsers("ownerId");
        const permissions = fields.getStringSelectValues("permissions");

        await interaction.deferReply();
        const bot = await client.users.fetch(botId, { cache: true }).catch(() => null);
        if (!bot || !bot.bot) {
            interaction.editReply(res.danger(`${icon.error} | Esse id não pertence a um bot!`));
            return;
        }
        if (!selectedUsers || selectedUsers.size === 0) {
            interaction.editReply(res.danger(`${icon.error} | Selecione o dono do bot!`));
            return;
        }
        const ownerId = selectedUsers.first()!.id;
        const alreadyExist = await prisma.application.findUnique({
            where: { id: bot.id },
            select: { id: true }
        });
        if (alreadyExist) {
            interaction.editReply(res.danger(`${icon.error} | Um bot com esse id já está registrado!`));
            return;
        }
        const token = generateToken();
        await prisma.application.create({
            data: {
                id: bot.id,
                ownerId: ownerId, // Usa o ID do dono selecionado
                token: token.hash,
                permissions: [...permissions]
            }
        });
        await redis.del(`apikey:bots:cache:admin`);
        interaction.editReply(res.success(`${icon.success} | Token gerado com sucesso! \n\n \`\`\`${token.key}\`\`\``));
    },
});

createResponder({
    customId: "sudo/apikey/permissions/:botId",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction, { botId }) {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("Você não tem permissão para usar este comando!"));
            return;
        }
        const permissions = interaction.fields.getStringSelectValues("permissions");

        await interaction.deferReply();
        await prisma.application.update({
            where: { id: botId },
            data: { permissions: [...permissions] }
        });
        interaction.editReply(res.success(`${icon.success} | Permissões atualizadas com sucesso!`));
    },
});