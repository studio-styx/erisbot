import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { ErisError, icon, res } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "football/bet/remove/:betId/:userId/:menu",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            betId: BigInt(params.betId),
            userId: params.userId,
            menu: params.menu as "match" | "bet"
        }
    },
    async run(interaction, { betId, userId, menu }) {
        const { user } = interaction;

        if (user.id !== userId) throw new ErisError(`Boa tentativa, mas você não pode excluir a aposta de outros usuários!`)

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

        if (!bet) throw new ErisError("Eu não consegui encontrar essa aposta!")

        if (bet.match.startAt < new Date()) throw new ErisError(`Não é possível remover uma aposta de uma partida que ${bet.match.status === "IN_PLAY" ? "está em andamento" : "que já terminou"}!`)

        const [userData] = await prisma.$transaction([
            prisma.user.upsert({
                where: {
                    id: userId
                },
                include: {
                    bets: {
                        where: {
                            matchId: bet.matchId,
                            status: {
                                not: "CANCELED"
                            },
                            id: {
                                not: betId
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
                        orderBy: [
                            {
                                match: {
                                    startAt: "asc"
                                }
                            },
                            {
                                createdAt: "desc"
                            }
                        ]
                    }
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
            prisma.footballBet.update({
                where: {
                    id: betId
                },
                data: {
                    status: "CANCELED"
                }
            })
        ])

        await interaction.followUp(res.success(`${icon.success} | Aposta removida com sucesso! com isso, o valor de **${bet.amount}** stx foi retornando na sua conta!`));

        if (menu === "bet")
            await interaction.editReply(menus.football.bets.betsMenu(userData.bets));
        else
            await interaction.editReply(menus.football.matches.matchMenu(bet.match, {
                id: user.id,
                displayAvatarURL: user.displayAvatarURL,
                bets: userData.bets
            }))
    },
});