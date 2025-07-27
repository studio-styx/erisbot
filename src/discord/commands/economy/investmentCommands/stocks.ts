import { prisma } from "#database";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function stocksCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply({ flags });

    const stocks = await prisma.stock.findMany({
        orderBy: {
            price: "asc"
        },
    })

    interaction.editReply(menus.investment.stocks(stocks))
    return;
}