import { createCommand, createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { createLabel, createModalFields } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import crypto from "node:crypto";

function generateToken() {
    const apiKey = `ErisApiKey-${crypto.randomBytes(16).toString("hex")}`;
    const apiHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    return { key: apiKey, hash: apiHash };
}

createCommand({
    name: "apikey",
    description: "api ket management",
    nameLocalizations: {
        "pt-BR": "apikey",
        "en-US": "apikey",
        "es-ES": "apikey",
    },
    descriptionLocalizations: {
        "pt-BR": "gerenciamento de chaves da API",
        "en-US": "API key management",
        "es-ES": "gestión de claves de la API"
    },
    options: [
        {
            name: "generate",
            description: "generate a new API key",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "gerar",
                "en-US": "generate",
                "es-ES": "generar"
            },
            descriptionLocalizations: {
                "pt-BR": "gera uma nova chave de API",
                "en-US": "generate a new API key",
                "es-ES": "genera una nueva clave de API"
            }
        },
        {
            name: "delete",
            description: "delete an API key",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "deletar",
                "en-US": "delete",
                "es-ES": "eliminar"
            },
            descriptionLocalizations: {
                "pt-BR": "deleta uma chave de API",
                "en-US": "delete an API key",
                "es-ES": "elimina una clave de API"
            },
            options: [
                {
                    name: "bot",
                    description: "delete a bot API key",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "bot",
                        "en-US": "bot",
                        "es-ES": "bot"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "deleta a chave de API de um bot",
                        "en-US": "delete a bot API key",
                        "es-ES": "elimina la clave de API de un bot"
                    }
                }
            ]
        },
        {
            name: "regenerate",
            description: "regenerate an API key from a bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "regenerar",
                "en-US": "regenerate",
                "es-ES": "regenerar"
            },
            descriptionLocalizations: {
                "pt-BR": "regenera a chave de API de um bot",
                "en-US": "regenerate an API key from a bot",
                "es-ES": "regenera la clave de API de un bot"
            },
            options: [
                {
                    name: "bot",
                    description: "regenerate a bot API key",
                    type: ApplicationCommandOptionType.String,
                    nameLocalizations: {
                        "pt-BR": "bot",
                        "en-US": "bot",
                        "es-ES": "bot"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "regenera a chave de API de um bot",
                        "en-US": "regenerate a bot API key",
                        "es-ES": "regenera la clave de API de un bot"
                    }
                }
            ]
        }
    ],
    type: ApplicationCommandType.ChatInput,
    async autocomplete(interaction) {
        const { user, options, client } = interaction;
        const focused = options.getFocused(true);

        const getBotsNames = async () => {
            const raw = await redis.get(`apikey:bots:cache:${user.id}`);
            if (!raw) {
                const bots = await prisma.application.findMany({
                    where: {
                        ownerId: user.id
                    },
                });

                const names: { name: string; id: string }[] = [];
                await Promise.all(bots.map(async (bot) => {
                    try {
                        const discordBot = interaction.client.users.cache.get(bot.id);
                        if (discordBot) {
                            names.push({ name: discordBot.username, id: bot.id });
                        } else {
                            const fetchedBot = await client.users.fetch(bot.id).catch(() => null);
                            if (fetchedBot) {
                                names.push({ name: fetchedBot.username, id: bot.id });
                            } else {
                                await prisma.application.delete({
                                    where: {
                                        id: bot.id
                                    }
                                });
                            }
                        
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }));
                
                await redis.set(`apikey:bots:cache:${user.id}`, JSON.stringify(names));
                return names;
            } else {
                return JSON.parse(raw) as { name: string; id: string }[];
            }
        }

        if (focused.name === "bot") {
            const bots = await getBotsNames();
            await interaction.respond(bots.filter(bot => bot.name.toLowerCase().includes(focused.value.toLowerCase())).map(bot => ({
                name: bot.name,
                value: bot.id
            })));
            return;
        }
    },
    async run(interaction){
        const { user, options } = interaction;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "generate": {
                interaction.showModal({
                    title: "Gere um token",
                    customId: "apikey/generate",
                    components: createModalFields(
                        createLabel({
                            label: "Id do seu bot",
                            description: "Escreva o id de seu bot",
                            component: new TextInputBuilder({
                                customId: "botId",
                                required: true,
                                style: TextInputStyle.Short,
                                placeholder: "Digite o id do seu bot"
                            })
                        }),
                        createLabel({
                            label: "Permissões",
                            description: "As permissões que seu bot obterá",
                            component: new StringSelectMenuBuilder({
                                customId: "permissions",
                                placeholder: "Selecione as permissões",
                                options: [
                                    { label: "Ler a economia", value: "ECONOMY.READ" },
                                    { label: "Ler informações de usuário", value: "USER.INFO.READ" },
                                    { label: "Ler informações de sorteios", value: "GIVEAWAY.INFO.READ" }
                                ],
                                minValues: 1,
                                maxValues: 3,
                                required: true
                            })
                        })
                    )
                });
                return;
            }
            case "delete": {
                const botId = options.getString("bot", true);
                
                await interaction.deferReply({ flags });
                const bot = await prisma.application.findUnique({
                    where: {
                        id: botId,
                        ownerId: user.id
                    }
                });

                if (!bot) {
                    interaction.editReply(res.danger(`${icon.error} | Bot não encontrado!`));
                    return;
                }

                await prisma.application.update({
                    where: {
                        id: botId
                    },
                    data: {
                        token: { set: null }
                    }
                });

                interaction.editReply(res.success(`${icon.success} | Token deletado com sucesso!`));
                return;
            }
            case "regenerate": {
                const botId = options.getString("bot", true);

                await interaction.deferReply({ flags });

                const bot = await prisma.application.findUnique({
                    where: {
                        id: botId,
                        ownerId: user.id
                    }
                });

                if (!bot) {
                    interaction.editReply(res.danger(`${icon.error} | Bot não encontrado!`));
                    return;
                }

                const newToken = generateToken();

                await prisma.application.update({
                    where: {
                        id: botId,
                    },
                    data: {
                        token: newToken.hash
                    }
                });

                interaction.editReply(res.success(`${icon.success} | Novo token gerado: **\`${newToken.key}\`**`));
                return;
            }
        }
    }
});

createResponder({
    customId: "apikey/generate",
    types: [ResponderType.Modal], cache: "cached",
    async run(interaction) {
        const { user, fields, client } = interaction;

        const botId = fields.getTextInputValue("botId");
        const permissions = fields.getStringSelectValues("permissions");

        await interaction.deferReply({ flags });
        const bot = await client.users.fetch(botId, { cache: true }).catch(() => null);

        if (!bot || !bot.bot) {
            interaction.editReply(res.danger(`${icon.error} | Esse id não pertence a um bot!`));
            return;
        }

        const alreadyExist = await prisma.application.findUnique({
            where: {
                id: bot.id
            },
            select: { id: true }
        });

        if (alreadyExist) {
            interaction.editReply(res.danger(`${icon.error} | Um bot com esse id já está registrado em meu sistema! se você é o dono desse bot e nunca criou um token antes, por favor entre em contato com a staff.`))
            return;
        }

        const userBots = await prisma.application.count({
            where: {
                id: user.id
            }
        });

        if (userBots > 0) {
            interaction.editReply(res.danger(`${icon.error} | Você já tem um bot! para adicionar mais bots por favor entre em contato com a staff.`))
            return;
        }

        const token = generateToken();

        await prisma.application.create({
            data: {
                id: bot.id,
                ownerId: user.id,
                token: token.hash,
                permissions: [...permissions]
            }
        });

        interaction.editReply(res.success(`${icon.success} | Token gerado com sucesso! por favor nunca compartilhe esse token com ninguém. \n\n \`\`\`${token.key}\`\`\``));
        return;
    },
});