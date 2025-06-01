import { createCommand } from "#base";
import { menus } from "#menus";
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
                await interaction.deferReply();

                const stocks = [
                    { id: 1, name: 'EnerSol', price: 112.45, description: 'Empresa de energia solar com foco em sustentabilidade e expansão global.' },
                    { id: 2, name: 'TransLogix', price: 48.30, description: 'Logística de transporte urbano e interestadual com atuação na América do Sul.' },
                    { id: 3, name: 'NeoByte Tech', price: 276.10, description: 'Empresa de tecnologia voltada para IA e infraestrutura em nuvem.' },
                    { id: 4, name: 'Banco Terra', price: 36.89, description: 'Banco nacional com forte presença no setor agropecuário e rural.' },
                    { id: 5, name: 'BioAlimentos', price: 67.22, description: 'Indústria alimentícia focada em produtos orgânicos e saudáveis.' },
                    { id: 6, name: 'MetroBuild', price: 91.00, description: 'Construtora com atuação em megaprojetos urbanos e ferrovias.' },
                    { id: 7, name: 'Hydra Energia', price: 145.77, description: 'Empresa do setor elétrico com foco em hidrelétricas e energias limpas.' },
                    { id: 8, name: 'MedGlobal', price: 198.65, description: 'Multinacional de tecnologia médica e farmacêutica.' },
                ]

                function generatePriceHistory(basePrice: number, days = 30): { price: number; date: Date }[] {
                    const history = []
                    let currentPrice = basePrice

                    for (let i = days - 1; i >= 0; i--) {
                        const variation = (Math.random() - 0.5) * 4 // variação entre -2% e +2%
                        currentPrice *= 1 + variation / 100
                        currentPrice = parseFloat(currentPrice.toFixed(2))

                        const date = new Date()
                        date.setDate(date.getDate() - i)

                        history.push({ price: currentPrice, date })
                    }

                    return history
                }

                async function main() {
                    for (const stock of stocks) {
                        const createdStock = await prisma.stock.upsert({
                            where: { id: stock.id },
                            update: {},
                            create: {
                                id: stock.id,
                                name: stock.name,
                                price: stock.price,
                                description: stock.description,
                            },
                        })

                        const history = generatePriceHistory(stock.price)

                        await prisma.stockHistory.createMany({
                            data: history.map(h => ({
                                stockId: createdStock.id,
                                price: h.price,
                                date: h.date,
                            })),
                            skipDuplicates: true,
                        })
                    }

                    console.log('Ações e históricos criados com sucesso!')
                }

                main()
                    .catch(e => {
                        console.error(e)
                    })
                    .finally(async () => {
                        await prisma.$disconnect()
                    })

                interaction.editReply(res.success("Done"))
                return;
            }
        }
    },
});