import { createCommand } from "#base";
import { PrismaClient } from "#prisma/client";
import { icon, res } from "#utils";
import { brBuilder } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, time } from "discord.js";

const prisma = new PrismaClient();

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
        },
        {
            name: "cooldowns",
            description: "see your cooldowns",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "cooldowns",
                "en-US": "cooldowns",
                "es-ES": "cooldowns",
            },
            descriptionLocalizations: {
                "pt-BR": "veja seus cooldowns",
                "en-US": "see your cooldowns",
                "es-ES": "vea sus cooldowns",
            }
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
            case "cooldowns": {
                const userCooldowns = await prisma.cooldown.findMany({
                    where: {
                        userId: interaction.user.id
                    }
                })

                if (userCooldowns.length === 0) {
                    interaction.reply(res.danger(`${icon.error} | você não tem cooldowns.`));
                    return;
                }

                const now = new Date();

                const text = userCooldowns.map(c => `**${c.name}**: ${c.willEndIn > now ? time(c.willEndIn, "R") : "Expirado"}`).join("\n");

                interaction.reply(res.success(text, { flags: [], timestamp: now.toISOString(), title: "Cooldowns" }))
                return;
            }        
        }
    }
});