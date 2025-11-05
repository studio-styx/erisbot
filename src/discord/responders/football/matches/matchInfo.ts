import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { ErisError, icon, res, resv2, simulateMatchResultWithIa } from "#functions";
import { menus } from "#menus";
import { FootballBetType, FootballBet } from "#prisma";
import { createLabel, createModalFields } from "@magicyan/discord";
import { StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import z, { ZodError } from "zod";

const simulateMatchCooldown = new Store<Date>();

createResponder({
    customId: "football/match/menu/:page/:matchId/:userId",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    parse(params) {
        return {
            page: params.page as "bet" | "simulate" | "reload",
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
        switch (page) {
            case "bet": {
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
                                        { label: "Gols do mandante", value: "homeGoals" },
                                        { label: "Gols do visitante", value: "awayGoals" },
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
                        amount: z.coerce
                            .number("Você precisa informar um valor de aposta válido")
                            .min(10, "Você precisa informar um valor de aposta maior que 10"),

                        target: z.enum(
                            ["homeWin", "draw", "awayWin", "exactGoals", "goals", "homeGoals", "awayGoals"],
                            { message: "Você precisa informar um alvo válido" }
                        ),

                        quantity: z.string().optional()
                    })
                        .refine((data) => {
                            // Validação 1: quantity obrigatório para targets específicos
                            if (!["homeWin", "awayWin", "draw"].includes(data.target)) {
                                return !!data.quantity && data.quantity.trim() !== "";
                            }
                            return true;
                        }, {
                            message: "Quantidade é obrigatória para este tipo de aposta",
                            path: ["quantity"]
                        })
                        .refine((data) => {
                            // Validação 2: formato específico para exactGoals
                            if (data.target === "exactGoals" && data.quantity) {
                                const quantityRegex = /^\d+[-:\s]\d+$/;
                                if (!quantityRegex.test(data.quantity)) return false;

                                const [first, second] = data.quantity.split(/[-:\s]/);
                                const num1 = parseInt(first, 10);
                                const num2 = parseInt(second, 10);

                                return !isNaN(num1) && !isNaN(num2) &&
                                    num1 >= 0 && num2 >= 0 &&
                                    Number.isInteger(num1) && Number.isInteger(num2);
                            }
                            return true;
                        }, {
                            message: "Para placar exato, use o formato: 0-1, 0:1 ou 0 1 (apenas números positivos inteiros)",
                            path: ["quantity"]
                        })
                        .refine((data) => {
                            // Validação 3: quantity como número válido (inteiro ou .5) para outros targets
                            if (data.quantity && data.target !== "exactGoals" && !["homeWin", "awayWin", "draw"].includes(data.target)) {
                                const quantityNum = parseFloat(data.quantity);

                                // Se não for número → inválido
                                if (isNaN(quantityNum)) return false;

                                // Aceita: inteiro positivo/negativo OU múltiplo de 0.5 (ex: 2.5, -1.5)
                                const isInteger = Number.isInteger(quantityNum);
                                const isHalf = Math.abs(quantityNum % 0.5) < Number.EPSILON;

                                return isInteger || isHalf;
                            }
                            return true;
                        }, {
                            message: "Você precisa informar uma quantidade válida: inteiro (ex: 2) ou com meia (ex: 2.5, -1.5)",
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
                        homeGoals: "GOALS_HOME",
                        awayGoals: "GOALS_AWAY",
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
                                        name: true,
                                        points: true
                                    }
                                },
                                awayTeam: {
                                    select: {
                                        name: true,
                                        points: true
                                    }
                                },
                                competition: {
                                    select: {
                                        name: true
                                    }
                                },
                                startAt: true
                            }
                        }),
                        prisma.user.upsert({
                            where: {
                                id: userId
                            },
                            create: { id: userId },
                            update: {},
                            include: {
                                bets: true
                            }
                        })
                    ])

                    if (!user.acceptedFootballTermsAt) {
                        await interaction.editReply(menus.football.terms(user.id));
                        await interaction.message.edit(resv2.danger(`${icon.denied} | Aceite os termos para começar`))
                        return;
                    }

                    if (user.money.toNumber() < data.amount) throw new ErisError(`Você não tem esse valor para apostar! Você precisa de mais **${data.amount - user.money.toNumber()}** stx para apostar essa quantia`);

                    if (!match) throw new ErisError("Eu não consegui achar essa partida!");

                    if (match.startAt < new Date()) throw new ErisError("Você não pode apostar em uma partida que já começou!");

                    type CreatedBet = {
                        action: "CREATED" | "UPDATED",
                        data: FootballBet
                    }

                    let createdBet: CreatedBet | null;

                    if (["awayWin", "homeWin", "draw"].includes(data.target)) {
                        const targetType = typeFormated[data.target]; // Ex: "AWAY_WIN"
                        const betMap = {
                            awayWin: "AWAY_WIN",
                            homeWin: "HOME_WIN",
                            draw: "DRAW"
                        };

                        const conflicts = {
                            AWAY_WIN: ["HOME_WIN", "DRAW"],
                            HOME_WIN: ["AWAY_WIN", "DRAW"],
                            DRAW: ["AWAY_WIN", "HOME_WIN"]
                        };

                        const teamNames = {
                            AWAY_WIN: match.awayTeam.name,
                            HOME_WIN: match.homeTeam.name,
                            DRAW: "empate"
                        };

                        const currentBetType = betMap[data.target as "awayWin" | "homeWin" | "draw"] as "AWAY_WIN" | "HOME_WIN" | "DRAW";
                        const conflictingTypes = conflicts[currentBetType];

                        // Verifica se já existe aposta em qualquer tipo conflitante
                        const existingConflict = user.bets.find(b =>
                            conflictingTypes.includes(b.type) && b.matchId === matchId
                        );

                        if (existingConflict) {
                            const targetName = data.target === "awayWin" ? "time de fora" : data.target === "homeWin" ? "time de casa" : "empate";
                            const conflictName = existingConflict.type === "AWAY_WIN" ? "time de fora" :
                                existingConflict.type === "HOME_WIN" ? "time de casa" : "empate";

                            throw new ErisError(`Você não pode apostar no **${targetName}**! ` +
                                `Você já apostou no **${conflictName}**, remova essa aposta para continuar.`);
                        }

                        const totalPoints = match.homeTeam.points + match.awayTeam.points || 1;
                        const homeStrength = match.homeTeam.points / totalPoints;
                        const awayStrength = match.awayTeam.points / totalPoints;

                        function calcOdd(strength: number) {
                            // odds básicas entre 1.2 e 8
                            const minOdd = 1.2;
                            const maxOdd = 8;
                            // inverter probabilidade (quanto menor a força, maior a odd)
                            const odd = 1 / Math.max(strength, 0.05); // evita divisão por 0
                            // normalizar para os limites
                            return Math.min(Math.max(odd, minOdd), maxOdd);
                        }

                        const fallbackHomeWinOdd = calcOdd(homeStrength);
                        const fallbackAwayWinOdd = calcOdd(awayStrength);
                        const fallbackDrawOdd = Math.min((fallbackHomeWinOdd + fallbackAwayWinOdd) / 2, 5);

                        const odds = data.target === "awayWin"
                            ? match.oddsAwayWin ?? fallbackAwayWinOdd
                            : data.target === "homeWin"
                                ? match.oddsHomeWin ?? fallbackHomeWinOdd
                                : match.oddsDraw ?? fallbackDrawOdd;

                        const alreadyExistis = await prisma.footballBet.findUnique({
                            where: {
                                type_userId_matchId: {
                                    matchId,
                                    userId: interaction.user.id,
                                    type: targetType
                                }
                            }
                        });

                        // Prossegue com a aposta
                        const [bet] = await prisma.$transaction([
                            prisma.footballBet.upsert({
                                where: {
                                    type_userId_matchId: {
                                        matchId,
                                        userId: interaction.user.id,
                                        type: targetType
                                    }
                                },
                                create: {
                                    amount: data.amount,
                                    type: targetType,
                                    matchId,
                                    userId: interaction.user.id,
                                    odds
                                },
                                update: {
                                    amount: data.amount,
                                    odds: (data.target === "awayWin" ? match.oddsAwayWin :
                                        data.target === "homeWin" ? match.oddsHomeWin :
                                            match.oddsDraw || 2) || 2
                                }
                            }),
                            prisma.user.update({
                                where: { id: interaction.user.id },
                                data: { money: { decrement: data.amount } }
                            })
                        ]);

                        createdBet = {
                            action: alreadyExistis ? "UPDATED" : "CREATED",
                            data: bet
                        }

                        await interaction.editReply(resv2.success(
                            `${icon.success} | Você apostou **${data.amount}** stx no jogo: ` +
                            `**${teamNames.HOME_WIN}** x **${teamNames.AWAY_WIN}** ` +
                            `da competição: **${match.competition.name}**`
                        ));
                    } else {
                        function calcOdd(strength: number) {
                            // odds básicas entre 1.2 e 8
                            const minOdd = 1.2;
                            const maxOdd = 8;
                            // inverter probabilidade (quanto menor a força, maior a odd)
                            const odd = 1 / Math.max(strength, 0.05); // evita divisão por 0
                            // normalizar para os limites
                            return Math.min(Math.max(odd, minOdd), maxOdd);
                        }

                        const totalPoints = match.homeTeam.points + match.awayTeam.points || 1;
                        const homeStrength = match.homeTeam.points / totalPoints;
                        const awayStrength = match.awayTeam.points / totalPoints;

                        const fallbackHomeWinOdd = calcOdd(homeStrength);
                        const fallbackAwayWinOdd = calcOdd(awayStrength);
                        const fallbackDrawOdd = Math.min((fallbackHomeWinOdd + fallbackAwayWinOdd) / 2, 5);

                        const odds = data.target === "awayWin"
                            ? match.oddsAwayWin ?? fallbackAwayWinOdd
                            : data.target === "homeWin"
                                ? match.oddsHomeWin ?? fallbackHomeWinOdd
                                : match.oddsDraw ?? fallbackDrawOdd;

                        const alreadyExistis = await prisma.footballBet.findUnique({
                            where: {
                                type_userId_matchId: {
                                    matchId,
                                    userId: interaction.user.id,
                                    type: typeFormated[data.target]
                                }
                            }
                        });

                        const [bet] = await prisma.$transaction([
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
                                    odds,
                                    quantity: data.quantity
                                },
                                update: {
                                    amount: data.amount,
                                    odds,
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

                        createdBet = {
                            action: alreadyExistis ? "UPDATED" : "CREATED",
                            data: bet
                        }

                        await interaction.editReply(resv2.success(`${icon.success} | Você apostou **${data.amount}** stx no jogo: **${match.homeTeam.name}** x **${match.awayTeam.name}** da competição: **${match.competition.name}**`));
                    }

                    const [matchData, userData] = await prisma.$transaction([
                        prisma.footballMatch.findUniqueOrThrow({
                            where: {
                                id: matchId
                            },
                            include: {
                                awayTeam: true,
                                competition: true,
                                homeTeam: true
                            }
                        }),
                        prisma.user.upsert({
                            where: {
                                id: userId
                            },
                            create: { id: userId },
                            update: {},
                            include: {
                                bets: {
                                    where: {
                                        matchId,
                                        status: {
                                            not: "CANCELED"
                                        }
                                    }
                                }
                            }
                        })
                    ])

                    await interaction.message.edit(menus.football.matches.matchMenu(matchData, {
                        bets: userData.bets,
                        id: user.id,
                        displayAvatarURL: interaction.user.displayAvatarURL
                    }));

                    // Registrar log
                    if (!createdBet) return;
                    await prisma.footballBetLog.create({
                        data: {
                            action: createdBet.action,
                            betId: createdBet.data.id,
                            userId: createdBet.data.userId,
                            matchId: createdBet.data.matchId,
                            description: `${createdBet.action === "CREATED" ? "Aposta criada com o valor:" : "Aposta atualizada para o valor:"} **${createdBet.data.amount}** stx`
                        }
                    })
                    return;
                }
            }
            case "simulate": {
                if (!interaction.isButton()) return;

                const cooldown = simulateMatchCooldown.get(interaction.user.id);
                if (cooldown && cooldown > new Date()) throw new ErisError(`${icon.denied} | Você já simulou uma partida recentemente! tente novamente ${time(cooldown, "R")}`, false)

                await interaction.deferReply();

                const user = await prisma.user.upsert({
                    where: {
                        id: userId
                    },
                    create: { id: userId },
                    update: {},
                })

                if (!user.acceptedFootballTermsAt) {
                    await interaction.editReply(menus.football.terms(user.id));
                    await interaction.message.edit(resv2.danger(`${icon.denied} | Aceite os termos para começar`))
                    return;
                }

                const [match] = await prisma.$transaction([
                    prisma.footballMatch.findUnique({
                        where: {
                            id: matchId
                        },
                        include: {
                            awayTeam: {
                                include: {
                                    players: true
                                }
                            },
                            homeTeam: {
                                include: {
                                    players: true
                                }
                            },
                            competition: true,

                        }
                    }),
                    prisma.user.upsert({
                        where: {
                            id: userId
                        },
                        create: { id: userId },
                        update: {}
                    })
                ]);
                
                if (!match) throw new ErisError("Eu não consegui achar essa partida!");

                const cooldownDate = new Date();
                cooldownDate.setMinutes(cooldownDate.getMinutes() + 5);
                simulateMatchCooldown.set(interaction.user.id, cooldownDate, {
                    time: 1000 * 60 * 5
                })

                try {
                    const result = await simulateMatchResultWithIa(match);

                    await interaction.editReply(menus.football.matches.simulatedMatch({
                        match,
                        ...result
                    }, "first"));

                } catch (error) {
                    console.error(error);
                    if (error instanceof ZodError) {
                        const errors = error.issues.map(e => `**\`${e.message}\`**`).join("\n");

                        await interaction.editReply(resv2.danger(`${icon.error} | Ops! parece que a IA retornou informações erradas sobre a partida! \n${errors}`));
                        return;
                    }
                    await interaction.editReply(resv2.danger(`${icon.error} | Ocorreu um erro ao tentar fazer requisição a IA!`));
                    simulateMatchCooldown.delete(interaction.user.id);
                }
                return;
            }
            case "reload": {
                if (!interaction.isButton()) return;
                await interaction.deferUpdate();

                const [match, user] = await prisma.$transaction([
                    prisma.footballMatch.findUnique({
                        where: {
                            id: matchId
                        },
                        include: {
                            awayTeam: true,
                            competition: true,
                            homeTeam: true
                        }
                    }),
                    prisma.user.upsert({
                        where: {
                            id: userId
                        },
                        create: { id: userId },
                        update: {},
                        include: {
                            bets: {
                                where: {
                                    matchId,
                                    status: {
                                        not: "CANCELED"
                                    }
                                }
                            }
                        }
                    })
                ])
                if (!match) throw new ErisError("Não consegui encontrar essa partida!");

                await interaction.editReply(menus.football.matches.matchMenu(match, {
                    bets: user.bets,
                    id: user.id,
                    displayAvatarURL: interaction.user.displayAvatarURL
                }))
                return;
            }
        }
    }
});
