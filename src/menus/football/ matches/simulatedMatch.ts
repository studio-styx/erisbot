import { Event, icon, SimulatedMatch } from "#functions";
import { FootballLeague, FootballMatch, FootballTeam } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

type Match = SimulatedMatch & {
    match: FootballMatch & {
        homeTeam: FootballTeam;
        awayTeam: FootballTeam;
        competition: FootballLeague;
    }
}

const eventFormatted: Record<Event, string> = {
    GOAL: "Gol",
    YELLOW_CARD: "Cartão amarelo",
    RED_CARD: "Cartão vermelho",
    FIGHT: "Briga",
    MISSED_PENALTY: "Penâlti perdido",
    OWN_GOAL: "Gol contra",
    PENALTY: "Gol de penâlti",
    SUBSTITUTION: "Substituição"
}

type Time = "first" | "second" | "extra" | "penalties";

const timeFormatted: Record<Time, string> = {
    first: "Primeiro tempo",
    second: "Segundo tempo",
    extra: "Tempo extra",
    penalties: "Penâltis"
}

export function simulatedMatchMenu<R>(simulatedMatch: Match, time: "first" | "second" | "extra" | "penalties"): R {
    const components: any[] = [];

    switch (time) {
        case "first": {
            const timeLineFirstHalf = simulatedMatch.timeline.filter(t => t.minute <= 45);
            timeLineFirstHalf.forEach(t => {
                components.push(
                    brBuilder(
                        `${icon.alarm} | **Minuto**: ${t.minute}`,
                        `${icon.event_list} | **Evento**: ${eventFormatted[t.event] ?? t.event}`,
                        t.player ? `${icon.soccer_field} | **Jogador**: ${t.player}` : null,
                        `**${t.reason}**`
                    ),
                    createSeparator(),
                )
            });
            break;
        }
        case "second": {
            const timeLineSecondHalf = simulatedMatch.timeline.filter(t => t.minute > 45);

            timeLineSecondHalf.forEach(t => {
                components.push(
                    brBuilder(
                        `${icon.alarm} | **Minuto**: ${t.minute}`,
                        `${icon.event_list} | **Evento**: ${eventFormatted[t.event] ?? t.event}`,
                        t.player ? `${icon.soccer_field} | **Jogador**: ${t.player}` : null,
                        `**${t.reason}**`
                    ),
                    createSeparator(),
                )
            });
        }
        case "extra": {
            const timeLineExtra = simulatedMatch.timeline.filter(t => t.minute > 90);

            timeLineExtra.forEach(t => {
                components.push(
                    brBuilder(
                        `${icon.alarm} | **Minuto**: ${t.minute}`,
                        `${icon.event_list} | **Evento**: ${eventFormatted[t.event] ?? t.event}`,
                        t.player ? `${icon.soccer_field} | **Jogador**: ${t.player}` : null,
                        `**${t.reason}**`
                    ),
                    createSeparator(),
                )
            });
        }
        case "penalties": {
            const timeLinePenalties = simulatedMatch.timeline.filter(t => (t.event === "PENALTY" || t.event === "MISSED_PENALTY") && t.minute > 90);

            timeLinePenalties.forEach(t => {
                components.push(
                    brBuilder(
                        `${icon.alarm} | **Minuto**: ${t.minute}`,
                        `${icon.event_list} | **Evento**: ${eventFormatted[t.event] ?? t.event}`,
                        t.player ? `${icon.soccer_field} | **Jogador**: ${t.player}` : null,
                        `**${t.reason}**`
                    ),
                    createSeparator(),
                )
            })
        }
    }

    const buttons = [
        new ButtonBuilder({
            customId: `fooball/simulatedMatch/first/${simulatedMatch.match.id}`,
            label: "Primeiro tempo",
            style: time === "first" ? ButtonStyle.Secondary : ButtonStyle.Primary,
            disabled: time === "first"
        }),
        new ButtonBuilder({
            customId: `fooball/simulatedMatch/second/${simulatedMatch.match.id}`,
            label: "Segundo tempo",
            style: time === "second" ? ButtonStyle.Secondary : ButtonStyle.Primary,
            disabled: time === "second"
        }),
    ]

    if (simulatedMatch.timeline.filter(t => t.minute > 90).length > 0) {
        buttons.push(
            new ButtonBuilder({
                customId: `fooball/simulatedMatch/extra/${simulatedMatch.match.id}`,
                label: "Tempo extra",
                style: time === "extra" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: time === "extra"
            }),
        )
    }
    if (simulatedMatch.timeline.filter(t => (t.event === "PENALTY" || t.event === "MISSED_PENALTY") && t.minute > 90).length > 0) {
        buttons.push(
            new ButtonBuilder({
                customId: `fooball/simulatedMatch/penalties/${simulatedMatch.match.id}`,
                label: "Penâltis",
                style: time === "penalties" ? ButtonStyle.Secondary : ButtonStyle.Primary,
                disabled: time === "penalties"
            })
        )
    }


    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            `## Simulação da partida: ${simulatedMatch.match.homeTeam.name} x ${simulatedMatch.match.awayTeam.name}`,
        ),
        createSeparator(),
        `### ${timeFormatted[time]}`,
        createSeparator(),
        ...components,
        brBuilder(
            `**Placar final**: ${simulatedMatch.score.fullTime.home} x ${simulatedMatch.score.fullTime.away}`,
            `**Placar no intervalo**: ${simulatedMatch.score.halfTime.home} x ${simulatedMatch.score.halfTime.away}`,
            simulatedMatch.score.extraTime ? `**Placar extra**: ${simulatedMatch.score.extraTime.home} x ${simulatedMatch.score.extraTime.away}` : null,
            simulatedMatch.score.penalties ? `**Penâltis**: ${simulatedMatch.score.penalties.home} x ${simulatedMatch.score.penalties.away}` : null,
            `**Opinião**: ${simulatedMatch.opinion}`,
            `**Explicação**: ${simulatedMatch.explanation}`
        ),
        createRow(buttons)
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}