import { prisma } from "#database";
import { Prisma, PrismaClient } from "#prisma";
import { footballSdk } from "#tools";
import { MatchResponse, TeamSide } from "#types/footballData/match.js";
import { ClubResponse } from "#types/footballData/teamInfo.js";
import { AxiosError } from "axios";
import { DefaultArgs } from "../../../../prisma/eris/runtime/library.js";

export async function registerFootballGames() {
    // Pegar os dados da partida
    const response = await footballSdk.matches.getTodayGames();

    const games = response.matches;

    // Dividir em um array dimencional com 10 jogos cada
    const chunkSize = 10;
    const chunks: MatchResponse[][] = [];

    for (let i = 0; i < games.length; i += chunkSize) {
        chunks.push(games.slice(i, i + chunkSize));
    }

    // Dividir em várias transações prismas diferentes
    await Promise.all(chunks.map((chunk, index) => async () => {
        console.log(`Registrando o chunk [${index}/${chunks.length}] com ${chunk.length} jogos`)
        await prisma.$transaction(async (tx) => {
            for (const game of chunk) {
                await registerGame(tx, game);
            }
        })
    }))
}

async function registerGame(tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">, game: MatchResponse) {
    // ==== Registrar a liga ==== //

    // Verificar se a liga já existe
    const league = await tx.footballLeague.findUnique({
        where: {
            apiId: game.competition.id
        }
    });

    // Se a liga não existir, buscar por informações dela na api
    if (!league) {
        const leagueInfo = await footballSdk.competitions.get(game.competition.code).getInfo();

        // Registrar a area
        const area = await prisma.footballArea.upsert({
            where: {
                code: leagueInfo.area.code
            },
            update: {
                name: leagueInfo.area.name,
                code: leagueInfo.area.code,
                flag: leagueInfo.area.flag
            },
            create: {
                id: leagueInfo.area.id,
                name: leagueInfo.area.name,
                code: leagueInfo.area.code,
                flag: leagueInfo.area.flag
            },
        })

        // Registrar a liga
        await prisma.footballLeague.create({
            data: {
                apiId: game.competition.id,
                name: game.competition.name,
                code: game.competition.code,
                type: game.competition.type,
                emblem: game.competition.emblem,
                areaId: area.id
            }
        })
    }

    const registerTeam = async (team: TeamSide) => {
        // procurar por informações na api cuidando com o rate limit baixo
        let response: ClubResponse | undefined;
        try {
            response = await footballSdk.teams.get(team.id).getInfo();
        } catch (e) {
            // Se der erro, verificar se foi por rate limit
            if (e instanceof AxiosError) {
                if (e.response?.status === 429) {
                    // Tentar de novo se foi por rate limit
                    const retry = async (attempts: number = 0) => {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        if (attempts > 70 / 5) {
                            // Se em 70 segundos ainda não conseguir fazer conexão, então abandonar
                            throw new Error("Rate limit exceeded");
                        }
                        try {
                            response = await footballSdk.teams.get(team.id).getInfo();
                        } catch (e) {
                            await retry(attempts++);
                        }
                    }

                    await retry();
                } else {
                    throw e;
                }
            } else {
                throw e;
            }
        }

        await tx.footballTeam.upsert({
            where: {
                apiId: team.id
            },
            create: {
                apiId: team.id,
                name: team.name,
                shortName: team.shortName,
                tla: team.tla,
                crest: team.crest,
                competitions: {
                    connect: {
                        apiId: game.competition.id
                    }
                },
                address: response?.address ?? "Desconhecido",
                clubColors: response?.clubColors ?? "Desconhecido",
                venue: response?.venue ?? "Desconhecido",
                players: {
                    create: response?.squad.map(player => ({
                        name: player.name,
                        apiId: player.id,
                        dateOfBirth: player.dateOfBirth,
                        nationality: player.nationality ?? "Desconhecido",
                        contractStarted: player.contract.start,
                        contractUntil: player.contract.until,
                        firstName: player.firstName,
                        lastName: player.lastName ?? "Desconhecido",
                        position: player.position ?? "Desconhecido",
                        shirtNumber: player.shirtNumber,
                        marketValue: player.marketValue ?? 0
                    })) ?? []
                }
            },
            update: {
                apiId: team.id,
                name: team.name,
                shortName: team.shortName,
                tla: team.tla,
                crest: team.crest,
                competitions: {
                    connect: {
                        apiId: game.competition.id
                    }
                },
                address: response?.address ?? "Desconhecido",
                clubColors: response?.clubColors ?? "Desconhecido",
                venue: response?.venue ?? "Desconhecido",
                players: {
                    upsert: response?.squad.map(player => ({
                        where: { apiId: player.id },
                        create: {
                            name: player.name,
                            apiId: player.id,
                            dateOfBirth: player.dateOfBirth,
                            nationality: player.nationality ?? "Desconhecido",
                            contractStarted: player.contract.start,
                            contractUntil: player.contract.until,
                            firstName: player.firstName,
                            lastName: player.lastName ?? "Desconhecido",
                            position: player.position ?? "Desconhecido",
                            shirtNumber: player.shirtNumber,
                            marketValue: player.marketValue ?? 0
                        },
                        update: {
                            name: player.name,
                            apiId: player.id,
                            dateOfBirth: player.dateOfBirth,
                            nationality: player.nationality ?? "Desconhecido",
                            contractStarted: player.contract.start,
                            contractUntil: player.contract.until,
                            firstName: player.firstName,
                            lastName: player.lastName ?? "Desconhecido",
                            position: player.position ?? "Desconhecido",
                            shirtNumber: player.shirtNumber,
                            marketValue: player.marketValue ?? 0
                        }
                    })) ?? []
                }
            },
        })
    }

    // Registrar os dois times
    await Promise.all([
        registerTeam(game.homeTeam),
        registerTeam(game.awayTeam)
    ])
}