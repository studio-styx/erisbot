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

        if (bet.match.startAt < new Date()) {
            await interaction.followUp(res.danger(`${icon.error} | Não é possível remover uma aposta de uma partida que já começou!`));
            return;
        }

        const [userData] = await prisma.$transaction([
            prisma.user.upsert({
                where: {
                    id: userId
                },
                include: {
                    bets: true
                },
                create: {
                    id: userId
                },
                update: {
                    money: {
                        increment: bet.amount
                    }
                }
            }),
            prisma.footballBet.delete({
                where: {
                    id: betId
                }
            })
        ])

        await interaction.followUp(res.success(`${icon.success} | Aposta removida com sucesso! com isso, o valor de **${bet.amount}** stx foi retornando na sua conta!`));

        await interaction.editReply(menus.football.matches.matchMenu(bet.match, {
            id: user.id,
            displayAvatarURL: () => user.displayAvatarURL(),
            bets: userData.bets
        }))
    },
});