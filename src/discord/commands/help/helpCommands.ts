import { Store, createCommand } from "#base";
import { settings } from "#settings";
import { icon, res } from "functions/utils/index.js";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, time } from "discord.js";

const store = new Store<Date>();

createCommand({
    name: "suporte",
    description: "suporte do bot",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "reportar",
            description: "reportar algo",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "bug",
                    description: "reportar um bug",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "bug",
                            description: "bug a ser reportado",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            minLength: 10,
                        },
                        {
                            name: "print1",
                            description: "print do bug",
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        },
                        {
                            name: "print2",
                            description: "print do bug",
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        }
                    ]
                },
                {
                    name: "usuario",
                    description: "reportar um usuário",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "usuario",
                            description: "usuário a ser reportado",
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "motivo",
                            description: "motivo do report",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            minLength: 10,
                        },
                        {
                            name: "print1",
                            description: "print do report",
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        },
                        {
                            name: "print2",
                            description: "print do report",
                            type: ApplicationCommandOptionType.Attachment,
                            required: false
                        }
                    ]
                }
            ]
        },
        {
            name: "sugestao",
            description: "sugestão para o bot",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "sugestao",
                    description: "sugestão a ser enviada",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    minLength: 10,
                }
            ]
        }
    ],
    async run(interaction){
        if (store.has(interaction.user.id)) {
            const timeS = store.get(interaction.user.id)!;
            
            if (timeS.getTime() > Date.now()) {
                interaction.reply(res.danger(`${icon.error} Você já reportou algo recentemente, volte novamente em: ${time(timeS, "R")}`));
                return;
            }
        }

        const { options } = interaction;
        const subcommand = options.getSubcommand()
        const subcommandGroup = options.getSubcommandGroup()

        if (subcommandGroup) {
            switch (subcommand) {
                case "bug": {
                    const bug = options.getString("bug", true);
                    const print1 = options.getAttachment("print1")?.url;
                    const print2 = options.getAttachment("print2")?.url;
                
                    const channelSupport = interaction.client.guilds.cache.get(settings.bot.support.supportGuild)?.channels.cache.get(settings.bot.support.supportChannel);
                    if (!channelSupport) {
                        interaction.reply(res.danger(`${icon.error} | Não foi possível encontrar o canal de suporte`));
                        return;
                    }
                    if (channelSupport.type !== ChannelType.GuildText) {
                        interaction.reply(res.danger(`${icon.error} | O canal de suporte não é um canal de texto`));
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
                        interaction.reply(res.danger(`${icon.error} | Não foi possível enviar o bug para o canal`));
                        return;
                    }
                
                    interaction.reply(res.success(`${icon.success} | Bug reportado com sucesso`));
                    store.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 60), { time: 1000 * 60 * 60 });
                    return;
                }
                case "usuario": {
                    const user = options.getUser("usuario", true);
                    const motivo = options.getString("motivo", true);
                    const print1 = options.getAttachment("print1")?.url;
                    const print2 = options.getAttachment("print2")?.url;

                    if (user.id === interaction.user.id) {
                        interaction.reply(res.danger(`${icon.error} | Você não pode reportar você mesmo`));
                        return;
                    }
                    if (user.id === interaction.client.user.id) {
                        interaction.reply(res.danger(`${icon.error} | Você não pode me reportar`));
                        return;
                    }
                    if (user.bot) {
                        interaction.reply(res.danger(`${icon.error} | Você não pode reportar um bot`));
                        return;
                    }
                
                    const channelSupport = interaction.client.guilds.cache.get(settings.bot.support.supportGuild)?.channels.cache.get(settings.bot.support.supportChannel);
                    if (!channelSupport) {
                        interaction.reply(res.danger(`${icon.error} | Não foi possível encontrar o canal de suporte`));
                        return;
                    }
                    if (channelSupport.type !== ChannelType.GuildText) {
                        interaction.reply(res.danger(`${icon.error} | O canal de suporte não é um canal de texto`));
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
                        interaction.reply(res.danger(`${icon.error} | Não foi possível enviar o report para o canal`));
                        return;
                    }
                
                    interaction.reply(res.success(`${icon.success} | Usuário reportado com sucesso`));
                    store.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 60), { time: 1000 * 60 * 60 });
                    return;
                }
            }
        } else {
            const sugestao = options.getString("sugestao", true);

            const channelSupport = interaction.client.guilds.cache.get(settings.bot.support.supportGuild)?.channels.cache.get(settings.bot.support.supportChannel);
            if (!channelSupport) {
                interaction.reply(res.danger(`${icon.error} | Não foi possível encontrar o canal de suporte`));
                return;
            }
            if (channelSupport.type!== ChannelType.GuildText) {
                interaction.reply(res.danger(`${icon.error} | O canal de suporte não é um canal de texto`));
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
                interaction.reply(res.danger(`${icon.error} | Não foi possível enviar a sugestão para o canal`));
                return;
            }

            interaction.reply(res.success(`${icon.success} | Sugestão enviada com sucesso`));
            store.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 60), { time: 1000 * 60 * 60 });
            return;
        }
    }
});