import { generateGeminiContent } from "#logic";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { icon, res } from "#utils";
import { brBuilder } from "@magicyan/discord";
import { ChatInputCommandInteraction, time } from "discord.js";

const prisma = new PrismaClient();

export async function investmentsEconomyCommands(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;
    const subCommand = options.getSubcommand();

    switch (subCommand) {
        case "buy": {
            const amount = options.getNumber("amount", true);
            const stockId = Number(options.getString("stock", true));

            await interaction.deferReply();

            const stock = await prisma.stock.findUnique({
                where: { id: stockId }
            })

            if (!stock) return interaction.editReply(res.danger(`${icon.error} | Stock not found`));

            const user = await prisma.user.upsert({
                where: { id: author.id },
                update: {},
                create: { id: author.id }
            })

            const valueToPay = stock.price.toNumber() * amount;

            if (user.money.toNumber() < valueToPay) return interaction.editReply(res.danger(`${icon.denied} | you don't have enough money`));

            await prisma.user.update({
                where: { id: author.id },
                data: {
                    money: { decrement: valueToPay },
                }
            })

            await prisma.stockHolding.upsert({
                where: {
                    userId_stockId: {
                        stockId,
                        userId: author.id
                    }
                },
                update: {
                    amount: { increment: amount }
                },
                create: {
                    userId: author.id,
                    stockId,
                    amount
                }
            })

            return interaction.editReply(res.success(`${icon.success} | you bought **${amount}** stock ${stock.name} stocks for **${valueToPay}** coins`));
        }
        case "own-stocks": {
            await interaction.deferReply({ flags });

            const user = await prisma.user.findUnique({
                where: { id: author.id },
                include: {
                    stocks: {
                        include: { stock: true }
                    }
                }
            })

            if (!user) return interaction.editReply(res.danger(`${icon.denied} | Você não tem ações compradas! use \`/economy investment buy\` para comprar uma ação.`));

            interaction.editReply(menus.investment.userStocks(user.stocks))
            return;
        }
        case "stocks": {
            await interaction.deferReply({ flags });

            const stocks = await prisma.stock.findMany({
                orderBy: {
                    price: "asc"
                },
            })

            interaction.editReply(menus.investment.stocks(stocks))
            return;
        }
        case "ia-avaliation": {
            await interaction.deferReply();

            const requisitionsReamig = await prisma.log.findMany({
                where: {
                    userId: interaction.user.id,
                    timestamp: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    },
                    type: "RequisitionToAI",
                },
            });

            if (requisitionsReamig.length > 4) {
                const oldestRequisition = requisitionsReamig.reduce((oldest, current) =>
                    current.timestamp < oldest.timestamp ? current : oldest
                );

                const expiryDate = new Date(oldestRequisition.timestamp.getTime() + 24 * 60 * 60 * 1000);

                const expiryUnix = Math.floor(expiryDate.getTime() / 1000);

                interaction.editReply(res.danger(`${icon.denied} | Você atingiu o limite de requisições diárias. Você pode tentar novamente <t:${expiryUnix}:R>`));
                return;
            }


            await interaction.editReply(res.warning(`${icon.waiting_white} | Aguardando resposta da IA...`));

            const stocks = await prisma.stock.findMany({
                orderBy: {
                    price: "asc"
                },
                include: {
                    history: true
                }
            });

            const user = await prisma.user.upsert({
                where: { id: author.id },
                update: {},
                create: { id: author.id }
            })

            const stocksInfosFormated = stocks.map(stock => (
                brBuilder(
                    `🔹 Ação: ${stock.name} (ID: ${stock.id})`,
                    `Preço atual: R$${stock.price.toNumber()}`,
                    `Descrição: ${stock.description || "Sem descrição disponível"}`,
                    `Histórico de preços:\n${stock.history.map(history => `- ${history.date.toLocaleDateString()}: R$${history.price.toNumber()}`).join("\n")}`
                )
            )).join("\n\n");

            const amountToBuy = options.getNumber("amount", true);
            const totalMoney = user.money.toNumber() + user.bank.toNumber();

            const prompt = brBuilder(
                `Você é um analista de investimentos e deve avaliar o desempenho de várias ações disponíveis no mercado.`,
                `O usuário ${author.displayName} possui R$${totalMoney} em verba e deseja comprar ${amountToBuy} ações.`,
                `Aqui estão as informações das ações disponíveis:\n\n${stocksInfosFormated}`,
                `Com base nessas informações, diga quais são as melhores ações para o usuário comprar no momento.`,
                `Explique claramente o motivo de sua escolha.`,
                `Distribua o número de ações (${amountToBuy}) entre as melhores opções sugeridas, respeitando o orçamento total de R$${totalMoney}.`,
                `Apresente o resultado como uma lista com o nome da ação, a quantidade sugerida para comprar e o total gasto por ação.`
            );

            try {
                const result = await generateGeminiContent(prompt);
                if (!result.success || !result.text) {
                    console.error("Erro ao gerar conteúdo:", result);
                    interaction.editReply(res.danger("Ocorreu um erro ao processar a solicitação. Tente novamente mais tarde."));
                    return;
                }

                const { text: avaliation } = result;

                await prisma.log.create({
                    data: {
                        userId: interaction.user.id,
                        type: "RequisitionToAI",
                        timestamp: new Date(),
                        message: `Pediu a IA para avaliar todas as ações disponíveis`,
                        level: 3,
                    },
                });

                interaction.editReply(res.success(`A avaliação das ações disponíveis foi avaliada pela IA, veja abaixo a avaliação:\n\n**${avaliation}**`))
            } catch (error) {
                console.error("Erro ao gerar conteúdo:", error);
                interaction.editReply(res.danger("Ocorreu um erro ao processar a solicitação. Tente novamente mais tarde."));
                return;
            }
        }
    }
    return;
}