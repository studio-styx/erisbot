import { prisma } from "#database";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function footballMatchesCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();

    const matches = await prisma.footballFixture.findMany({
        include: {
            homeTeam: true,
            awayTeam: true,
            league: true,
            venue: true
        },
        orderBy: {
            date: "asc"
        }
    });

    await interaction.editReply(menus.football.matches.get(matches));
    return;
}