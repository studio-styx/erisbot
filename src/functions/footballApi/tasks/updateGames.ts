import { prisma } from "#database";
import { footballSdk } from "#tools";
import { brBuilder } from "@magicyan/discord";
import { registerGame } from "./registerGames.js";
import { FootballMatch, Prisma } from "#prisma";
import { Client, time } from "discord.js";
import { menus } from "#menus";
import { res } from "#functions";

export async function verifyIfHasGames() {
    const matches = await prisma.footballMatch.count({
        where: {
            startAt: {
                lte: new Date()
            },
            status: {
                notIn: ["CANCELED", "FINISHED"]
            }
        }
    });

    return matches > 0;
}

export async function updateGames(client: Client): Promise<{
    matchesUpdated: FootballMatch[],
    matchesNotUpdated: FootballMatch[]
}> {
    // Pegar todos os jogos da db que estão ao vivo ou ainda não começaram
    const matches = await prisma.footballMatch.findMany({
        where: {
            startAt: {
                lte: new Date()
            },
            status: {
                notIn: ["CANCELED", "FINISHED"]
            }
        }
    });

    if (matches.length === 0) return {
        matchesUpdated: [],
        matchesNotUpdated: []
    };

    // Pegar todas as partidas ocorrendo, posteriomente ignorar as partidas da db que não foram retornadas nessa rota
    const apiMatches = await footballSdk.matches.getTodayGames();

    const matchesUpdated: FootballMatch[] = [];

    for (const match of apiMatches.matches) {
        console.log(`Atualizando partida entre ${match.homeTeam.name} ${match.score?.fullTime?.home} x ${match.score?.fullTime?.away} ${match.awayTeam.name}`)
        const dbGame = matches.find((m => m.apiId === match.id));
        
        if (!dbGame) {
            console.log("Partida não encontrada na db preparada")
            const game = await prisma.footballMatch.findUnique({
                where: {
                    apiId: match.id
                },
            });

            if (game) continue;
            console.log("Partida não existe, criando ela")
            await prisma.$transaction(async (tx) => {
                await registerGame(tx, match);
            }, { timeout: 120_000 });
            continue;
        }

        console.log("API MATCH", { id: match.id, status: match.status, fullTime: match.score.fullTime });
        console.log("DB MATCH ", { id: dbGame.id, status: dbGame.status });

        await prisma.footballMatch.update({
            where: {
                apiId: match.id
            },
            data: {
                goalsHome: match.score.fullTime.home,
                goalsAway: match.score.fullTime.away,
                status: match.status === "TIMED" ? "SCHEDULED" : match.status,
                startAt: match.utcDate,
            }
        });

        matchesUpdated.push(dbGame);

        if (match.status === "FINISHED") {
            if (match.score.fullTime.home === null || match.score.fullTime.away === null) {
                await handleInvalidScore(client, match, dbGame);
                continue;
            }
            try {
                const bets = await prisma.footballBet.findMany({
                    where: {
                        matchId: dbGame.id,
                        status: "PENDING"
                    },
                });

                const homeGoals = match.score.fullTime.home;
                const awayGoals = match.score.fullTime.away;

                const homeWin = homeGoals > awayGoals;
                const draw = homeGoals === awayGoals;
                const awayWin = homeGoals < awayGoals;

                const teamPointsDistribuction: Record<string, number> = {
                    win: 5,
                    draw: 3,
                    lose: 2, // negativo
                    manyGoalsScored: 8,
                    manyGoalsSuffered: 5, // negativo
                }

                const playerPointsDistribuction: Record<string, number> = {
                    pointsPerGoal: 2,
                    pointsPerOwnGoal: 3, // negativo
                    pointerPerAssist: 1
                }

                const goals = match.goals;

                if (goals) {
                    for (const goal of goals) {
                        try {
                            await prisma.footballPlayer.update({
                                where: {
                                    apiId: goal.scorer.id
                                },
                                data: {
                                    points: goal.type === "OWN_GOAL" ? {
                                        decrement: playerPointsDistribuction.pointsPerOwnGoal
                                    } : {
                                        increment: playerPointsDistribuction.pointsPerGoal
                                    }
                                }
                            });
                            if (goal.assist) {
                                await prisma.footballPlayer.update({
                                    where: {
                                        apiId: goal.assist.id
                                    },
                                    data: {
                                        points: {
                                            increment: playerPointsDistribuction.pointerPerAssist
                                        }
                                    }
                                });
                            }
                        } catch (e) {
                            console.error(e);
                            continue;
                        }
                    }
                }

                let homeTeamPoints = 0;
                let awayTeamPoints = 0;

                if (homeWin) {
                    homeTeamPoints += teamPointsDistribuction.win;
                    awayTeamPoints -= teamPointsDistribuction.lose;
                } else if (draw) {
                    homeTeamPoints += teamPointsDistribuction.draw;
                    awayTeamPoints += teamPointsDistribuction.draw;
                } else {
                    homeTeamPoints -= teamPointsDistribuction.lose;
                    awayTeamPoints += teamPointsDistribuction.win;
                }

                // calcular se a diferença de gols é maior que 4
                if (Math.abs(homeGoals - awayGoals) >= 4) {
                    if (homeGoals > awayGoals) {
                        homeTeamPoints += teamPointsDistribuction.manyGoalsScored;
                        awayTeamPoints -= teamPointsDistribuction.manyGoalsSuffered;
                    } else {
                        homeTeamPoints -= teamPointsDistribuction.manyGoalsSuffered;
                        awayTeamPoints += teamPointsDistribuction.manyGoalsScored;
                    }
                }

                await prisma.$transaction([
                    prisma.footballTeam.update({
                        where: {
                            id: dbGame.homeTeamId
                        },
                        data: {
                            points: {
                                increment: homeTeamPoints
                            }
                        }
                    }),
                    prisma.footballTeam.update({
                        where: {
                            id: dbGame.awayTeamId
                        },
                        data: {
                            points: {
                                increment: awayTeamPoints
                            }
                        }
                    })
                ])

                for (const bet of bets) {
                    try {
                        let won = false;
                        let winAmount = new Prisma.Decimal(0);
                        let resultMessage = "";
                        let tags: string[] = ["football", "bet"];

                        switch (bet.type) {
                            case "HOME_WIN": {
                                won = homeWin;
                                tags.push("homeWin");
                                resultMessage = won
                                    ? `Você apostou na vitória do **${match.homeTeam.name}** e ganhou!`
                                    : `Você apostou na vitória do **${match.homeTeam.name}**, mas o time não venceu.`;
                                break;
                            }

                            case "DRAW": {
                                won = draw;
                                tags.push("draw");
                                resultMessage = won
                                    ? `Você apostou no empate e acertou!`
                                    : `Você apostou no empate, mas o jogo teve um vencedor.`;
                                break;
                            }

                            case "AWAY_WIN": {
                                won = awayWin;
                                tags.push("awayWin");
                                resultMessage = won
                                    ? `Você apostou na vitória do **${match.awayTeam.name}** e ganhou!`
                                    : `Você apostou na vitória do **${match.awayTeam.name}**, mas o time não venceu.`;
                                break;
                            }

                            case "EXACT_GOALS": {
                                if (!bet.quantity) {
                                    console.warn(`Aposta EXACT_GOALS sem quantity: ${bet.id}`);
                                    continue;
                                }

                                // Normaliza formatos: "0-1", "0:1", "0 1" → [0, 1]
                                const normalized = bet.quantity
                                    .replace(/:/g, '-')
                                    .replace(/\s+/g, '-')
                                    .trim();
                                const [hStr, aStr] = normalized.split('-');
                                const h = parseInt(hStr, 10);
                                const a = parseInt(aStr, 10);

                                if (isNaN(h) || isNaN(a)) {
                                    console.warn(`Formato inválido em EXACT_GOALS: ${bet.quantity}`);
                                    continue;
                                }

                                won = h === homeGoals && a === awayGoals;
                                tags.push("exactGoals");
                                resultMessage = won
                                    ? `Você acertou o placar exato: **${h} x ${a}**!`
                                    : `Você apostou no placar **${h} x ${a}**, mas o resultado foi **${homeGoals} x ${awayGoals}**.`;
                                break;
                            }

                            case "GOALS_HOME": {
                                if (!bet.quantity) {
                                    console.warn(`Aposta GOALS_HOME sem quantity: ${bet.id}`);
                                    continue;
                                }

                                const value = parseFloat(bet.quantity);
                                if (isNaN(value)) {
                                    console.warn(`Valor inválido em GOALS_HOME: ${bet.quantity}`);
                                    continue;
                                }

                                if (value >= 0) {
                                    // Over: ex: 2.5 → mais de 2.5 gols do mandante
                                    won = homeGoals > Math.floor(value);
                                } else {
                                    // Under: ex: -1.5 → menos de 1.5 gols (ou seja, 1 ou menos)
                                    won = homeGoals < Math.abs(value);
                                }

                                tags.push("goalsHome");
                                const overUnder = value >= 0 ? "mais de" : "menos de";
                                const displayValue = value >= 0 ? value : Math.abs(value);
                                resultMessage = won
                                    ? `Você acertou: **${match.homeTeam.name}** marcou ${overUnder} **${displayValue}** gol(s).`
                                    : `Você errou: **${match.homeTeam.name}** marcou **${homeGoals}** gol(s).`;
                                break;
                            }

                            case "GOALS_AWAY": {
                                if (!bet.quantity) {
                                    console.warn(`Aposta GOALS_AWAY sem quantity: ${bet.id}`);
                                    continue;
                                }

                                const value = parseFloat(bet.quantity);
                                if (isNaN(value)) {
                                    console.warn(`Valor inválido em GOALS_AWAY: ${bet.quantity}`);
                                    continue;
                                }

                                if (value >= 0) {
                                    won = awayGoals > Math.floor(value);
                                } else {
                                    won = awayGoals < Math.abs(value);
                                }

                                tags.push("goalsAway");
                                const overUnder = value >= 0 ? "mais de" : "menos de";
                                const displayValue = value >= 0 ? value : Math.abs(value);
                                resultMessage = won
                                    ? `Você acertou: **${match.awayTeam.name}** marcou ${overUnder} **${displayValue}** gol(s).`
                                    : `Você errou: **${match.awayTeam.name}** marcou **${awayGoals}** gol(s).`;
                                break;
                            }

                            default:
                                console.warn(`Tipo de aposta desconhecido: ${bet.type}`);
                                continue;
                        }

                        // Calcula ganho apenas se ganhou
                        if (won) {
                            winAmount = new Prisma.Decimal(bet.amount.toNumber() * bet.odds.toNumber());
                        }

                        // Monta conteúdo da notificação
                        const baseContent = [
                            won ? `## Resultado positivo da aposta` : `## Resultado negativo da aposta`,
                            `Jogo: **${match.homeTeam.name} ${homeGoals} x ${awayGoals} ${match.awayTeam.name}**`,
                            `Competição: **${match.competition.name}**`,
                            `Você apostou: **${bet.amount.toFixed(2)}**`,
                            `Em: ${bet.type}: ${bet.quantity ?? ""}`,
                            resultMessage
                        ];

                        if (won) {
                            baseContent.push(`Você ganhou: **${winAmount.toFixed(2)}**!`);
                        } else {
                            baseContent.push(`Você perdeu a aposta.`);
                        }

                        // Cria transação: atualiza usuário (se ganhou) + cria mail
                        const [user, mail] = await prisma.$transaction([
                            won
                                ? prisma.user.update({
                                    where: { id: bet.userId },
                                    data: { money: { increment: winAmount } },
                                    include: { mails: true }
                                })
                                : prisma.user.findUniqueOrThrow({
                                    where: { id: bet.userId },
                                    include: { mails: true }
                                }),
                            prisma.mails.create({
                                data: {
                                    content: brBuilder(...baseContent),
                                    userId: bet.userId,
                                    tags
                                }
                            }),
                            prisma.footballBet.update({
                                where: {
                                    id: bet.id
                                },
                                data: {
                                    status: won ? "WON" : "LOST"
                                }
                            })
                        ]);

                        // Envia DM no Discord se habilitado
                        if (user.dmNotification) {
                            try {
                                const discordUser = client.users.cache.get(user.id) || await client.users.fetch(user.id);
                                await discordUser.send(menus.mails.userMails([mail, ...user.mails], user, 0));
                            } catch (_) {
                                // Silencia erro de DM
                            }
                        }

                    } catch (error) {
                        console.error(`Erro ao processar aposta ${bet.id}:`, error);
                    }
                }
            } catch (e) {
                console.error(e);
                const bets = await prisma.footballBet.findMany({
                    where: {
                        matchId: dbGame.id,
                        status: {
                            not: "CANCELED"
                        }
                    },
                });

                for (const bet of bets) {
                    const [user, mail] = await prisma.$transaction([
                        prisma.user.update({
                            where: { id: bet.userId },
                            data: { money: { increment: bet.amount } },
                            include: { mails: true }
                        }),
                        prisma.mails.create({
                            data: {
                                content: `Ocorreu um erro ao processar sua aposta no jogo: **${match.homeTeam.name}** ${match.score.fullTime.home} x ${match.score.fullTime.away} **${match.awayTeam.name}**., por isso você recebeu de volta o valor apostado: **${bet.amount.toNumber()}**`,
                                userId: bet.userId,
                                tags: ["football", "bet", "error"]
                            }
                        }),
                        prisma.footballBet.update({
                            where: {
                                id: bet.id
                            },
                            data: {
                                status: "CANCELED"
                            }
                        })
                    ]);

                    // Envia DM no Discord se habilitado
                    if (user.dmNotification) {
                        try {
                            const discordUser = client.users.cache.get(user.id) || await client.users.fetch(user.id);
                            await discordUser.send(menus.mails.userMails([mail, ...user.mails], user, 0));
                        } catch (_) {
                            // Silencia erro de DM
                        }
                    }
                }
            }

            try {
                const guild = client.guilds.cache.get("1395383469210865694");
                if (guild) {
                    const channel = guild.channels.cache.get("1435395562789928990") || await guild.channels.fetch("1435395562789928990");
                    if (channel && channel.isTextBased()) {
                        await channel.send(res.success(brBuilder(
                            `Atualizando o fim da partida: **${match.homeTeam.name}** ${match.score.fullTime.home} x ${match.score.fullTime.away} ${match.awayTeam.name}`,
                            `Dados da partida:`,
                            `**${match.homeTeam.name}**: ${match.score.fullTime.home}`,
                            `**${match.awayTeam.name}**: ${match.score.fullTime.away}`,
                            `**Horário de inicio da partida:** ${time(new Date(match.utcDate), "F")}`,
                            `**Horário de término da partida:** ${time(new Date(), "F")}`,
                            `**Status na api:** ${match.status}`,
                            `**Status na db:** ${dbGame.status}`,
                        )))
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    const matchesNotUpdated = matches.filter(m => !matchesUpdated.some(m2 => m2.id === m.id));

    /*
    for (const match of matchesNotUpdated) {
        // serão poucos os jogos que não foram atualizados, e já tem o sistema de anti many request na requisição
        // então é seguro
        const matchInfo = await footballSdk.matches.get(match.apiId);

        await prisma.footballMatch.update({
            where: {
                id: match.id
            },
            data: {
                goalsHome: matchInfo.score.fullTime.home,
                goalsAway: matchInfo.score.fullTime.away,
                status: matchInfo.status === "TIMED" ? "FINISHED" : matchInfo.status,
                startAt: matchInfo.utcDate,
            }
        });
    }
        */

    return {
        matchesUpdated,
        matchesNotUpdated
    }
}

async function handleInvalidScore(client: Client, apiMatch: any, dbMatch: FootballMatch) {
    console.warn(`Placar nulo em partida FINISHED (apiId ${apiMatch.id})`);

    try {
        const guild = client.guilds.cache.get("1395383469210865694");
        if (!guild) return;

        const channel = guild.channels.cache.get("1431993706625368235")
            ?? await guild.channels.fetch("1431993706625368235");
        if (!channel?.isTextBased()) return;

        await channel.send(res.danger(brBuilder(
            `Partida: **${apiMatch.homeTeam.name}** ${apiMatch.score.fullTime.home} x ${apiMatch.score.fullTime.away} ${apiMatch.awayTeam.name}`,
            `Status FINISHED mas placar nulo`,
            `Início: ${time(new Date(apiMatch.utcDate), "F")}`,
            `API: ${apiMatch.status} | DB: ${dbMatch.status}`
        )));

        await prisma.footballMatch.update({
            where: { id: dbMatch.id },
            data: { status: "IN_PLAY" }
        });
    } catch (e) {
        console.error("Erro ao tratar placar nulo:", e instanceof Error ? e.stack : e);
    }
}