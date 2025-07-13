import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";

const prisma = new PrismaClient();

createResponder({
    customId: "investment/info/:id",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { id }) {
        await interaction.deferReply({ flags });

        const stock = await prisma.stock.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                history: true,
            }
        })

        if (!stock) {
            interaction.editReply("Ação não encontrada.");
            return;
        }

        const stockInfo = {
            price: stock.price,
            id: stock.id,
            name: stock.name,
            description: stock.description,
            iaAvaliation: stock.iaAvaliation,
        }

        interaction.editReply(await menus.investment.stockInfoMenu(stockInfo, stock.history))
        return;
    },
});