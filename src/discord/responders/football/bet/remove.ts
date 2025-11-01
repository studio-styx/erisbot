import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "football/bet/remove/:betId/:userId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            betId: BigInt(params.betId),
            userId: params.userId
        }
    },
    async run(interaction, { betId, userId }) {
        const { user } = interaction;

        if (user.id !== userId) {
            await interaction.reply(res.danger(`${icon.denied} | Boa tentativa, mas você não pode excluir a aposta de outros usuários!`));
            return;
        }

        await interaction.deferUpdate();

        const bet = await prisma.footballBet.findUnique({
            where: {
                id: betId
            },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                        competition: true
                    }
                }
            }
        });

        if (!bet) {
            await interaction.followUp(res.danger(`${icon.error} | Aposta não encontrada!`));
            return;
        }

        const [userBets] = await prisma.$transaction([
            prisma.footballBet.findMany({
                where: {
                    userId,
                    id: { not: betId },
                    matchId: bet.matchId
                }
            }),
            prisma.footballBet.delete({
                where: {
                    id: betId
                }
            })
        ])

        await interaction.followUp(res.success(`${icon.success} | Aposta removida com sucesso!`));

        await interaction.editReply(menus.football.matches.matchMenu(bet.match, {
            id: user.id,
            displayAvatarURL: () => user.displayAvatarURL(),
            bets: userBets
        }))
    },
});