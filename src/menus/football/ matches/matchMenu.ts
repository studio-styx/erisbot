import { FootballLeague, FootballMatch, FootballTeam, MatchStatus } from "#prisma";
import { settings } from "#settings";
import { MatchStatistics } from "#types/footballData/match.js";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, TimestampStyles, type InteractionReplyOptions } from "discord.js";

type MatchType = (FootballMatch & {
    homeTeam: FootballTeam & { statistics?: MatchStatistics },
    awayTeam: FootballTeam & { statistics?: MatchStatistics },
    competition: FootballLeague,
})

const matchStatusFormatted: Record<MatchStatus, string> = {
    CANCELED: "Cancelado",     // Partida foi oficialmente cancelada (não será disputada)
    AWARDED: "Awarded",       // Resultado definido por decisão (ex: W.O., punição)
    FINISHED: "Finalizado",    // Partida terminou (90 minutos + acréscimos)
    IN_PLAY: "Em jogo",       // Partida está rolando (qualquer minuto do jogo)
    LIVE: "Em vivo",       // Mesmo que IN_PLAY — usado em alguns endpoints
    PAUSED: "Pausado",       // Intervalo (ex: entre 1º e 2º tempo)
    POSTPONED: "Adiado",        // Partida remarcada para outra data
    SCHEDULED: "Agendado",      // Partida com data/hora definidos, ainda não começou
    SUSPENDED: "Suspenso",      // Partida interrompida (ex: chuva, briga) — pode continuar depois
};


export function matchMenu<R>(match: MatchType, userId: string, defaultImageUrl: string, page?: "homeStatistics" | "awayStatistics" | "odds"): R {
    const components: any[] = [createSeparator()];

    switch (page) {
        case "homeStatistics":
            components.push(
                brBuilder(
                    `### Estatísticas da casa:`,
                    `**Chutes ao gol:** ${match.homeTeam.statistics?.shots_on_goal || 0}`,
                    `**Chutes fora do gol:** ${match.homeTeam.statistics?.shots_off_goal || 0}`,
                    `**Chutes totais:** ${match.homeTeam.statistics?.shots || 0}`,
                    `**Escanteios:** ${match.homeTeam.statistics?.corner_kicks || 0}`,
                    `**Faltas cometidas:** ${match.homeTeam.statistics?.fouls || 0}`,
                    `**Faltas cobradas:** ${match.homeTeam.statistics?.free_kicks || 0}`,
                    `**Gols marcados:** ${match.homeTeam.statistics?.goal_kicks || 0}`,
                    `**Impedimentos:** ${match.homeTeam.statistics?.offsides || 0}`,
                    `**Posse de bola:** ${match.homeTeam.statistics?.ball_possession || 0}%`,
                    `**Cartões amarelos:** ${match.homeTeam.statistics?.yellow_cards || 0}`,
                    `**Cartões vermelhos:** ${match.homeTeam.statistics?.red_cards || 0}`,
                    `**Defesas do goleiro:** ${match.homeTeam.statistics?.saves || 0}`,
                    `**Laterais:** ${match.homeTeam.statistics?.throw_ins || 0}`,
                )
            );
            break;
        case "awayStatistics": 
            components.push(
                brBuilder(
                    `### Estatísticas ddo visitante:`,
                    `**Chutes ao gol:** ${match.awayTeam.statistics?.shots_on_goal || 0}`,
                    `**Chutes fora do gol:** ${match.awayTeam.statistics?.shots_off_goal || 0}`,
                    `**Chutes totais:** ${match.awayTeam.statistics?.shots || 0}`,
                    `**Escanteios:** ${match.awayTeam.statistics?.corner_kicks || 0}`,
                    `**Faltas cometidas:** ${match.awayTeam.statistics?.fouls || 0}`,
                    `**Faltas cobradas:** ${match.awayTeam.statistics?.free_kicks || 0}`,
                    `**Gols marcados:** ${match.awayTeam.statistics?.goal_kicks || 0}`,
                    `**Impedimentos:** ${match.awayTeam.statistics?.offsides || 0}`,
                    `**Posse de bola:** ${match.awayTeam.statistics?.ball_possession || 0}%`,
                    `**Cartões amarelos:** ${match.awayTeam.statistics?.yellow_cards || 0}`,
                    `**Cartões vermelhos:** ${match.awayTeam.statistics?.red_cards || 0}`,
                    `**Defesas do goleiro:** ${match.awayTeam.statistics?.saves || 0}`,
                    `**Laterais:** ${match.awayTeam.statistics?.throw_ins || 0}`,
                )
            );
            break;
        case "odds": 
            components.push(
                brBuilder(
                    `### Odds da partida`,
                    `**Odd para vitória do mandante:** ${match.oddsHomeWin || 0}`,
                    `**Odd para empate:** ${match.oddsDraw || 0}`,
                    `**Odd para vitória do visitante:** ${match.oddsAwayWin || 0}`,
                )
            );
            break;
    }

    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            `## Partida: ${match.homeTeam.name} x ${match.awayTeam.name}`,
        ),
        createSeparator(),
        createSection(brBuilder(
            match.goalsHome && match.goalsAway ? `**Placar: ${match.goalsHome} x ${match.goalsAway}**` : null,
            `**Estádio:** ${match.venue || "Desconhecido"}`,
            `**Status:** ${matchStatusFormatted[match.status] || "Desconhecido"}`,
            match.startAt < new Date() ?
                `**Começou:** ${time(match.startAt, TimestampStyles.RelativeTime)} | ${time(match.startAt, TimestampStyles.LongDateTime)}`
                : `**Começa:** ${time(match.startAt, TimestampStyles.RelativeTime)} | ${time(match.startAt, TimestampStyles.LongDateTime)}`
        ), match.competition.emblem || match.homeTeam.crest || match.awayTeam.crest || defaultImageUrl),
        components.length > 1 ? components : null,
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `football/match/menu/homeStatistics/${match.id}/${userId}`,
                label: "Estatisticas da casa",
                style: page === "homeStatistics" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: page === "homeStatistics" || !match.homeTeam.statistics
            }),
            new ButtonBuilder({
                customId: `football/match/menu/awayStatistics/${match.id}/${userId}`,
                label: "Estatisticas do visitante",
                style: page === "awayStatistics" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: page === "awayStatistics" || !match.awayTeam.statistics
            }),
            new ButtonBuilder({
                customId: `football/match/menu/odds/${match.id}/${userId}`,
                label: "Odds",
                style: page === "odds" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: page === "odds"
            }),
            new ButtonBuilder({
                customId: `football/match/menu/bet/${match.id}/${userId}`,
                label: "Apostar",
                style: ButtonStyle.Success,
                disabled: match.startAt < new Date()
            })
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}