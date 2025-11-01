import { prisma } from "#database";
import { footballSdk } from "#tools";
import { brBuilder } from "@magicyan/discord";
import { registerGame } from "./registerGames.js";
import { Prisma } from "#prisma";
import { Client } from "discord.js";
import { menus } from "#menus";

export async function verifyIfHasGames() {
    const matches = await prisma.footballMatch.count({
        where: {
            startAt: {
                lte: new Date()
            },
            status: {
                notIn: ["CANCELED", "POSTPONED", "SUSPENDED", "FINISHED"]
            }
        }
    });

    return matches > 0;
}

export async function updateGames(client: Client) {
    // Pegar todos os jogos da db que estão ao vivo ou ainda não começaram
    const matches = await prisma.footballMatch.findMany({
        where: {
            startAt: {
                lte: new Date()
            },
            status: {
                notIn: ["CANCELED", "POSTPONED", "SUSPENDED", "FINISHED"]
            }
        }
    });

    if (matches.length === 0) return;

    const oldestMatch = matches.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0];
    const newestMatch = matches.sort((a, b) => b.startAt.getTime() - a.startAt.getTime())[0];

    const dateFrom = oldestMatch ? new Date(oldestMatch.startAt.getTime() - 1000 * 60 * 10) : new Date();
    const dateTo = newestMatch ? new Date(newestMatch.startAt.getTime() + 1000 * 60 * 10) : new Date();

    // Pegar todas as partidas ocorrendo, posteriomente ignorar as partidas da db que não foram retornadas nessa rota
    const apiMatches = await footballSdk.matches.getMany({
        dateFrom, dateTo,
        status: "IN_PLAY"
    });

    for (const match of apiMatches.matches) {
        const dbGame = matches.find((m => m.apiId === match.id));
        if (!dbGame) {
            await prisma.$transaction(async (tx) => {
                await registerGame(tx, match);
            }, { timeout: 120_000 });
            return;
        }

        await prisma.footballMatch.update({
            where: {
                apiId: match.id
            },
            data: {
                goalsHome: match.score.fullTime.home,
                goalsAway: match.score.fullTime.away,
                status: match.status,
                startAt: match.utcDate,
            }
        });

        if (match.status === "FINISHED") {
            const bets = await prisma.footballBet.findMany({
                where: {
                    matchId: dbGame.id
                },
            });

            const homeGoals = match.score.fullTime.home;
            const awayGoals = match.score.fullTime.away;

            const homeWin = homeGoals > awayGoals;
            const draw = homeGoals === awayGoals;
            const awayWin = homeGoals < awayGoals;

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
                                tags: tags
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
        }
    }
}