import { setupCreators } from "#base";
import { settings } from "#settings";
import { EmbedBuilder } from "discord.js";

export const { createCommand, createEvent, createResponder } = setupCreators({
    commands: {
        guilds: ["1172930138770526248"],
        onNotFound: (interaction) => {
            const embed = new EmbedBuilder({
                description: `Command not found!`,
                color: parseInt(settings.colors.danger, 16)
            })

            interaction.reply({ embeds: [embed], flags });
            return;
        },
        onError(error, interaction) {
            const embed = new EmbedBuilder({
                description: `**An error occurred while executing the command: \`${error instanceof Error ? error.message : "Unknown error"}\`**`,
                color: parseInt(settings.colors.danger, 16)
            })

            interaction.reply({ embeds: [embed], flags });
            return;
        },
    }
});