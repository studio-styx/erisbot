import { createCommand } from "#base";
import { menus } from "#menus";
import { PrismaClient } from "#prisma";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";

const prisma = new PrismaClient();

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
        }
    ],
    async run(interaction){
        const { options } = interaction;
        switch (options.getSubcommand()) {
            case "logs": {
                const ephemeral = options.getBoolean("ephemeral") ?? true;
                await interaction.deferReply({ flags: ephemeral ? ["Ephemeral"] : [] });

                const userLogs = await prisma.log.findMany({
                    where: {
                        userId: interaction.user.id,
                        type: {
                            not: "debug"
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
        }
    }
});