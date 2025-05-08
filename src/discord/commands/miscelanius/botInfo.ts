import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import i18next from "i18next";

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
                const embed = new EmbedBuilder({
                    description: t("title"),
                    fields: [
                        {
                            name: "",
                            value: t("birdtool"),
                            inline: true
                        },
                        {
                            name: "",
                            value: t("santos"),
                            inline: true
                        },
                        {
                            name: "",
                            value: t("lay"),
                            inline: false
                        }
                    ],
                    color: 0x791b1b
                })

                interaction.reply({
                    flags: ["Ephemeral"],
                    embeds: [embed]
                })
                return;
            }
        }
    }
});
