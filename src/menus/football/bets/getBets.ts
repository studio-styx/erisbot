import { FootballBet, FootballBetStatus, FootballLeague, FootballMatch, FootballTeam } from "#prisma";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

type Bet = FootballBet & {
    match: FootballMatch & {
        homeTeam: FootballTeam;
        awayTeam: FootballTeam;
        competition: FootballLeague;
    }
}

const betStatusFormatted: Record<FootballBetStatus, string> = {
    CANCELED: "Cancelado",
    LOST: "Perdido",
    WON: "Ganho",
    PENDING: "Pendente"
}

export function getBetsMenu<R>(bets: Bet[], page = 0): R {
    const betsComponents: any[] = [];

    for (const bet of bets) {
        betsComponents.push(
            createSection(
                brBuilder(
                    `### ${bet.match.homeTeam.name} ${bet.match.goalsHome ?? ""} x ${bet.match.goalsAway ?? ""} ${bet.match.awayTeam.name}`,
                    `**Data do jogo:** ${time(bet.match.startAt, "D")}`,
                    `**Status**: ${betStatusFormatted[bet.status] ?? bet.status}`,
                    `**Aposta**: ${bet.amount}**`,
                ),
                new ButtonBuilder({
                    customId: `football/bet/remove/${bet.id}/${bet.userId}/bet`,
                    label: "Deletar",
                    style: ButtonStyle.Danger
                })
            ),
            createSeparator()
        )
    }

    const betsPerPage = 5;
    const totalPages = Math.ceil(bets.length / betsPerPage);

    const betsPageComponents = betsComponents.slice(page * betsPerPage, (page + 1) * betsPerPage);

    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            "## Suas apostas"
        ),
        createSeparator(),
        ...betsPageComponents,
        createRow(
            new ButtonBuilder({
                customId: `football/bet/page/${page - 1}`,
                label: "Voltar",
                style: ButtonStyle.Primary,
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `football/menu/bet/${page + 1}`,
                label: "Avançar",
                style: ButtonStyle.Primary,
                disabled: page === totalPages - 1
            })
        ),
        `-# Página: ${page + 1}/${totalPages}`
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}