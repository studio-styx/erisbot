import { FootballFixture, FootballLeague, FootballTeam, FootballTeamStadium } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

export function footballGamesMenu<R>(matches: (FootballFixture & { homeTeam: FootballTeam, awayTeam: FootballTeam, league: FootballLeague, venue: FootballTeamStadium | null })[], page = 0): R {
    const matchesComponents: any[] = [];

    const matchesPetPage = 5;
    const startIndex = page * matchesPetPage;
    const endIndex = startIndex + matchesPetPage;

    const pagedMatches = matches.slice(startIndex, endIndex);
    const pages = Math.ceil(matches.length / matchesPetPage);

    pagedMatches.forEach(m => {
        matchesComponents.push(
            createSection({
                content: brBuilder(
                    m.goalsAway && m.goalsHome ?
                        `**${m.homeTeam.name} ${m.goalsHome} x ${m.goalsAway} ${m.awayTeam.name}**`
                        : `**${m.homeTeam.name} x ${m.awayTeam.name}**`,
                    m.date < new Date() ?
                        m.status === "Finalizado" ?
                            `**Finalizado:** ${time(m.date, "R")} | ${time(m.date, "D")}`
                            : `**Começou:** ${time(m.date, "R")} | ${time(m.date, "D")}`
                        : `**Começa:** ${time(m.date, "R")} | ${time(m.date, "D")}`,
                    `**Competição:** ${m.league.name}`,
                    `**Estádio:** ${m.venue?.name || "Desconhecido"}`,
                    `**Status:** ${m.status}`
                ),
                thumbnail: m.league.logo || m.homeTeam.logo || m.awayTeam.logo
            }),
            new ButtonBuilder({
                customId: `football/bet/${m.id}`,
                label: "Apostar",
                style: ButtonStyle.Primary
            }),
            createSeparator()
        )
    });

    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            "## Jogos de futebol"
        ),
        ...matchesComponents,
        `Página: \`${page + 1}/${pages}\``,
        createRow(
            new ButtonBuilder({
                customId: `football/matches/page/${page - 1}`,
                style: ButtonStyle.Primary,
                emoji: "◀️",
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `football/matches/page/${page + 1}`,
                style: ButtonStyle.Primary,
                emoji: "▶️",
                disabled: page === pages
            }),
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}