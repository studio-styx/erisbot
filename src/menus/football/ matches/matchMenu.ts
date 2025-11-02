import { formatNumber } from "#functions";
import { FootballBet, FootballBetType, FootballLeague, FootballMatch, FootballTeam, MatchStatus, Prisma } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, TimestampStyles, type InteractionReplyOptions } from "discord.js";

type MatchType = (FootballMatch & {
    homeTeam: FootballTeam
    awayTeam: FootballTeam
    competition: FootballLeague,
})

type User = {
    id: string,
    displayAvatarURL: () => string,
    bets: FootballBet[]
}

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

const betFormatted: Record<FootballBetType, string> = {
    AWAY_WIN: "Vitória do visitante",
    DRAW: "Empate",
    HOME_WIN: "Vitória da casa",
    EXACT_GOALS: "Gols exatos",
    GOALS_AWAY: "Gols do visitante",
    GOALS_HOME: "Gols da casa",
}

export function matchMenu<R>(match: MatchType, user: User): R {
    const container = createContainer(settings.colors.fuchsia,
        createSection(
            brBuilder(
                `## Partida: ${match.homeTeam.name} ${match.goalsHome ?? "NDA"} x ${match.goalsAway ?? "NDA"} ${match.awayTeam.name}`,
                `**Estádio:** ${match.venue || "Desconhecido"}`,
                match.startAt < new Date()
                    ? `**Começou:** ${time(match.startAt, TimestampStyles.RelativeTime)} | ${time(match.startAt, TimestampStyles.LongDateTime)}`
                    : `**Começa:** ${time(match.startAt, TimestampStyles.RelativeTime)}  | ${time(match.startAt, TimestampStyles.LongDateTime)}`,
                `**Campeonato:** ${match.competition.name}`,
                `**Status:** ${matchStatusFormatted[match.status]}`,
            ),
            match.competition.emblem || match.homeTeam.crest || match.awayTeam.crest || user.displayAvatarURL()
        ),
        createSeparator(),
        `## Suas apostas:`,
        user.bets.length > 0 && [...user.bets.map(b => createSection(
            brBuilder(
                `> **Tipo:** ${betFormatted[b.type]}`,
                `> **Quantia:** ${formatNumber(b.amount.toNumber())}`,
                b.type !== "HOME_WIN" && b.type !== "AWAY_WIN" && b.type !== "DRAW"
                    ? `> **Aposta:** ${b.quantity}`
                    : null,
                `> **Odd:** ${b.odds}`,
                `> **Valor de pagamento estimado**: ${formatNumber(new Prisma.Decimal(b.amount.toNumber() * b.odds.toNumber()).toNumber())}`
            ),
            new ButtonBuilder({
                customId: `football/bet/remove/${b.id}/${user.id}`,
                label: "Remover",
                style: ButtonStyle.Danger,
                disabled: match.startAt < new Date()
            })
        ))],
        createRow(
            new ButtonBuilder({
                customId: `football/match/menu/bet/${match.id}/${user.id}`,
                label: "Apostar",
                style: ButtonStyle.Secondary,
                disabled: match.startAt < new Date()
            }),
            new ButtonBuilder({
                customId: `football/match/menu/simulate/${match.id}/${user.id}`,
                label: "Simular resultado",
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