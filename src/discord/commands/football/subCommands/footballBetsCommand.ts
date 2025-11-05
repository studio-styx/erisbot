import { prisma } from "#database";
import { ErisError } from "#functions";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function footballBetsCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();

    const userBets = await prisma.footballBet.findMany({
        where: {
            userId: interaction.user.id,
            status: {
                not: "CANCELED"
            }
        },
        include: {
            match: {
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    competition: true
                }
            }
        },
        orderBy: {
            match: {
                startAt: "asc"
            },
            createdAt: "desc"
        }
    });

    if (userBets.length < 1) throw new ErisError("Você não possui nenhuma aposta!");

    await interaction.editReply(menus.football.bets.betsMenu(userBets));
}