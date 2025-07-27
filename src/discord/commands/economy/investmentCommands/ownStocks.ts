import { prisma } from "#database";
import { getCommandId, res, icon } from "#functions";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function ownStocksCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const {  user: author } = interaction;

    await interaction.deferReply({ flags });

    const user = await prisma.user.findUnique({
        where: { id: author.id },
        include: {
            stocks: {
                include: { stock: true }
            }
        }
    })

    const commandId = await getCommandId(interaction, "economy");

    if (!user) return interaction.editReply(res.danger(`${icon.denied} | Você não tem ações compradas! use </economy investment buy:${commandId}> para comprar uma ação.`));

    interaction.editReply(menus.investment.userStocks(user.stocks))
    return;
}