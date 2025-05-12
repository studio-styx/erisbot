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
                            name: 'TechNova',
                            description: 'Empresa de tecnologia de ponta focada em IA.',
                            difficulty: 3,
                            experience: 150,
                            wage: 350.00,
                            expectations: [
                                { skill: 'Resolução de Problemas', level: 4 },
                                { skill: 'Conhecimento em IA', level: 5 }
                            ]
                        },
                        {
                            name: 'AgroMax',
                            description: 'Cooperativa agrícola de grande porte.',
                            difficulty: 2,
                            experience: 80,
                            wage: 180.00,
                            expectations: [
                                { skill: 'Trabalho em equipe', level: 3 },
                                { skill: 'Pontualidade', level: 2 }
                            ]
                        },
                        {
                            name: 'Designo',
                            description: 'Agência de design gráfico e branding.',
                            difficulty: 4,
                            experience: 200,
                            wage: 270.00,
                            expectations: [
                                { skill: 'Criatividade', level: 5 },
                                { skill: 'Domínio de ferramentas Adobe', level: 4 }
                            ]
                        },
                        {
                            name: 'SafeBank',
                            description: 'Banco digital focado em segurança e inovação.',
                            difficulty: 5,
                            experience: 300,
                            wage: 420.00,
                            expectations: [
                                { skill: 'Segurança da informação', level: 5 },
                                { skill: 'Atenção a detalhes', level: 4 }
                            ]
                        }
                    ].map(company => ({
                        ...company,
                        expectations: company.expectations as any
                    }))
                });
                
                interaction.editReply(res.success("Empresas de teste adicionadas com sucesso."))
                return;
            }
        }
    },
});