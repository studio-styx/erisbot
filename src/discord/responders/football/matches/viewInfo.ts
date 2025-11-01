import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";
import { menus } from "#menus";

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
        const [match, user] = await prisma.$transaction([
            prisma.footballMatch.findUnique({
                where: { id },
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
                            matchId: id
                        }
                    }
                }
            })
        ])

        if (!match) {
            await interaction.editReply(resv2.danger(`${icon.error} | Partida não encontrada.`));
            return;
        }

        await interaction.editReply(menus.football.matches.matchMenu(match, {
            bets: user.bets,
            id: interaction.user.id,
            displayAvatarURL: interaction.user.displayAvatarURL
        }));
        return;
    },
});