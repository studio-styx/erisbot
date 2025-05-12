import { createCommand } from "#base";
import { PrismaClient } from "#prisma/client";
import { res } from "#utils";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

const prisma = new PrismaClient();

createCommand({
    name: "sudo",
    description: "sudo commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "database",
            description: "manage database",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "query",
                    description: "query to use",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
        },
        {
            name: "test",
            description: "test function",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async run(interaction) {
        if (interaction.user.id !== "1171963692984844401") {
            interaction.reply(res.danger("You are not allowed to use this command!"));
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "database": {
                interaction.reply(res.danger("Not happening"))
                return;
            }
            case "test": {
                await interaction.deferReply({ flags })
                await prisma.company.createMany({
                    data: [
                        {
                            name: "Entregas Rápidas",
                            description: "Empresa de entregas leves e locais.",
                            difficulty: 1,
                            experience: 0,
                            wage: 80.00,
                            expectations: ["Pontualidade", "Agilidade"]
                        },
                        {
                            name: "Café do Bairro",
                            description: "Atendimento em balcão e serviço de mesa.",
                            difficulty: 1,
                            experience: 0,
                            wage: 75.00,
                            expectations: ["Simpatia", "Boa comunicação"]
                        },
                        {
                            name: "Tecno Office",
                            description: "Serviços administrativos em empresa de TI.",
                            difficulty: 2,
                            experience: 25,
                            wage: 150.00,
                            expectations: ["Organização", "Conhecimento básico em informática"]
                        },
                        {
                            name: "Auto Elétrica Souza",
                            description: "Ajudante para serviços de manutenção elétrica.",
                            difficulty: 3,
                            experience: 30,
                            wage: 180.00,
                            expectations: ["Responsabilidade", "Conhecimento técnico"]
                        },
                        {
                            name: "Agência Criativa Pixel",
                            description: "Criação de posts para redes sociais.",
                            difficulty: 2,
                            experience: 40,
                            wage: 200.00,
                            expectations: ["Criatividade", "Conhecimento em design"]
                        }
                    ]
                });

                interaction.editReply(res.success("Empresas de teste adicionadas com sucesso."))
                return;
            }
        }
    },
});