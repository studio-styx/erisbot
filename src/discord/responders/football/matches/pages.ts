import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { menus } from "#menus";

createResponder({
    customId: "football/matches/page/:page",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            page: parseInt(params.page)
        }
    },
    async run(interaction, { page }) {
        await interaction.deferUpdate();

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

        await interaction.editReply(menus.football.matches.get(matches, page));
        return;
    },
});