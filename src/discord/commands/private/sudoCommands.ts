import { createCommand, createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { stocksEventuals, res, icon, processApiQuestions, removeFromBlacklist, addToBlacklist, convertTime, commandsManager, shuffleArray } from "#functions";
import { menus } from "#menus";
import { Gender, Mails, PersonalityTrait, PetElement, PetPowerType } from "#prisma";
import { settings } from "#settings";
import { Command } from "#types/commands.js";
import { brBuilder, createContainer, createLabel, createModalFields, createSeparator } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
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
        },
        {
            name: "addpet",
            description: "addpet to a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "user id",
                    type: ApplicationCommandOptionType.User,
                    required
                },
                {
                    name: "petid",
                    description: "petid",
                    type: ApplicationCommandOptionType.Number,
                    required,
                },
                {
                    name: "name",
                    description: "pet name",
                    type: ApplicationCommandOptionType.String,
                    required,
                },
                {
                    name: "gender",
                    description: "pet gender",
                    type: ApplicationCommandOptionType.String,
                    required,
                    choices: [
                        { name: "FEMALE", value: "FEMALE" },
                        { name: "MALE", value: "MALE" }
                    ]
                },
                {
                    name: "skills",
                    description: "pet skills",
                    type: ApplicationCommandOptionType.String,
                    required,
                },
                {
                    name: "genetics",
                    description: "pet genetics",
                    type: ApplicationCommandOptionType.String,
                    required,
                },
                {
                    name: "personality",
                    description: "pet personality",
                    type: ApplicationCommandOptionType.String,
                    required,
                }
            ]
        },
        {
            name: "commands",
            description: "manage the commands",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "add",
                    description: "add a command",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "name",
                            description: "name of the command",
                            type: ApplicationCommandOptionType.String,
                            required
                        },
                        {
                            name: "description",
                            description: "description of the command",
                            type: ApplicationCommandOptionType.String,
                            required
                        },
                        {
                            name: "category",
                            description: "category of the command",
                            type: ApplicationCommandOptionType.String,
                            required
                        },
                        {
                            name: "isavaible",
                            description: "is the command disabled",
                            type: ApplicationCommandOptionType.Boolean,
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "remove a command",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "name",
                            description: "name of the command",
                            type: ApplicationCommandOptionType.Integer,
                            required,
                            autocomplete
                        }
                    ]
                },
                {
                    name: "edit",
                    description: "edit a command",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "command",
                            description: "command to edit",
                            type: ApplicationCommandOptionType.Integer,
                            required,
                            autocomplete
                        },
                        {
                            name: "name",
                            description: "name of the command",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        },
                        {
                            name: "description",
                            description: "description of the command",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        },
                        {
                            name: "category",
                            description: "category of the command",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        },
                        {
                            name: "isavaible",
                            description: "is the command disabled",
                            type: ApplicationCommandOptionType.Boolean,
                            required: false
                        }
                    ]
                }
            ]
        }
    ],
    async autocomplete(interaction) {
        if (interaction.user.id !== "1171963692984844401") return;
        const { options, client } = interaction;
        const focused = options.getFocused(true);
        const subCommandGroup = options.getSubcommandGroup();
        const subcommand = options.getSubcommand();

        switch (subCommandGroup) {
            case "apikey": {
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
            case "commands": {
                switch (subcommand) {
                    case "remove": {
                        if (focused.name === "name") {
                            const commands = commandsManager.fetch();

                            const list = commands.filter(c => c.name.toLowerCase().includes(focused.value.toLowerCase())).slice(0, 25);

                            await interaction.respond(list.map(c => ({ name: c.name, value: c.id })));
                            return;
                        }
                    }
                    case "edit": {
                        if (focused.name === "command") {
                            const commands = commandsManager.fetch();

                            const list = commands.filter(c => c.name.toLowerCase().includes(focused.value.toLowerCase())).slice(0, 25);

                            await interaction.respond(list.map(c => ({ name: c.name, value: c.id })));
                            return;
                        }
                    }
                }
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
                                        component: new TextInputBuilder({
                                            customId: "ownerId",
                                            required: true,
                                            style: TextInputStyle.Short,
                                            placeholder: "Digite o id do dono do bot"
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
                case "commands": {
                    await interaction.deferReply();
                    switch (subcommand) {
                        case "add": {
                            const name = options.getString("name", true);
                            const description = options.getString("description", true);
                            const category = options.getString("category", true);
                            const isAvaible = options.getBoolean("isavaible") || true;

                            const id = commandsManager.get.highestId() + 1;
                            await commandsManager.addAndUpdate({ id, name, description, category, isAvaible, siteAvaible: false })

                            interaction.editReply(res.success(`Comando adicionado com sucesso!, id: ${id}`));
                            break;
                        }
                        case "remove": {
                            const id = options.getInteger("name", true);
                            await commandsManager.removeAndUpdate.id(id);
                            interaction.editReply(res.success(`Comando removido com sucesso!`));
                            break;
                        }
                        case "edit": {
                            const id = options.getInteger("command", true);

                            const command = commandsManager.get.id(id);

                            if (!command) {
                                interaction.editReply(res.danger("Comando não encontrado!"));
                                return;
                            }

                            let isAvaible = options.getBoolean("isavaible");
                            if (isAvaible === undefined) isAvaible = command.isAvaible;
                            if (isAvaible === null) isAvaible = command.isAvaible;

                            const newCommand: Command = {
                                id,
                                name: options.getString("name") || command.name,
                                description: options.getString("description") || command.description,
                                category: options.getString("category") || command.category,
                                isAvaible: isAvaible,
                                siteAvaible: command.siteAvaible
                            }

                            await commandsManager.setAndUpdate.id(id, newCommand);
                            interaction.editReply(res.success(`Comando editado com sucesso! novos dados: \n **nome:** \`${newCommand.name}\`\n **descrição:** \`${newCommand.description}\`\n **categoria:** \`${newCommand.category}\`\n **disponível:** \`${newCommand.isAvaible ? "sim" : "não"}\``));
                            break;
                        }
                    }
                }
            }
            return;
        }

        switch (subcommand) {
            case "addpet": {
                await interaction.deferReply({ flags });
                const user = options.getUser("user", true);
                const petId = options.getNumber("petid", true);
                const name = options.getString("name", true);
                const gender = options.getString("gender", true) as Gender;
                const skills = JSON.parse(options.getString("skills", true)) as { id: number; level: number }[];
                const geneticsIds = options.getString("genetics", true) === "random" ? "random" : JSON.parse(options.getString("genetics", true)) as number[];
                const personalityIds = options.getString("personality", true) === "random" ? "random" : JSON.parse(options.getString("personality", true)) as number[];

                const getRandomPersonality = async () => {
                    const possibleTraits = await prisma.personalityTrait.findMany();

                    const shuffledTraits = [...possibleTraits].sort(() => Math.random() - 0.5);
                    const selectedTraits: PersonalityTrait[] = [];
                    let remainingSlots = Math.random() < 0.3 ? 2 : 1;

                    for (const trait of shuffledTraits) {
                        if (remainingSlots === 0) break;

                        // Verificar se a personalidade atual conflita com alguma já selecionada
                        const hasConflict = selectedTraits.some(selected =>
                            selected.personalityConflictNames.includes(trait.name) ||
                            trait.personalityConflictNames.includes(selected.name)
                        );

                        if (!hasConflict) {
                            selectedTraits.push(trait);
                            remainingSlots--;
                        }
                    }
                    const userPetPersonalities = selectedTraits.map(trait => ({
                        traitId: trait.id
                    }));

                    return userPetPersonalities;
                }

                const getRandomGenetics = async () => {
                    const geneticsCatalog = await prisma.genetics.findMany({ where: { petId: petId } });

                    const parts: { [key: string]: any[] } = {};
                    geneticsCatalog.forEach(gene => {
                        if (!parts[gene.colorPart]) parts[gene.colorPart] = [];
                        parts[gene.colorPart].push(gene);
                    });

                    // Selecionar um gene por colorPart com pesos baseados em geneType
                    const userPetGenetics: { geneId: number; inheritedFromParent1: boolean; inheritedFromParent2: boolean }[] = [];
                    for (const part in parts) {
                        const candidates = parts[part];
                        if (candidates.length === 0) continue;

                        // Definir pesos por geneType
                        const weights = candidates.map(gene => {
                            switch (gene.geneType) {
                                case 'DOMINANT': return 50;
                                case 'CODOMINANT': return 30;
                                case 'NEUTRAL': return 15;
                                case 'RECESSIVE': return 5;
                                default: return 10;
                            }
                        });

                        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
                        const random = Math.random() * totalWeight;
                        let cumulative = 0;

                        for (let i = 0; i < candidates.length; i++) {
                            cumulative += weights[i];
                            if (random <= cumulative) {
                                userPetGenetics.push({
                                    geneId: candidates[i].id,
                                    inheritedFromParent1: false, // Sem pais, geração inicial
                                    inheritedFromParent2: false
                                });
                                break;
                            }
                        }
                    }

                    return userPetGenetics;
                }

                try {
                    const pet = await prisma.userPet.create({
                        data: {
                            gender: gender,
                            flags: ["admin_added"],
                            name: name,
                            userId: user.id,
                            petId: petId,
                            skills: {
                                create: skills.map(s => ({ skillId: s.id, level: s.level }))
                            },
                            personality: {
                                create: personalityIds === "random" ? await getRandomPersonality() : personalityIds.map(id => ({ traitId: id }))
                            },
                            genetics: {
                                create: geneticsIds === "random" ? await getRandomGenetics() : geneticsIds.map(id => ({ geneId: id }))
                            }
                        }
                    });

                    await interaction.editReply(res.success(`Pet criado com sucesso!, id: ${pet.id}`))
                } catch (error) {
                    console.error(error);
                    await interaction.editReply(res.danger("Erro ao criar pet!"));
                }
            }
                return;
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

                const avaiblePowers = await prisma.petPower.findMany();

                const carsionRandomPowers = shuffleArray(avaiblePowers).slice(0, 5);
                const birdRandomPowers = shuffleArray(avaiblePowers).slice(5, 10);

                await prisma.$transaction([
                    prisma.userPetPower.createMany({
                        data: carsionRandomPowers.map(p => ({
                            userPetId: 91,
                            powerId: p.id,
                            isEquipped: true
                        }))
                    }),
                    prisma.userPetPower.createMany({
                        data: birdRandomPowers.map(p => ({
                            userPetId: 73,
                            powerId: p.id,
                            isEquipped: true
                        }))
                    })
                ])

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

                const sendMailDm = (mail: Mails) => {
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
                                try {
                                    const discordUser = await interaction.client.users.fetch(user.id);
                                    if (discordUser) {
                                        const container = sendMailDm(mail);
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

                                await tx.user.upsert({
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
                                try {
                                    const container = sendMailDm(mail);
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
                            // Lista de poderes a serem criados
                            await tx.petPower.deleteMany();
                            const powersToCreate = [
                                // Poderes de DANO
                                {
                                    name: "Fireball",
                                    description: "Lança uma bola de fogo que causa dano direto.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.FIRE,
                                    details: { damage: 12, cooldown: 2, manaCost: 20 },
                                },
                                {
                                    name: "WaterJet",
                                    description: "Dispara um jato d'água poderoso.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.WATER,
                                    details: { damage: 15, cooldown: 2, manaCost: 18 },
                                },
                                {
                                    name: "Thunderbolt",
                                    description: "Libera um raio elétrico.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.ELECTRIC,
                                    details: { damage: 18, cooldown: 3, manaCost: 25 },
                                },
                                {
                                    name: "EarthSlam",
                                    description: "Golpeia o chão, causando tremor.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.EARTH,
                                    details: { damage: 20, cooldown: 3, manaCost: 22 },
                                },
                                {
                                    name: "PsychicBlast",
                                    description: "Emite uma onda psíquica que causa dano mental.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.PSYCHIC,
                                    details: { damage: 16, cooldown: 3, manaCost: 22 },
                                },
                                {
                                    name: "MetalSlash",
                                    description: "Corta com lâminas de metal afiadas.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.METAL,
                                    details: { damage: 19, cooldown: 2, manaCost: 20 },
                                },
                                {
                                    name: "GhostStrike",
                                    description: "Ataque espectral que ignora defesas físicas.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.GHOST,
                                    details: { damage: 14, cooldown: 3, manaCost: 18 },
                                },
                                {
                                    name: "PoisonSpit",
                                    description: "Cuspe venenoso que causa dano imediato.",
                                    type: PetPowerType.DAMAGE,
                                    element: PetElement.POISON,
                                    details: { damage: 13, cooldown: 2, manaCost: 17 },
                                },
                                // Poderes de CURA
                                {
                                    name: "HealingLight",
                                    description: "Cura o pet com luz restauradora.",
                                    type: PetPowerType.HEAL,
                                    element: PetElement.LIGHT,
                                    details: { heal: 13, cooldown: 2, manaCost: 15 },
                                },
                                {
                                    name: "NaturesTouch",
                                    description: "Restaura vida com energia natural.",
                                    type: PetPowerType.HEAL,
                                    element: PetElement.EARTH,
                                    details: { heal: 15, cooldown: 2, manaCost: 12 },
                                },
                                {
                                    name: "SpiritMend",
                                    description: "Restaura vida com energia espectral.",
                                    type: PetPowerType.HEAL,
                                    element: PetElement.GHOST,
                                    details: { heal: 12, cooldown: 2, manaCost: 14 },
                                },
                                // Poderes de BUFF
                                {
                                    name: "FlameAura",
                                    description: "Aumenta o dano de ataques de fogo.",
                                    type: PetPowerType.BUFF,
                                    element: PetElement.FIRE,
                                    details: { duration: 3, cooldown: 4, manaCost: 10, elementBuffed: PetElement.FIRE },
                                },
                                {
                                    name: "WindBoost",
                                    description: "Aumenta a velocidade e dano de ataques de ar.",
                                    type: PetPowerType.BUFF,
                                    element: PetElement.AIR,
                                    details: { duration: 2, cooldown: 3, manaCost: 8, elementBuffed: PetElement.AIR },
                                },
                                {
                                    name: "PsychicShield",
                                    description: "Aumenta a resistência a ataques psíquicos.",
                                    type: PetPowerType.BUFF,
                                    element: PetElement.PSYCHIC,
                                    details: { duration: 3, cooldown: 4, manaCost: 12, elementBuffed: PetElement.PSYCHIC },
                                },
                                // Poderes de DEBUFF
                                {
                                    name: "Frostbite",
                                    description: "Reduz o dano de ataques inimigos.",
                                    type: PetPowerType.DEBUFF,
                                    element: PetElement.ICE,
                                    details: { duration: 2, cooldown: 3, manaCost: 10, elementDebuffed: PetElement.FIRE },
                                },
                                {
                                    name: "DarkVeil",
                                    description: "Diminui a precisão do inimigo.",
                                    type: PetPowerType.DEBUFF,
                                    element: PetElement.DARK,
                                    details: { duration: 3, cooldown: 4, manaCost: 12, elementDebuffed: PetElement.LIGHT },
                                },
                                // Poderes de AUTODAMAGE
                                {
                                    name: "PoisonCloud",
                                    description: "Causa dano contínuo ao longo do tempo.",
                                    type: PetPowerType.AUTODAMAGE,
                                    element: PetElement.DARK,
                                    details: { damage: 4, turnsDuration: 3, cooldown: 4, manaCost: 15 },
                                },
                                // Poderes de AUTOHEAL
                                {
                                    name: "Regeneration",
                                    description: "Restaura vida gradualmente.",
                                    type: PetPowerType.AUTOHEAL,
                                    element: PetElement.WATER,
                                    details: { heal: 3, turnsDuration: 3, cooldown: 4, manaCost: 12 },
                                },
                            ];

                            // Inserir poderes
                            await tx.petPower.createMany({
                                data: powersToCreate,
                            });

                            // Lista de relações de efetividade entre elementos
                            const effectivenessToCreate: { fromElement: PetElement; toElement: PetElement; multiplier: number }[] = [
                                // Fogo é forte contra Gelo, fraco contra Água
                                { fromElement: PetElement.FIRE, toElement: PetElement.ICE, multiplier: 1.5 },
                                { fromElement: PetElement.FIRE, toElement: PetElement.WATER, multiplier: 0.5 },
                                // Água é forte contra Fogo, fraca contra Elétrico
                                { fromElement: PetElement.WATER, toElement: PetElement.FIRE, multiplier: 1.5 },
                                { fromElement: PetElement.WATER, toElement: PetElement.ELECTRIC, multiplier: 0.5 },
                                // Elétrico é forte contra Água, fraco contra Terra
                                { fromElement: PetElement.ELECTRIC, toElement: PetElement.WATER, multiplier: 1.5 },
                                { fromElement: PetElement.ELECTRIC, toElement: PetElement.EARTH, multiplier: 0.5 },
                                // Terra é forte contra Elétrico, fraca contra Ar
                                { fromElement: PetElement.EARTH, toElement: PetElement.ELECTRIC, multiplier: 1.5 },
                                { fromElement: PetElement.EARTH, toElement: PetElement.AIR, multiplier: 0.5 },
                                // Ar é forte contra Terra, fraco contra Fogo
                                { fromElement: PetElement.AIR, toElement: PetElement.EARTH, multiplier: 1.5 },
                                { fromElement: PetElement.AIR, toElement: PetElement.FIRE, multiplier: 0.5 },
                                // Gelo é forte contra Ar, fraco contra Fogo
                                { fromElement: PetElement.ICE, toElement: PetElement.AIR, multiplier: 1.5 },
                                { fromElement: PetElement.ICE, toElement: PetElement.FIRE, multiplier: 0.5 },
                                // Luz é forte contra Escuridão, fraca contra Normal
                                { fromElement: PetElement.LIGHT, toElement: PetElement.DARK, multiplier: 1.5 },
                                { fromElement: PetElement.LIGHT, toElement: PetElement.NORMAL, multiplier: 0.5 },
                                // Escuridão é forte contra Normal, fraca contra Luz
                                { fromElement: PetElement.DARK, toElement: PetElement.NORMAL, multiplier: 1.5 },
                                { fromElement: PetElement.DARK, toElement: PetElement.LIGHT, multiplier: 0.5 },
                                // Veneno é forte contra Terra, fraco contra Psíquico
                                { fromElement: PetElement.POISON, toElement: PetElement.EARTH, multiplier: 1.5 },
                                { fromElement: PetElement.POISON, toElement: PetElement.PSYCHIC, multiplier: 0.5 },
                                // Psíquico é forte contra Veneno, fraco contra Fantasma
                                { fromElement: PetElement.PSYCHIC, toElement: PetElement.POISON, multiplier: 1.5 },
                                { fromElement: PetElement.PSYCHIC, toElement: PetElement.GHOST, multiplier: 0.5 },
                                // Metal é forte contra Gelo, fraco contra Fogo
                                { fromElement: PetElement.METAL, toElement: PetElement.ICE, multiplier: 1.5 },
                                { fromElement: PetElement.METAL, toElement: PetElement.FIRE, multiplier: 0.5 },
                                // Fantasma é forte contra Psíquico, fraco contra Escuridão
                                { fromElement: PetElement.GHOST, toElement: PetElement.PSYCHIC, multiplier: 1.5 },
                                { fromElement: PetElement.GHOST, toElement: PetElement.DARK, multiplier: 0.5 },
                                // Normal é neutro contra todos (multiplicador 1.0)
                                { fromElement: PetElement.NORMAL, toElement: PetElement.NORMAL, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.FIRE, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.WATER, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.ELECTRIC, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.EARTH, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.AIR, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.ICE, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.DARK, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.LIGHT, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.POISON, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.PSYCHIC, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.METAL, multiplier: 1.0 },
                                { fromElement: PetElement.NORMAL, toElement: PetElement.GHOST, multiplier: 1.0 },
                            ];

                            // Inserir relações de efetividade
                            await tx.petPowerEffectiveness.createMany({
                                data: effectivenessToCreate,
                            });
                        });
                    })();

                    // Roda transação com timeout
                    await Promise.race([txPromise, timeoutPromise]);

                    await interaction.editReply(res.success(`${icon.success} | Povoamento concluído com sucesso!`));
                } catch (err: any) {
                    console.error(err);
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
        const ownerId = fields.getTextInputValue("ownerId");
        const permissions = fields.getStringSelectValues("permissions");

        await interaction.deferReply({ flags });
        const bot = await client.users.fetch(botId, { cache: true }).catch(() => null);
        if (!bot || !bot.bot) {
            interaction.editReply(res.danger(`${icon.error} | Esse id não pertence a um bot!`));
            return;
        }
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