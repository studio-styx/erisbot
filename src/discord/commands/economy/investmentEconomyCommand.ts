import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { icon, res } from "#utils";
import { ChatInputCommandInteraction } from "discord.js";

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
                where: { userId_stockId: {
                    stockId,
                    userId: author.id
                }},
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
    }
    return;
}