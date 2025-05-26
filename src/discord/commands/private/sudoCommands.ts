import { createCommand } from "#base";
import { Prisma, PrismaClient } from "#prisma/client";
import { res, resv2 } from "#utils";
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
                await interaction.deferReply({ flags });
                await prisma.stock.createMany({
                    data: [
                        {
                            name: 'EnerSol',
                            price: new Prisma.Decimal(112.45),
                            description: 'Empresa de energia solar com foco em sustentabilidade e expansão global.',
                        },
                        {
                            name: 'TransLogix',
                            price: new Prisma.Decimal(48.30),
                            description: 'Logística de transporte urbano e interestadual com atuação na América do Sul.',
                        },
                        {
                            name: 'NeoByte Tech',
                            price: new Prisma.Decimal(276.10),
                            description: 'Empresa de tecnologia voltada para IA e infraestrutura em nuvem.',
                        },
                        {
                            name: 'Banco Terra',
                            price: new Prisma.Decimal(36.89),
                            description: 'Banco nacional com forte presença no setor agropecuário e rural.',
                        },
                        {
                            name: 'BioAlimentos',
                            price: new Prisma.Decimal(67.22),
                            description: 'Indústria alimentícia focada em produtos orgânicos e saudáveis.',
                        },
                        {
                            name: 'MetroBuild',
                            price: new Prisma.Decimal(91.00),
                            description: 'Construtora com atuação em megaprojetos urbanos e ferrovias.',
                        },
                        {
                            name: 'Hydra Energia',
                            price: new Prisma.Decimal(145.77),
                            description: 'Empresa do setor elétrico com foco em hidrelétricas e energias limpas.',
                        },
                        {
                            name: 'MedGlobal',
                            price: new Prisma.Decimal(198.65),
                            description: 'Multinacional de tecnologia médica e farmacêutica.',
                        },
                    ],
                });

                interaction.editReply(resv2.success(`sucesso`))
            }
        }
    },
});