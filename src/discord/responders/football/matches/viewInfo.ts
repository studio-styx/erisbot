import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";
import { menus } from "#menus";
import { footballSdk } from "#tools";

createResponder({
    customId: "football/match/view/:id",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            id: BigInt(params.id)
        }
    },
    async run(interaction, { id }) {
        await interaction.deferUpdate();
        const match = await prisma.footballMatch.findUnique({
            where: { id },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true
            }
        });

        if (!match) {
            await interaction.editReply(resv2.danger(`${icon.error} | Partida não encontrada.`));
            return;
        }

        const matchApiInfo = await footballSdk.matches.getAndUseCache(match.apiId);

        await interaction.editReply(menus.football.matches.matchMenu({
            ...match,
            homeTeam: {
                ...match.homeTeam,
                statistics: matchApiInfo.homeTeam.statistics
            },
            awayTeam: {
                ...match.awayTeam,
                statistics: matchApiInfo.awayTeam.statistics
            }
        }, interaction.user.id, interaction.user.displayAvatarURL()));
        return;
    },
});