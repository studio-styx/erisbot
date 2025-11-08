import { createCommand, createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { stocksEventuals, res, icon, processApiQuestions, removeFromBlacklist, addToBlacklist, convertTime, commandsManager, shuffleArray, ErisError } from "#functions";
import { menus } from "#menus";
import { Gender, Mails, PersonalityTrait } from "#prisma";
import { settings } from "#settings";
import { Command } from "#types/commands.js";
import { brBuilder, createContainer, createLabel, createModalFields, createSeparator, limitText } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import crypto from "node:crypto";
import z from "zod";

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
        },
        {
            name: "football",
            description: "football sudo commands",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "edit_match",
                    description: "edit a match",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "match",
                            description: "match to edit",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete
                        },
                        {
                            name: "data",
                            description: "data to edit",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            autocomplete
                        },
                        {
                            name: "value",
                            description: "new value to the data",
                            type: ApplicationCommandOptionType.String,
                            required: true
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
            case "football": {
                switch (subcommand) {
                    case "edit_match": {
                        switch (focused.name) {
                            case "match": {
                                const matches = await prisma.footballMatch.findMany({
                                    where: {
                                        OR: [
                                            { homeTeam: { name: { contains: focused.value, mode: "insensitive" } } },
                                            { awayTeam: { name: { contains: focused.value, mode: "insensitive" } } }
                                        ],
                                        startAt: {
                                            gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
                                        }
                                    },
                                    select: { homeTeam: true, awayTeam: true, id: true, competition: true, startAt: true },
                                    take: 25
                                });

                                return await interaction.respond(matches.map(m => ({ name: limitText(`${m.homeTeam.name} x ${m.awayTeam.name} || ${m.competition.name} || ${new Date(m.startAt).toLocaleDateString()}`, 97, "..."), value: m.id.toString() })));
                            }
                            case "data": {
                                const data = [
                                    "startAt", "status", "goalsHome", "goalsAway", "venue",
                                    "oddsHomeWin", "oddsAwayWin", "oddsDraw", "homeTeamId",
                                    "awayTeamId", "competitionId", "apiId", "id"
                                ]

                                const filtered = data.filter(d => d.toLowerCase().includes(focused.value.toLowerCase()));
                                await interaction.respond(filtered.map(d => ({ name: d, value: d })));
                                return;
                            }
                        }
                        break;
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
                case "football": {
                    await interaction.deferReply();
                    switch (subcommand) {
                        case "edit_match": {
                            const prismaMatchData = [
                                "startAt", "status", "goalsHome", "goalsAway", "venue",
                                "oddsHomeWin", "oddsAwayWin", "oddsDraw", "homeTeamId",
                                "awayTeamId", "competitionId", "apiId", "id"
                            ]
                            const matchInput = options.getString("match", true);
                            const dataInput = options.getString("data", true);
                            const valueInput = options.getString("value", true);

                            const schema = z.object({
                                matchId: z.coerce.bigint(),
                                data: z.enum(prismaMatchData),
                                value: z.string()
                            });

                            const { matchId, data, value } = schema.parse({ matchId: matchInput, data: dataInput, value: valueInput });

                            const match = await prisma.footballMatch.findUnique({ where: { id: matchId } });

                            if (!match) throw new ErisError("Não foi possivel encontrar essa partida");

                            let valueFormatted: string | number | null | Date | bigint = null;
                            
                            if (value !== "null") {
                                switch (data) {
                                    case "startAt": {
                                        valueFormatted = new Date(value);
                                        break;
                                    }
                                    case "awayTeamId":
                                    case "homeTeamId":
                                    case "competitionId":
                                    case "id": {
                                        valueFormatted = BigInt(value);
                                        break;
                                    }
                                    case "oddsHomeWin":
                                    case "oddsAwayWin":
                                    case "oddsDraw": {
                                        valueFormatted = parseFloat(value);
                                        break;
                                    }
                                    default: {
                                        valueFormatted = value;
                                        break;
                                    }
                                }
                            } else {
                                valueFormatted = null;
                            }

                            await prisma.footballMatch.update({
                                where: { id: matchId },
                                data: {
                                    [data]: valueFormatted
                                }
                            });

                            await interaction.editReply(res.success(`Partida editada com sucesso!`));
                            return;
                        }
                    }
                    break;
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
                const systemMail = interaction.options.getBoolean("system") || false;

                const sendMailDm = (mail: Mails) => {
                    const components: any[] = [
                        brBuilder(
                            `# ${icon.mail} | Carta recebida de: ${systemMail ? "Sistema" : interaction.user.username}`,
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
                                        whoSendId: systemMail ? null : interaction.user.id
                                    }
                                })
                                usersCount++;
                                if (!user.dmNotification) continue;
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
                        }, {
                            timeout: 1_200_000,
                            maxWait: 1_200_000
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
                            // Lista de pets a serem criados
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando pets...`));
                            await tx.pet.createMany({
                                data: [
                                    {
                                        name: "Morcego Espectral",
                                        rarity: "LEGENDARY",
                                        price: 1500.0,
                                        animal: "BAT",
                                        specie: "Morcego",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Corvo Sombrio",
                                        rarity: "RARE",
                                        price: 800.0,
                                        animal: "RAVEN",
                                        specie: "Corvo",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Aranha Fantasmagórica",
                                        rarity: "EPIC",
                                        price: 1200.0,
                                        animal: "SPIDER",
                                        specie: "Aranha",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Lobo Uivante",
                                        rarity: "EPIC",
                                        price: 1300.0,
                                        animal: "WOLF",
                                        specie: "Lobo",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Gato Preto Místico",
                                        rarity: "RARE",
                                        price: 900.0,
                                        animal: "BLACK_CAT",
                                        specie: "Gato",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Cão Fantasma",
                                        rarity: "LEGENDARY",
                                        price: 1600.0,
                                        animal: "GHOST_DOG",
                                        specie: "Cão",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Coelho Zumbi",
                                        rarity: "EPIC",
                                        price: 1100.0,
                                        animal: "ZOMBIE_RABBIT",
                                        specie: "Coelho",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Cavalo Esqueleto",
                                        rarity: "LEGENDARY",
                                        price: 1800.0,
                                        animal: "SKELETON_HORSE",
                                        specie: "Cavalo",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Golem de Abóbora",
                                        rarity: "LEGENDARY",
                                        price: 2000.0,
                                        animal: "PUMPKIN_GOLEM",
                                        specie: "Golem",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    // Novos pets de evento
                                    {
                                        name: "Bruxa Felina",
                                        rarity: "EPIC",
                                        price: 1400.0,
                                        animal: "BLACK_CAT",
                                        specie: "Gato",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Corcel Fantasmal",
                                        rarity: "LEGENDARY",
                                        price: 1900.0,
                                        animal: "SKELETON_HORSE",
                                        specie: "Cavalo",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                    {
                                        name: "Corvo do Crepúsculo",
                                        rarity: "RARE",
                                        price: 850.0,
                                        animal: "RAVEN",
                                        specie: "Corvo",
                                        flags: ["EVENT_HALLOWEN_2025"],
                                        isEnabled: true,
                                    },
                                ],
                            });

                            // Obter IDs dos pets criados
                            const createdPets = await tx.pet.findMany({
                                where: { flags: { has: "EVENT_HALLOWEN_2025" } },
                                select: { id: true, name: true },
                            });

                            // Mapear pets para suas genéticas
                            const geneticsData = [];
                            for (const pet of createdPets) {
                                let petGenetics: any[] = [];
                                switch (pet.name) {
                                    case "Morcego Espectral":
                                        petGenetics = [
                                            { trait: "Asas Brilhantes", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Olhos Vermelhos", colorPart: "EYE", geneType: "RECESSIVE" },
                                            { trait: "Pelo Fosforescente", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                        ];
                                        break;
                                    case "Corvo Sombrio":
                                        petGenetics = [
                                            { trait: "Penas Negras", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Bico Prateado", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                            { trait: "Olhos Ambar", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                    case "Aranha Fantasmagórica":
                                        petGenetics = [
                                            { trait: "Corpo Espectral", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                            { trait: "Patas Roxas", colorPart: "COLOR2", geneType: "DOMINANT" },
                                            { trait: "Olhos Multicolor", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                    case "Lobo Uivante":
                                        petGenetics = [
                                            { trait: "Pelo Cinzento", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Marcas Lunares", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                            { trait: "Olhos Amarelos", colorPart: "EYE", geneType: "NEUTRAL" },
                                        ];
                                        break;
                                    case "Gato Preto Místico":
                                        petGenetics = [
                                            { trait: "Pelo Ébano", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Cauda Brilhante", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                            { trait: "Olhos Esmeralda", colorPart: "EYE", geneType: "CODOMINANT" },
                                        ];
                                        break;
                                    case "Cão Fantasma":
                                        petGenetics = [
                                            { trait: "Pelo Translúcido", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                            { trait: "Marcas Esfumaçadas", colorPart: "COLOR2", geneType: "DOMINANT" },
                                            { trait: "Olhos Brancos", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                    case "Coelho Zumbi":
                                        petGenetics = [
                                            { trait: "Pelo Esfarrapado", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Orelhas Rasgadas", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                            { trait: "Olhos Vermelhos", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                    case "Cavalo Esqueleto":
                                        petGenetics = [
                                            { trait: "Ossos Brilhantes", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                            { trait: "Crina Fantasmal", colorPart: "COLOR2", geneType: "DOMINANT" },
                                            { trait: "Olhos de Fogo", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                    case "Golem de Abóbora":
                                        petGenetics = [
                                            { trait: "Corpo de Abóbora", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Vinhas Brilhantes", colorPart: "COLOR2", geneType: "CODOMINANT" },
                                            { trait: "Olhos Flamejantes", colorPart: "EYE", geneType: "NEUTRAL" },
                                        ];
                                        break;
                                    case "Bruxa Felina":
                                        petGenetics = [
                                            { trait: "Pelo Roxo Místico", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Cauda de Bruxa", colorPart: "COLOR2", geneType: "RECESSIVE" },
                                            { trait: "Olhos Safira", colorPart: "EYE", geneType: "CODOMINANT" },
                                        ];
                                        break;
                                    case "Corcel Fantasmal":
                                        petGenetics = [
                                            { trait: "Ossos Fosforescentes", colorPart: "COLOR1", geneType: "CODOMINANT" },
                                            { trait: "Crina de Névoa", colorPart: "COLOR2", geneType: "DOMINANT" },
                                            { trait: "Olhos Azuis Brilhantes", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                    case "Corvo do Crepúsculo":
                                        petGenetics = [
                                            { trait: "Penas Crepusculares", colorPart: "COLOR1", geneType: "DOMINANT" },
                                            { trait: "Bico de Sombras", colorPart: "COLOR2", geneType: "NEUTRAL" },
                                            { trait: "Olhos Violetas", colorPart: "EYE", geneType: "RECESSIVE" },
                                        ];
                                        break;
                                }

                                // Adicionar genéticas ao pet
                                for (const genetic of petGenetics) {
                                    geneticsData.push({
                                        petId: pet.id,
                                        trait: genetic.trait,
                                        colorPart: genetic.colorPart,
                                        geneType: genetic.geneType,
                                    });
                                }
                            }

                            // Criar as genéticas
                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando genéticas...`));
                            await tx.genetics.createMany({
                                data: geneticsData,
                            });

                            await interaction.editReply(res.warning(`${icon.waiting_white} | Criando empresas`));

                            await tx.company.createMany({
                                data: [
                                    {
                                        name: "Loja de Poções Mágicas",
                                        description: "Especializada em poções encantadas e elixires místicos, crie, e venda poções poderosas.",
                                        difficulty: 3,
                                        experience: 1,
                                        isEnabled: true,
                                        wage: 60,
                                        expectations: ["CREATIVITY", "FOCUS"],
                                        flags: ["EVENT_HALLOWEN_2025", "NO_INTERVIEW"],
                                    },
                                    {
                                        name: "Taberna do Dragão Adormecido",
                                        description: "Um ponto de encontro para aventureiros e entusiastas de criaturas mágicas, seja um atendente ou garçonete atendendo os diferenciados tipos de clientes.",
                                        difficulty: 3,
                                        experience: 20,
                                        isEnabled: true,
                                        wage: 70,
                                        expectations: ["CREATIVITY", "FOCUS"],
                                        flags: ["EVENT_HALLOWEN_2025", "NO_INTERVIEW"],
                                    },
                                    {
                                        name: "Clube dos Aventureiros Noturnos",
                                        description: "Organiza expedições e explorações em busca de criaturas lendárias.",
                                        difficulty: 4,
                                        experience: 30,
                                        isEnabled: true,
                                        wage: 80,
                                        expectations: ["CREATIVITY", "FOCUS"],
                                        flags: ["EVENT_HALLOWEN_2025"],
                                    },
                                    {
                                        name: "Escola de Magia e Criaturas",
                                        description: "Ensina sobre magia e o cuidado com criaturas mágicas.",
                                        difficulty: 4,
                                        experience: 40,
                                        isEnabled: true,
                                        wage: 90,
                                        expectations: [{ skill: "magic", level: 2 }, { skill: "creature_handling", level: 2 }, { skill: "mentality", level: 4 }],
                                        flags: ["EVENT_HALLOWEN_2025"],
                                    },
                                    {
                                        name: "Expedições Místicas",
                                        description: "Lidera expedições para descobrir e estudar criaturas mágicas.",
                                        difficulty: 5,
                                        experience: 50,
                                        isEnabled: true,
                                        wage: 100,
                                        expectations: [{ skill: "magic", level: 3 }, { skill: "creature_handling", level: 3 }, { skill: "mentality", level: 5 }],
                                        flags: ["EVENT_HALLOWEN_2025", "100%_SITUATION"],
                                    },
                                    {
                                        name: "Ateliê de Encantamentos Sombrios",
                                        description: "Criação de artefatos mágicos com propriedades sobrenaturais.",
                                        difficulty: 4,
                                        experience: 25,
                                        isEnabled: true,
                                        wage: 85,
                                        expectations: ["CREATIVITY", "FOCUS", { skill: "magic", level: 2 }],
                                        flags: ["EVENT_HALLOWEN_2025", "NO_INTERVIEW"],
                                    },
                                    {
                                        name: "Cemitério dos Encantados",
                                        description: "Guardiões de relíquias e espíritos de criaturas mágicas.",
                                        difficulty: 5,
                                        experience: 45,
                                        isEnabled: true,
                                        wage: 95,
                                        expectations: [{ skill: "magic", level: 3 }, { skill: "mentality", level: 4 }, { skill: "creature_handling", level: 2 }],
                                        flags: ["EVENT_HALLOWEN_2025"],
                                    },
                                    {
                                        name: "Feira das Abóboras Encantadas",
                                        description: "Mercado de itens mágicos e abóboras encantadas para rituais.",
                                        difficulty: 3,
                                        experience: 15,
                                        isEnabled: true,
                                        wage: 65,
                                        expectations: ["CREATIVITY", "COMMUNICATION"],
                                        flags: ["EVENT_HALLOWEN_2025", "NO_INTERVIEW"],
                                    },
                                    {
                                        name: "Templo das Sombras",
                                        description: "Santuário para rituais místicos e conexão com o além, deixe os visitantes explorarem seus poderes ocultos, e mantenha o local limpo.",
                                        difficulty: 5,
                                        experience: 55,
                                        isEnabled: true,
                                        wage: 110,
                                        expectations: [{ skill: "magic", level: 4 }, { skill: "mentality", level: 5 }],
                                        flags: ["EVENT_HALLOWEN_2025", "100%_SITUATION"],
                                    },
                                    {
                                        name: "Biblioteca das Almas Perdidas",
                                        description: "Repositório de conhecimentos proibidos e magias ancestrais, organize os livros, manuscritos e pergaminhos, também não deixe ninguém roubar algum conhecimento proibido.",
                                        difficulty: 4,
                                        experience: 35,
                                        isEnabled: true,
                                        wage: 90,
                                        expectations: [{ skill: "magic", level: 2 }, { skill: "mentality", level: 3 }, { skill: "research", level: 2 }],
                                        flags: ["EVENT_HALLOWEN_2025"],
                                    },
                                ],
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