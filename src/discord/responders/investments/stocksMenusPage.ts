import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { PrismaClient } from "#prisma/client";
import { icon, res } from "#utils";

const prisma = new PrismaClient();

createResponder({
    customId: "investment/menu/:menu/:page",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, menu }) {
        await interaction.deferUpdate();

        if (menu === "allStocks") {
            const stocks = await prisma.stock.findMany({
                orderBy: {
                    price: "asc"
                },  
            })
    
            interaction.editReply(menus.investment.stocks(stocks, Number(page)));
            return;
        } else {
            const user = await prisma.user.findUnique({
                where: { id: interaction.user.id },
                include: {
                    stocks: {
                        include: { stock: true }
                    }
                }
            })

            if (!user) {
                interaction.editReply(res.danger(`${icon.denied} | Você não tem ações compradas! use \`/economy investment buy\` para comprar uma ação.`));
                return;
            }
            interaction.editReply(menus.investment.userStocks(user.stocks, Number(page)))
            return;
        }
    },
});