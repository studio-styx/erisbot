import { createCommand } from "#base";
import { prisma } from "#database";
import { getUserInfo, setUserInfo } from "#functions";
import { menus } from "#menus";
import { env } from "#settings";
import { LorittaApiSDK } from "#tools";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";

const lorittaSDK = new LorittaApiSDK(env.LORITTA_API_KEY);

createCommand({
    name: "user",
    description: "view user infos",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "logs",
            description: "see your logs",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "logs",
                "en-US": "logs",
                "es-ES": "logs",
            },
            descriptionLocalizations: {
                "pt-BR": "veja suas logs",
                "en-US": "see your logs",
                "es-ES": "vea sus logs",
            },
            options: [
                {
                    name: "ephemeral",
                    description: "command ephemeral? (default: true)",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false
                }
            ]
        },
        {
            name: "avatar",
            description: "see your avatar",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "user to see avatar",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                    nameLocalizations: {
                        "pt-BR": "usuário",
                        "en-US": "user",
                        "es-ES": "usuario",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para ver avatar",
                        "en-US": "user to see avatar",
                        "es-ES": "usuario para ver avatar",
                    }
                },
                {
                    name: "ephemeral",
                    description: "is message ephemeral? (default: true)",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                    nameLocalizations: {
                        "pt-BR": "temporário",
                        "en-US": "ephemeral",
                        "es-ES": "ephemeral",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "é mensagem temporária? (padrão: true)",
                        "en-US": "is message ephemeral? (default: true)",
                        "es-ES": "es mensaje ephemeral? (predeterminado: true)",
                    }
                }
            ],
            nameLocalizations: {
                "pt-BR": "avatar",
                "en-US": "avatar",
                "es-ES": "avatar",
            },
            descriptionLocalizations: {
                "pt-BR": "veja seu avatar",
                "en-US": "see your avatar",
                "es-ES": "vea su avatar",
            }
        },
        {
            name: "info",
            description: "get's user info",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "info",
                "en-US": "info",
                "es-ES": "info",
            },
            descriptionLocalizations: {
                "pt-BR": "pega informações do usuário",
                "en-US": "get's user info",
                "es-ES": "pega información del usuario",
            },
            options: [
                {
                    name: "user",
                    description: "user to see informations",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                    nameLocalizations: {
                        "pt-BR": "usuário",
                        "en-US": "user",
                        "es-ES": "usuario",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para ver informações",
                        "en-US": "user to see informations",
                        "es-ES": "usuario para ver información",
                    }
                },
                {
                    name: "ephemeral",
                    description: "is message ephemeral? (default: false)",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                    nameLocalizations: {
                        "pt-BR": "temporário",
                        "en-US": "ephemeral",
                        "es-ES": "ephemeral",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "é mensagem temporária? (padrão: false)",
                        "en-US": "is message ephemeral? (default: false)",
                        "es-ES": "es mensaje ephemeral? (predeterminado: false)",
                    }
                }
            ]
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        switch (options.getSubcommand()) {
            case "logs": {
                const ephemeral = options.getBoolean("ephemeral") ?? true;
                await interaction.deferReply({ flags: ephemeral ? ["Ephemeral"] : [] });

                const userLogs = await prisma.log.findMany({
                    where: {
                        userId: interaction.user.id,
                        NOT: {
                            OR: [
                                { type: "debug" },
                                { type: "error" }
                            ]
                        }
                    },
                    orderBy: {
                        timestamp: "desc"
                    }
                });

                interaction.editReply(menus.logsMenu(userLogs, 0, { name: interaction.user.displayName, avatarURL: interaction.user.displayAvatarURL(), id: interaction.user.id }));
                return;
            }
            case "avatar": {
                const ephemeral = options.getBoolean("ephemeral") ?? true;
                const user = options.getUser("user") ?? interaction.user;
                const embed = createEmbed({ image: user.displayAvatarURL() })
                interaction.reply({ embeds: [embed], flags: ephemeral ? ["Ephemeral"] : [] });
                return;
            }
            case "info": {
                const user = options.getUser("user") ?? interaction.user;
                const ephemeral = options.getBoolean("ephemeral") ?? false;

                await interaction.deferReply({ flags: ephemeral ? ["Ephemeral"] : [] });

                const cached = getUserInfo(user.id);

                if (cached) {
                    await interaction.editReply(menus.user.info(interaction.user.id, user, interaction.member, cached.erisUser, cached.lorittaUser, "discord"))
                    return;
                }

                const [lorittaUser, dbUser] = await Promise.all([
                    lorittaSDK.user(user.id).catch(() => null),
                    prisma.user.upsert({
                        where: {
                            id: user.id
                        },
                        include: {
                            activePet: true,
                            pets: true,
                            fishs: true,
                            giveaways: true
                        },
                        create: {
                            id: user.id
                        },
                        update: {}
                    })
                ]);

                setUserInfo(user.id, { erisUser: dbUser, lorittaUser })

                await interaction.editReply(menus.user.info(interaction.user.id, user, interaction.member, dbUser, lorittaUser, "discord"))
                return;
            }
        }
    }
});