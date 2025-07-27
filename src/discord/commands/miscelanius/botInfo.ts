import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";
import { menus } from "#menus";

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
        const { user } = interaction
        switch (interaction.options.getSubcommand()) {
            case "info": {
                await interaction.deferReply()
                interaction.editReply(await menus.botinfo("main", interaction.client.user, user))
                return;
            }

            case "creators": {
                try {
                    const embed = new EmbedBuilder({
                        description: "**Criadores**\nVeja a seguir os participantes do Studio Styx",
                        fields: [
                            { name: "", value: "**BirdTool**\n-# ╰ Desenvolvedor", inline: true },
                            { name: "", value: "**Santos**\n-# ╰ Designer", inline: true },
                            { name: "", value: "**Lay**\n-# ╰ Designer e tradutora", inline: false }
                        ],
                        color: 0x791b1b
                    });

                    await interaction.reply({
                        flags: ["Ephemeral"],
                        embeds: [embed]
                    });
                } catch (error: unknown) {
                    console.log(error);
                    await interaction.reply({
                        flags: ["Ephemeral"],
                        content: `Ocorreu um erro ao tentar enviar a mensagem: ${error instanceof Error ? error.message : String(error)}`
                    });
                }
                return;
            }
            case "commands": {
                await interaction.deferReply({ flags })
                interaction.editReply(await menus.commands("bot", interaction))
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
