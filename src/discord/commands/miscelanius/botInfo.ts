import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from "discord.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import i18next from "i18next";
import { menus } from "#menus";
import { getCommandId } from "#utils";
import { settings } from "#settings";

createCommand({
    name: "bot",
    description: "bot commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "info",
            description: "Get information about the bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "info",
                "en-US": "info",
                "es-ES": "info",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter informações sobre o bot",
                "en-US": "Get information about the bot",
                "es-ES": "Obtener información sobre el bot",
            }
        },
        {
            name: "creators",
            description: "Get information about the Studio Styx",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "criadores",
                "en-US": "creators",
                "es-ES": "creadores",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter informações sobre o Studio Styx",
                "en-US": "Get information about the Studio Styx",
                "es-ES": "Obtener información sobre el Studio Styx",
            }
        },
        {
            name: "commands",
            description: "Get commands from the bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "comandos",
                "en-US": "commands",
                "es-ES": "comandos",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter comandos do bot",
                "en-US": "Get commands from the bot",
                "es-ES": "Obtener comandos"
            }
        },
        {
            name: "ping",
            description: "Get the ping from the bot",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "ping",
                "en-US": "ping",
                "es-ES": "ping",
            },
            descriptionLocalizations: {
                "pt-BR": "Obter o ping do bot",
                "en-US": "Get the ping from the bot",
                "es-ES": "Obtener el ping del bot",
            }
        }
    ],
    nameLocalizations: {
        "pt-BR": "bot",
        "en-US": "bot",
        "es-ES": "bot",
    },
    descriptionLocalizations: {
        "pt-BR": "Comandos do bot",
        "en-US": "Bot commands",
        "es-ES": "Comandos del bot",
    },
    async run(interaction) {
        await i18next.changeLanguage(interaction.locale);
        switch (interaction.options.getSubcommand()) {
            case "info": {
                const botMember = interaction.guild?.members.me;
                const canEmbed = botMember?.permissionsIn(interaction.channel!).has('EmbedLinks');

                if (!canEmbed) {
                    const t = (key: string) => i18next.t(`errors/missingPermissions:${key}`);
                    interaction.reply(t("embedlink"));
                    return
                }
                const t = (key: string) => i18next.t(`commands/botInfo:info.${key}`);

                const container = createContainer({
                    accentColor: "#a13d67",
                    components: [
                        t("aboutTitle"),
                        createSection({
                            content: t("aboutDescription"),
                            thumbnail: interaction.client.user.displayAvatarURL()
                        }),
                        createRow(
                            new ButtonBuilder({
                                label: t("githubButton"),
                                style: ButtonStyle.Link,
                                url: "https://github.com/studio-styx/erisbot"
                            })
                        ),
                        createSeparator({ large: true }),
                        brBuilder(t("featuresTitle"), "", t("featuresList")),
                        createRow(
                            new ButtonBuilder({
                                label: t("discordJs"),
                                style: ButtonStyle.Link,
                                url: "https://discord.js.org"
                            }),
                            new ButtonBuilder({
                                label: t("developer"),
                                style: ButtonStyle.Secondary,
                                customId: "redirects/botCreators"
                            }),
                            new ButtonBuilder({
                                label: t("host"),
                                style: ButtonStyle.Link,
                                url: "https://discloud.com"
                            })
                        )
                    ]
                });

                interaction.reply({
                    flags: ["Ephemeral", "IsComponentsV2"],
                    components: [container]
                })
                return;
            }
            case "creators": {
                const t = (key: string) => i18next.t(`commands/botInfo:creators.${key}`);
                
                try {
                    const embed = new EmbedBuilder({
                        description: t("title"),
                        fields: [
                            { name: "", value: t("birdtool"), inline: true },
                            { name: "", value: t("santos"), inline: true },
                            { name: "", value: t("lay"), inline: false }
                        ],
                        color: 0x791b1b
                    });
            
                    await interaction.reply({
                        flags: ["Ephemeral"],
                        embeds: [embed]
                    });
                } catch {
                    // fallback em texto plano
                    await interaction.reply({
                        flags: ["Ephemeral"],
                        content: [
                            `**${t("title")}**`,
                            t("birdtool"),
                            t("santos"),
                            t("lay")
                        ].join("\n")
                    });
                }
                return;
            }            
            case "commands": {
                const commandId = await getCommandId(interaction, "bot")
                
                interaction.reply(menus.commands(commandId, "bot"))
                return;
            }
            case "ping": {
                const start = Date.now();
                await interaction.deferReply({ flags });
            
                const apiPing = interaction.client.ws.ping < 1 ? 0 : interaction.client.ws.ping;
                const botPing = Date.now() - start;
            
                try {
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: "🏓 Ping",
                                description: `**Ping do Bot:** ${botPing}ms\n**Ping da API:** ${apiPing}ms`,
                                color: 0x1f3baa
                            })
                        ]
                    });
                } catch {
                    await interaction.editReply(
                        `🏓 **Ping do Bot:** ${botPing}ms\n**Ping da API:** ${apiPing}ms`
                    );
                }
            
                return;
            }
        }
    }
});
