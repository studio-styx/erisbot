import { prisma } from "#database";
import { Prisma, PrismaClient } from "#prisma";
import { footballSdk } from "#tools";
import { MatchResponse } from "#types/footballData/match.js";
import { Client } from "discord.js";
import { DefaultArgs } from "../../../../prisma/eris/runtime/library.js";
import { res } from "#functions";

interface FootballGamesPipelineResult {
    success: MatchResponse[];
    failed: MatchResponse[];
    errors: Error[];
    minutes: number;
    startedAt: Date;
    endedAt: Date;
}

export async function registerFootballGames(client: Client): Promise<FootballGamesPipelineResult> {
    console.log("Iniciando registro de partidas da semana...");

    const { matches } = await footballSdk.matches.getGamesByRange(new Date(), new Date(new Date().setDate(new Date().getDate() + 7)));

    const success: MatchResponse[] = [];
    const failed: MatchResponse[] = [];
    const errors: Error[] = [];

    const sendMessage = async (message: string, style: "success" | "danger" | "primary") => {
        try {
            const guild = client.guilds.cache.get("1395383469210865694");
            if (!guild) return;
            const channel = guild.channels.cache.get("1410405644758159410") || await guild.channels.fetch("1410405644758159410");
            if (!channel || !channel.isTextBased()) return;
            await channel.send(res[style](message));
        } catch (e) {
            console.error("Erro ao enviar mensagem para o canal:", e);
        }
    }

    sendMessage(`Iniciando registro de ${matches.length} partidas da semana...`, "primary");
    console.log("Registrando:", matches.length, "partidas...");

    const beforeTime = new Date();

    for (const game of matches) {
        await prisma.$transaction(
            async (tx) => {
                console.log(`Registrando partida entre ${game.homeTeam.name} e ${game.awayTeam.name}...`)
                try {
                    await registerGame(tx, game);
                    success.push(game);
                    console.log(`Partida entre ${game.homeTeam.name} e ${game.awayTeam.name} registrada com sucesso.`);
                    sendMessage(`Registrada a partida: **${game.homeTeam.name}** x **${game.awayTeam.name}** no banco de dados`, "success")
                } catch (error) {
                    console.error(`Erro ao registrar partida entre ${game.homeTeam.name} e ${game.awayTeam.name}:`, error);
                    failed.push(game);
                    errors.push(error as Error);
                    sendMessage(`Erro ao registrar a partida: ${game.homeTeam.name} x ${game.awayTeam.name} no banco de dados`, "danger")
                }
            },
            { timeout: 120_000 }
        );
    }

    const afterTime = new Date();
    const timeDifference = afterTime.getTime() - beforeTime.getTime();
    const minutes = Math.floor(timeDifference / (1000 * 60));

    console.log("Todas as partidas registradas com sucesso.");
    await sendMessage(`Todas as partidas registradas com sucesso. Duração: ${minutes} minutos.`, "success");

    return { success, failed, errors, minutes, startedAt: beforeTime, endedAt: afterTime };
}

async function registerGame(tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">, game: MatchResponse) {
    const leagueId = await getOrCreateLeague(tx, game);
    const [homeTeam, awayTeam] = await Promise.all([
        getOrCreateTeam(tx, game.homeTeam, game.competition.id),
        getOrCreateTeam(tx, game.awayTeam, game.competition.id),
    ]);

    await tx.footballMatch.upsert({
        where: { apiId: game.id },
        create: {
            apiId: game.id,
            goalsHome: game.score.fullTime.home,
            goalsAway: game.score.fullTime.away,
            status: game.status,
            startAt: game.utcDate,
            homeTeam: { connect: { id: homeTeam.id } },
            awayTeam: { connect: { id: awayTeam.id } },
            competition: { connect: { id: BigInt(leagueId) } },
            oddsHomeWin: game.odds?.homeWin || null,
            oddsDraw: game.odds?.draw || null,
            oddsAwayWin: game.odds?.awayWin || null,
        },
        update: {
            goalsHome: game.score.fullTime.home,
            goalsAway: game.score.fullTime.away,
            status: game.status,
            startAt: game.utcDate,
        },
    });
    const { homeTeam: h, awayTeam: a } = game;
    if (h.statistics && a.statistics) {
        await Promise.all([
            upsertStats(tx, game.id, h.id, h.statistics),
            upsertStats(tx, game.id, a.id, a.statistics),
        ]);
    }
}

async function getOrCreateLeague(tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">, game: MatchResponse): Promise<bigint> {
    const existing = await tx.footballLeague.findUnique({
        where: { apiId: game.competition.id },
    });

    if (existing) {
        return existing.id;
    }

    let info;
    try {
        info = await footballSdk.competitions.get(game.competition.code).getInfo();
    } catch (error) {
        console.warn(`Liga ${game.competition.code} não encontrada. Usando dados básicos.`);
        info = {
            area: { id: 0, code: "UNK", name: "Desconhecida", flag: null },
            id: game.competition.id,
            name: game.competition.name,
            code: game.competition.code,
            type: game.competition.type,
            emblem: game.competition.emblem,
        };
    }

    const area = await tx.footballArea.upsert({
        where: { code: info.area.code },
        update: {},
        create: {
            id: info.area.id || 0,
            code: info.area.code,
            name: info.area.name,
            flag: info.area.flag || "",
        },
    });

    const league = await tx.footballLeague.create({
        data: {
            apiId: info.id,
            name: info.name,
            code: info.code,
            type: info.type,
            emblem: info.emblem,
            areaId: area.id,
        },
    });

    return league.id;
}

async function getOrCreateTeam(tx: any, team: any, competitionId: number) {
    const existing = await tx.footballTeam.findUnique({ where: { apiId: team.id } });
    if (existing) {
        return existing;
    }

    let info;
    try {
        info = await footballSdk.teams.get(team.id).getInfo();
    } catch (error) {
        console.warn(`Time ${team.id} não encontrado. Usando dados básicos.`);
        info = {
            area: { code: "UNK", name: "Desconhecido", flag: null },
            address: "", clubColors: "", venue: "", squad: [],
        };
    }

    const area = await tx.footballArea.upsert({
        where: { code: info.area?.code || "UNK" },
        update: {},
        create: {
            id: info.area?.id || 0,
            code: info.area?.code || "UNK",
            name: info.area?.name || "Desconhecido",
            flag: info.area?.flag || null,
        },
    });

    const dbTeam = await tx.footballTeam.upsert({
        where: { apiId: team.id },
        create: {
            apiId: team.id,
            name: team.name,
            shortName: team.shortName,
            tla: team.tla,
            crest: team.crest,
            address: info.address || "Desconhecido",
            clubColors: info.clubColors || "Desconhecido",
            venue: info.venue || "Desconhecido",
            areaId: area.id,
            competitions: { connect: { apiId: competitionId } },
            players: {
                create: (info.squad || []).map(p => ({
                    apiId: p.id,
                    name: p.name,
                    firstName: p.firstName || p.name.split(" ")[0] || "Desconhecido",
                    lastName: p.lastName || p.name.split(" ").slice(1).join(" ") || "Desconhecido",
                    position: p.position ?? "Desconhecido",
                    dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
                    nationality: p.nationality ?? "Desconhecido",
                    shirtNumber: p.shirtNumber,
                    marketValue: p.marketValue ?? 0,
                    contractStarted: p.contract?.start,
                    contractUntil: p.contract?.until,
                })),
            },
        },
        update: {
            name: team.name,
            shortName: team.shortName,
            tla: team.tla,
            crest: team.crest,
            address: info.address || "Desconhecido",
            clubColors: info.clubColors || "Desconhecido",
            venue: info.venue || "Desconhecido",
            competitions: { connect: { apiId: competitionId } },
        },
    });

    return dbTeam;
}

async function upsertStats(tx: any, matchId: number, teamId: number, stats: any) {
    await tx.footballMatchStatistics.upsert({
        where: { matchId_teamId: { matchId, teamId } },
        create: { ...stats, matchId, teamId },
        update: stats,
    });
}