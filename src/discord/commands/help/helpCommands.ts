import { Store, createCommand } from "#base";
import { settings } from "#settings";
import { icon, res } from "#functions";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord.js";
import { getLang, translate } from "#locale"

const store = new Store<Date>();

createCommand({
    name: "support",
    description: "bot support",
    nameLocalizations: {
        "pt-BR": "suporte",
        "es-ES": "soporte",
    },
    descriptionLocalizations: {
        "pt-BR": "suporte do bot",
        "es-ES": "soporte del bot",
    },
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "report",
            description: "report something",
            nameLocalizations: {
                "pt-BR": "reportar",
                "es-ES": "reportar",
            },
            descriptionLocalizations: {
                "pt-BR": "reportar algo",
                "es-ES": "reportar algo",
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "bug",
                    description: "report a bug",
                    nameLocalizations: {
                        "pt-BR": "bug",
                        "es-ES": "error",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "reportar um bug",
                        "es-ES": "reportar un error",
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "bug",
                            description: "bug to be reported",
                            nameLocalizations: {
                                "pt-BR": "bug",
                                "es-ES": "error",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "bug a ser reportado",
                                "es-ES": "error que se va a reportar",
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            minLength: 10,
                        },
                        {
                            name: "screenshot1",
                            description: "screenshot of the bug",
                            nameLocalizations: {
                                "pt-BR": "print1",
                                "es-ES": "captura1",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "print do bug",
                                "es-ES": "captura del error",
                            },
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        },
                        {
                            name: "screenshot2",
                            description: "screenshot of the bug",
                            nameLocalizations: {
                                "pt-BR": "print2",
                                "es-ES": "captura2",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "print do bug",
                                "es-ES": "captura del error",
                            },
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        }
                    ]
                },
                {
                    name: "user",
                    description: "report a user",
                    nameLocalizations: {
                        "pt-BR": "usuario",
                        "es-ES": "usuario",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "reportar um usuário",
                        "es-ES": "reportar a un usuario",
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user",
                            description: "user to be reported",
                            nameLocalizations: {
                                "pt-BR": "usuario",
                                "es-ES": "usuario",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "usuário a ser reportado",
                                "es-ES": "usuario que se va a reportar",
                            },
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "reason for the report",
                            nameLocalizations: {
                                "pt-BR": "motivo",
                                "es-ES": "motivo",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "motivo do report",
                                "es-ES": "motivo del reporte",
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            minLength: 10,
                        },
                        {
                            name: "screenshot1",
                            description: "screenshot of the report",
                            nameLocalizations: {
                                "pt-BR": "print1",
                                "es-ES": "captura1",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "print do report",
                                "es-ES": "captura del reporte",
                            },
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        },
                        {
                            name: "screenshot2",
                            description: "screenshot of the report",
                            nameLocalizations: {
                                "pt-BR": "print2",
                                "es-ES": "captura2",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "print do report",
                                "es-ES": "captura del reporte",
                            },
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        }
                    ]
                }
            ]
        },
        {
            name: "suggestion",
            description: "suggest something for the bot",
            nameLocalizations: {
                "pt-BR": "sugestao",
                "es-ES": "sugerencia",
            },
            descriptionLocalizations: {
                "pt-BR": "sugestão para o bot",
                "es-ES": "sugerencia para el bot",
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "suggestion",
                    description: "suggestion to be sent",
                    nameLocalizations: {
                        "pt-BR": "sugestao",
                        "es-ES": "sugerencia",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "sugestão a ser enviada",
                        "es-ES": "sugerencia que se enviará",
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    minLength: 10,
                }
            ]
        }
    ],
    async run(interaction){
        const { options, locale } = interaction;

        const lang = getLang(locale);
        const t = translate.commands.support[lang];

        if (store.has(interaction.user.id)) {
            const timeS = store.get(interaction.user.id)!;
            
            if (timeS.getTime() > Date.now()) {
                interaction.reply(res.danger(t.cooldown(timeS)));
                return;
            }
        }

        const subcommand = options.getSubcommand()
        const subcommandGroup = options.getSubcommandGroup()

        if (subcommandGroup) {
            switch (subcommand) {
                case "bug": {
                    const bug = options.getString("bug", true);
                    const print1 = options.getAttachment("screenshot1")?.url;
                    const print2 = options.getAttachment("screenshot2")?.url;
                
                    const channelSupport = interaction.client.guilds.cache.get(settings.bot.support.supportGuild)?.channels.cache.get(settings.bot.support.supportChannel);
                    if (!channelSupport) {
                        interaction.reply(res.danger(t.errors.supportChannelNotFound));
                        return;
                    }
                    if (channelSupport.type !== ChannelType.GuildText) {
                        interaction.reply(res.danger(t.errors.channelSupportIsNotTextChannel));
                        return;
                    }
                    try {
                        const mainEmbed = createEmbed({
                            title: `${icon.error} Bug Report`,
                            description: `**Usuário:** ${interaction.user}\n**ID:** ${interaction.user.id}\n**Bug:** ${bug}`,
                            thumbnail: interaction.user.displayAvatarURL(),
                            color: settings.colors.danger,
                        });
                
                        const embeds = [mainEmbed];
                        
                        if (print1) {
                            const print1Embed = createEmbed({
                                color: settings.colors.danger,
                                image: print1,
                                description: "Print 1"
                            });
                            embeds.push(print1Embed);
                        }
                        
                        if (print2) {
                            const print2Embed = createEmbed({
                                color: settings.colors.danger,
                                image: print2,
                                description: "Print 2"
                            });
                            embeds.push(print2Embed);
                        }
                        
                        await channelSupport.send({
                            embeds
                        });
                    } catch (error) {
                        console.error(error);
                        interaction.reply(res.danger(t.bug.errorMessage));
                        return;
                    }
                
                    interaction.reply(res.success(t.bug.message));
                    store.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 60), { time: 1000 * 60 * 60 });
                    return;
                }
                case "user": {
                    const user = options.getUser("user", true);
                    const motivo = options.getString("reason", true);
                    const print1 = options.getAttachment("scheenshot1")?.url;
                    const print2 = options.getAttachment("scheenshot2")?.url;

                    if (user.id === interaction.user.id) {
                        interaction.reply(res.danger(t.report.selfReport));
                        return;
                    }
                    if (user.id === interaction.client.user.id) {
                        interaction.reply(res.danger(t.report.erisReport));
                        return;
                    }
                
                    const channelSupport = interaction.client.guilds.cache.get(settings.bot.support.supportGuild)?.channels.cache.get(settings.bot.support.supportChannel);
                    if (!channelSupport) {
                        interaction.reply(res.danger(t.errors.supportChannelNotFound));
                        return;
                    }
                    if (channelSupport.type !== ChannelType.GuildText) {
                        interaction.reply(res.danger(t.errors.channelSupportIsNotTextChannel));
                        return;
                    }
                    try {
                        const embed = createEmbed({
                            title: `${icon.error} User Report`,
                            description: brBuilder(
                                `**Usuário:** ${interaction.user}`,
                                `**ID:** ${interaction.user.id}`,
                                `**Motivo:** ${motivo}`,
                            ),
                            thumbnail: interaction.user.displayAvatarURL(),
                            color: settings.colors.danger,
                        });
                
                        const embedReportedUser = createEmbed({
                            title: `${icon.error} Usuário reportado`,
                            description: brBuilder(
                                `**Usuário:** ${user.displayName}`,
                                `**ID:** ${user.id}`,
                                `**Motivo:** ${motivo}`,
                            ),
                            thumbnail: user.displayAvatarURL(),
                            color: settings.colors.danger,
                        });
                
                        const embeds = [embed, embedReportedUser];
                        
                        if (print1) {
                            const print1Embed = createEmbed({
                                color: settings.colors.danger,
                                image: print1,
                                description: "Print 1"
                            });
                            embeds.push(print1Embed);
                        }
                        
                        if (print2) {
                            const print2Embed = createEmbed({
                                color: settings.colors.danger,
                                image: print2,
                                description: "Print 2"
                            });
                            embeds.push(print2Embed);
                        }
                        
                        await channelSupport.send({
                            embeds: embeds
                        });
                    } catch (error) {
                        console.error(error);
                        interaction.reply(res.danger(t.report.errorMessage));
                        return;
                    }
                
                    interaction.reply(res.success(t.report.message));
                    store.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 60), { time: 1000 * 60 * 60 });
                    return;
                }
            }
        } else {
            const sugestao = options.getString("suggestion", true);

            const channelSupport = interaction.client.guilds.cache.get(settings.bot.support.supportGuild)?.channels.cache.get(settings.bot.support.supportChannel);
            if (!channelSupport) {
                interaction.reply(res.danger(t.errors.supportChannelNotFound));
                return;
            }
            if (channelSupport.type!== ChannelType.GuildText) {
                interaction.reply(res.danger(t.errors.channelSupportIsNotTextChannel));
                return;
            }

            try {
                const embed = createEmbed({
                    title: `${icon.success} Sugestão`,
                    description: brBuilder(
                        `**Usuário:** ${interaction.user}`,
                        `**ID:** ${interaction.user.id}`,
                        `**Sugestão:** ${sugestao}`,
                    ),
                    thumbnail: interaction.user.displayAvatarURL(),
                    color: settings.colors.warning,
                })

                await channelSupport.send({
                    embeds: [embed]
                })
            } catch (error) {
                console.error(error);
                interaction.reply(res.danger(t.suggestion.errorMessage));
                return;
            }

            interaction.reply(res.success(t.suggestion.message));
            store.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 60), { time: 1000 * 60 * 60 });
            return;
        }
    }
});