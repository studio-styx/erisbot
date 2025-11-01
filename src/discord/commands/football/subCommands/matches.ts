import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function footballMatchesCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();

    const match = interaction.options.getString("match");
    if (match) {
        const matchId = BigInt(match);
        const [matchData, userData] = await prisma.$transaction([
            prisma.footballMatch.findUnique({
                where: { id: matchId },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    competition: true
                }
            }),
            prisma.user.upsert({
                where: { id: interaction.user.id },
                create: { id: interaction.user.id },
                update: {},
                select: {
                    bets: {
                        where: {
                            matchId
                        }
                    }
                }
            })
        ])

        if (!matchData) return await interaction.editReply(res.danger(`${icon.error} | Partida não encontrada.`));

        await interaction.editReply(menus.football.matches.matchMenu(matchData, {
            bets: userData.bets,
            id: interaction.user.id,
            displayAvatarURL: interaction.user.displayAvatarURL
        }))
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