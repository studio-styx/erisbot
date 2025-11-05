import { icon } from "#functions";
import { FootballLeague, FootballMatch, FootballTeam } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, TimestampStyles, type InteractionReplyOptions } from "discord.js";

function formatarData(date: Date) {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const anteontem = new Date(hoje);
    anteontem.setDate(hoje.getDate() - 2);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const depoisAmanha = new Date(hoje);
    depoisAmanha.setDate(hoje.getDate() + 2);
    
    // Reset das horas para comparar apenas a data
    hoje.setHours(0, 0, 0, 0);
    ontem.setHours(0, 0, 0, 0);
    anteontem.setHours(0, 0, 0, 0);
    amanha.setHours(0, 0, 0, 0);
    depoisAmanha.setHours(0, 0, 0, 0);
    const dataComparar = new Date(date);
    dataComparar.setHours(0, 0, 0, 0);
    
    if (dataComparar.getTime() === hoje.getTime()) return "hoje";
    if (dataComparar.getTime() === ontem.getTime()) return "ontem";
    if (dataComparar.getTime() === anteontem.getTime()) return "anteontem";
    if (dataComparar.getTime() === amanha.getTime()) return "amanhã";
    if (dataComparar.getTime() === depoisAmanha.getTime()) return "depois de amanhã";
    
    return date.toLocaleDateString();
}

type MatchesType = (FootballMatch & { 
    homeTeam: FootballTeam, 
    awayTeam: FootballTeam, 
    competition: FootballLeague 
})[]

export function getMatchesMenuMenu<R>(matches: MatchesType, defaultImageUrl: string, date: Date, page = 0): R {
    const components: any[] = [];

    const mathesPerPage = 5;
    const startIndex = page * mathesPerPage;
    const endIndex = startIndex + mathesPerPage;

    const paginatedMatches = matches.slice(startIndex, endIndex);
    const pages = Math.ceil(matches.length / mathesPerPage);


    if (matches.length > 0) {
        paginatedMatches.forEach(m => {
            components.push(
                createSection(brBuilder(
                    `## ${icon.trophy} - ${m.competition.name}`,
                    `${icon.soccer_field} - **${m.homeTeam.name}** ${m.goalsHome ?? ""} x ${m.goalsAway ?? ""} **${m.awayTeam.name}**`,
                    `${icon.stadium} - **Estádio:** ${m.venue || "Desconhecido"}`,
                    m.startAt < new Date() ?
                        `${icon.alarm} - **Começou:** ${time(m.startAt, TimestampStyles.RelativeTime)} | ${time(m.startAt, TimestampStyles.LongDateTime)}`
                        : `${icon.alarm} - **Começa:** ${time(m.startAt, TimestampStyles.RelativeTime)}  | ${time(m.startAt, TimestampStyles.LongDateTime)}`,
                    `**Odd para o time da casa:** ${m.oddsHomeWin || "Desconhecido"}`,
                    `**Odd para o empate:** ${m.oddsDraw || "Desconhecido"}`,
                    `**Odd para o time visitante:** ${m.oddsAwayWin || "Desconhecido"}`,
                ), m.competition.emblem || m.homeTeam.crest || m.awayTeam.crest || defaultImageUrl),
                new ButtonBuilder({
                    customId: `football/match/view/${m.id}`,
                    label: "Mais informações",
                    style: ButtonStyle.Primary
                }),
                createSeparator()
            )
        });
    } else {
        components.push(brBuilder(
            `Nenhum jogo agendado para esse dia`
        ))
    }

    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const container = createContainer(settings.colors.fuchsia,
        `## Partidas de futebol de ${formatarData(date)}`,
        createSeparator(),
        ...components,
        createRow(
            new ButtonBuilder({
                customId: `football/menu/page/${page - 1}/${date.toISOString()}`,
                label: "voltar",
                disabled: page === 0,
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: `football/menu/page/${page + 1}/${date.toISOString()}`,
                label: "avançar",
                disabled: page === pages - 1,
                style: ButtonStyle.Primary
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: `football/menu/date/${yesterday.toISOString()}`,
                label: yesterday.toLocaleDateString(),
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: `football/menu/date/${tomorrow.toISOString()}`,
                label: tomorrow.toLocaleDateString(),
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: `football/menu/other/otherData`,
                label: "Escolher uma data",
                style: ButtonStyle.Secondary,
            })  
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}