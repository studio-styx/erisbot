import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

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
    async run(interaction){
        switch (interaction.options.getSubcommand()) {
            case "info": {
                const embed = new EmbedBuilder({

                })
            }
        }
    }
});