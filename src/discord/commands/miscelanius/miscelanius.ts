import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
    name: "miscelanius",
    description: "miscelanius commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "conter",
            description: "count to the maximum in 1 second",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "conter",
                "en-US": "count",
                "es-ES": "contar",
            },
            descriptionLocalizations: {
                "pt-BR": "conta até o máximo em 1 segundo",
                "en-US": "count to the maximum in 1 second",
                "es-ES": "cuenta hasta el máximo en 1 segundo",
            },
            options: [
                {
                    name: "seconds",
                    description: "seconds to count",
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                    maxValue: 15,
                    required: false,
                    nameLocalizations: {
                        "pt-BR": "segundos",
                        "en-US": "seconds",
                        "es-ES": "segundos",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "segundos para contar",
                        "en-US": "seconds to count",
                        "es-ES": "segundos para contar",
                    }
                }
            ]
        }
    ],
    async run(interaction){
        switch (interaction.options.getSubcommand()) {
            case "conter": {
                const seconds = interaction.options.getInteger("seconds") || 1;
            
                await interaction.reply({ content: `Contando o máximo possível por ${seconds} segundos...` });
            
                const start = Date.now();
                let count = 0;
            
                while (Date.now() - start < seconds * 1000) {
                    count++;
                }
            
                await interaction.editReply({ content: `Tempo acabou! Contei até **${count.toLocaleString()}**.` });
            
                return;
            }            
        }
    }
});