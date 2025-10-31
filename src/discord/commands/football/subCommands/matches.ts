import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { footballSdk } from "#tools";
import { ChatInputCommandInteraction } from "discord.js";

export async function footballMatchesCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();

    const match = interaction.options.getString("match");
    if (match) {
        const matchId = BigInt(match);
        const matchData = await prisma.footballMatch.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true
            }
        });

        if (!matchData) return await interaction.editReply(res.danger(`${icon.error} | Partida não encontrada.`));
        const matchApiInfo = await footballSdk.matches.getAndUseCache(matchData.apiId);
        await interaction.editReply(menus.football.matches.matchMenu({
            ...matchData,
            homeTeam: {
                ...matchData.homeTeam,
                statistics: matchApiInfo.homeTeam.statistics
            },
            awayTeam: {
                ...matchData.awayTeam,
                statistics: matchApiInfo.awayTeam.statistics
            }
        }, interaction.user.id, interaction.user.displayAvatarURL()))
        return
    }

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