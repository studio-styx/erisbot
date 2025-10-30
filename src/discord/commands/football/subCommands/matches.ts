import { prisma } from "#database";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function footballMatchesCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();

    const dateFrom = new Date();
    dateFrom.setHours(0, 0, 0, 0);

    const dateTo = new Date();
    dateTo.setHours(23, 59, 59, 999);

    const matches = await prisma.footballMatch.findMany({
        where: {
            startAt: {
                gte: dateFrom,
                lte: dateTo
            }
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            competition: true
        },
        orderBy: [
            { competition: { name: "asc" } },
            { startAt: "asc" }
        ]
    });

    await interaction.editReply(menus.football.matches.matchesMenu(matches, interaction.user.displayAvatarURL(), new Date()))
    return;
}