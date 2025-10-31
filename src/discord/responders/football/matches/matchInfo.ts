import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { FootballBetType } from "#prisma";
import { createLabel, createModalFields, randomNumber } from "@magicyan/discord";
import { StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import z from "zod";

createResponder({
    customId: "football/match/menu/:page/:matchId/:userId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    parse(params) {
        return {
            page: params.page as "homeStatistics" | "awayStatistics" | "odds" | "bet",
            matchId: BigInt(params.matchId),
            userId: params.userId
        }
    },
    async run(interaction, { matchId, page, userId }) {
        const { user } = interaction;
        if (user.id !== userId) {
            await interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`));
            return;
        }
        if (page === "bet") {
            if (interaction.isButton()) {
                await interaction.showModal({
                    title: "Aposta",
                    customId: `football/match/menu/bet/${matchId}/${userId}`,
                    components: createModalFields(
                        createLabel({
                            label: "Valor",
                            description: "Valor da aposta em stx",
                            component: new TextInputBuilder({
                                customId: "amount",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Digite aqui quantos stx quer apostar (ex: 200)"
                            })
                        }),
                        createLabel({
                            label: "O que apostar",
                            description: "O que quer apostar?",
                            component: new StringSelectMenuBuilder({
                                customId: "target",
                                placeholder: "Escolha o que quer apostar",
                                required: true,
                                options: [
                                    { label: "Vitória da casa", value: "homeWin" },
                                    { label: "Empate", value: "draw" },
                                    { label: "Vitória do visitante", value: "awayWin" },
                                    { label: "Placar exato", value: "exactGoals" },
                                    { label: "Quantidade de gols da partida", value: "goals" },
                                    { label: "Gols do mandante", value: "homeGoals" },
                                    { label: "Gols do visitante", value: "awayGoals" },
                                    { label: "Cartões amarelos", value: "yellowCards" },
                                    { label: "Cartões vermelhos", value: "redCards" }
                                ]
                            })
                        }),
                        createLabel({
                            label: "Quantidade",
                            description: "Não aplicar caso tenha selecionado Vitória da casa, visitante ou empate",
                            component: new TextInputBuilder({
                                customId: "quantity",
                                style: TextInputStyle.Short,
                                required: false,
                                placeholder: "Ex se tiver selecionado gols: (+3), (+3.5)",
                            })
                        })
                    )
                })
                return;
            } else {
                const amount = interaction.fields.getTextInputValue("amount");
                const target = interaction.fields.getStringSelectValues("target")[0];
                const quantity = interaction.fields.getTextInputValue("quantity");

                const dataSchema = z.object({
                    amount: z.coerce.number("Você precisa informar um valor de aposta válido")
                        .min(10, "Você precisa informar um valor de aposta maior que 10"),
                    target: z.enum(["homeWin", "draw", "awayWin", "exactGoals", "goals", "homeGoals", "awayGoals", "yellowCards", "redCards"], "Você precisa informar um alvo válido"),
                    quantity: z.string().optional()
                }).refine((data) => {
                    // Validação 1: quantity obrigatório para targets específicos
                    if (!["homeWin", "awayWin", "draw"].includes(data.target)) {
                        return data.quantity !== undefined && data.quantity !== "";
                    }
                    return true;
                }, {
                    message: "Quantidade é obrigatória para este tipo de aposta",
                    path: ["quantity"]
                }).refine((data) => {
                    // Validação 2: formato específico para exactGoals
                    if (data.target === "exactGoals" && data.quantity) {
                        const quantityRegex = /^\d+[-:\s]\d+$/;
                        if (!quantityRegex.test(data.quantity)) return false;

                        const [first, second] = data.quantity.split(/[-:\s]/);
                        const num1 = parseInt(first);
                        const num2 = parseInt(second);

                        return !isNaN(num1) && !isNaN(num2) && num1 >= 0 && num2 >= 0 &&
                            Number.isInteger(num1) && Number.isInteger(num2);
                    }
                    return true;
                }, {
                    message: "Para placar exato, use o formato: 0-1, 0:1 ou 0 1 (apenas números positivos inteiros)",
                    path: ["quantity"]
                }).refine((data) => {
                    // Validação 3: quantity como número para outros targets
                    if (data.quantity && data.target !== "exactGoals" && !["homeWin", "awayWin", "draw"].includes(data.target)) {
                        const quantityNum = Number(data.quantity);
                        return !isNaN(quantityNum) && quantityNum >= 0;
                    }
                    return true;
                }, {
                    message: "Você precisa informar uma quantidade válida maior ou igual a 0",
                    path: ["quantity"]
                });

                const { success, data, error } = dataSchema.safeParse({ amount, target, quantity });

                if (!success) {
                    await interaction.reply(res.danger(`${icon.error} | ${error.issues.map(i => `**\`${i.message}\`**`).join(", ")}`));
                    return
                }

                const typeFormated: Record<string, FootballBetType> = {
                    homeWin: "HOME_WIN",
                    draw: "DRAW",
                    awayWin: "AWAY_WIN",
                    exactGoals: "EXACT_GOALS",
                    goals: "GOALS",
                    homeGoals: "HOME_GOALS",
                    awayGoals: "AWAY_GOALS",
                    yellowCards: "YELLOW_CARDS",
                    redCards: "RED_CARDS"
                }

                await interaction.deferReply();

                const [match, user] = await prisma.$transaction([
                    prisma.footballMatch.findUnique({
                        where: {
                            id: matchId
                        },
                        select: {
                            oddsDraw: true,
                            oddsAwayWin: true,
                            oddsHomeWin: true,
                            homeTeam: {
                                select: {
                                    name: true
                                }
                            },
                            awayTeam: {
                                select: {
                                    name: true
                                }
                            },
                            competition: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }),
                    prisma.user.upsert({
                        where: {
                            id: userId
                        },
                        create: { id: userId },
                        update: {}
                    })
                ])

                if (user.money.toNumber() < data.amount) {
                    await interaction.editReply(resv2.danger(`${icon.error} | Você não tem esse valor para apostar! Você precisa de mais **${data.amount - user.money.toNumber()}** stx para apostar essa quantia`))
                    return;
                }

                if (!match) {
                    await interaction.editReply(resv2.danger(`${icon.error} | Eu não consegui achar essa partida!`));
                    return;
                }

                if (data.target === "awayGoals" || data.target === "homeGoals" || data.target === "draw") {
                    await prisma.$transaction([
                        prisma.footballBet.upsert({
                            where: {
                                type_userId_matchId: {
                                    matchId,
                                    userId: interaction.user.id,
                                    type: typeFormated[data.target]
                                }
                            },
                            create: {
                                amount: data.amount,
                                type: typeFormated[data.target],
                                matchId, userId,
                                odds: (data.target === "awayGoals" ?
                                    match.oddsAwayWin
                                    : data.target === "homeGoals" ?
                                        match.oddsHomeWin
                                        : match.oddsDraw ? match.oddsDraw : 2) || 2,
                            },
                            update: {
                                amount: data.amount,
                                odds: (data.target === "awayGoals" ?
                                    match.oddsAwayWin
                                    : data.target === "homeGoals" ?
                                        match.oddsHomeWin
                                        : match.oddsDraw) || 2
                            }
                        }),
                        prisma.user.update({
                            where: {
                                id: userId
                            },
                            data: {
                                money: { decrement: data.amount }
                            }
                        })
                    ])

                    await interaction.editReply(resv2.success(`${icon.success} | Você apostou **${data.amount}** no jogo: **${match.homeTeam.name}** x **${match.awayTeam.name}** da competição: **${match.competition.name}**`));
                } else {
                    await prisma.$transaction([
                        prisma.footballBet.upsert({
                            where: {
                                type_userId_matchId: {
                                    matchId,
                                    userId: interaction.user.id,
                                    type: typeFormated[data.target]
                                }
                            },
                            create: {
                                amount: data.amount,
                                type: typeFormated[data.target],
                                matchId, userId,
                                odds: randomNumber(1, 5),
                                quantity: data.quantity
                            },
                            update: {
                                amount: data.amount,
                                odds: randomNumber(1, 5),
                                quantity: data.quantity
                            }
                        }),
                        prisma.user.update({
                            where: {
                                id: userId
                            },
                            data: {
                                money: { decrement: data.amount }
                            }
                        })
                    ])

                    await interaction.editReply(resv2.success(`${icon.success} | Você apostou **${data.amount}** no jogo: **${match.homeTeam.name}** x **${match.awayTeam.name}** da competição: **${match.competition.name}**`));
                }
                return;
            }
        }
        if (!interaction.isButton()) return;
        await interaction.deferUpdate();
        const match = await prisma.footballMatch.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                competition: true
            }
        });

        if (!match) {
            await interaction.editReply(res.danger(`${icon.error} | Partida não encontrada.`));
            return;
        }

        await interaction.editReply(menus.football.matches.matchMenu(match, userId, interaction.user.displayAvatarURL(), page));
        return;
    }
});
