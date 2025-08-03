import { prisma } from "#database";
import { res, icon } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function buyStockCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { options, user: author } = interaction;

    const amount = options.getNumber("amount", true);
    const stockId = Number(options.getString("stock", true));

    await interaction.deferReply();

    const stock = await prisma.stock.findUnique({
        where: { id: stockId }
    })

    if (!stock) return interaction.editReply(res.danger(`${icon.Eris_cry} | Eu procurei por toda parte mas não encontrei essa ação.`));

    const user = await prisma.user.upsert({
        where: { id: author.id },
        update: {},
        create: { id: author.id }
    })

    const valueToPay = stock.price.toNumber() * amount;

    if (user.money.toNumber() < valueToPay) return interaction.editReply(res.danger(`${icon.Eris_cry} | você não tem dinheiro suficiente para comprar essa ação.`));

    await prisma.$transaction([
        prisma.user.update({
            where: { id: author.id },
            data: {
                money: { decrement: valueToPay },
            }
        }),
        prisma.stockHolding.upsert({
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
        }),
        prisma.log.create({
            data: {
                userId: author.id,
                type: "info",
                message: `Comprou ${amount} ações de ${stock.name} por: ${valueToPay} stx!`,
                level: 7,
                tags: ["economy", "investment", "buy", "stock", "sub"]
            }
        })
    ])

    return interaction.editReply(res.success(`${icon.success} | você comprou **${amount}** ações de ${stock.name} por: **${valueToPay}** stx!`));
}