import { FootballBet, FootballBetStatus, FootballBetType, FootballLeague, FootballMatch, FootballTeam } from "#prisma";
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

const betTypeFormatted: Record<FootballBetType, string> = {
    AWAY_WIN: "Vitória do visitante",
    DRAW: "Empate",
    HOME_WIN: "Vitória da casa",
    EXACT_GOALS: "Gols exatos",
    GOALS_AWAY: "Gols do visitante",
    GOALS_HOME: "Gols da casa",
}

export function getBetsMenu<R>(bets: Bet[], page = 0): R {
    const betsPerPage = 5;
    const totalPages = Math.ceil(bets.length / betsPerPage);
    const start = page * betsPerPage;
    const end = start + betsPerPage;
    const betsOnPage = bets.slice(start, end);

    const betSections: any[] = betsOnPage.map(bet => {
        return createSection(
            brBuilder(
                `### ${bet.match.homeTeam.name} ${bet.match.goalsHome ?? ""} x ${bet.match.goalsAway ?? ""} ${bet.match.awayTeam.name}`,
                `**Data do jogo:** ${time(bet.match.startAt, "F")}`,
                `**Status**: ${betStatusFormatted[bet.status] ?? bet.status}`,
                `**Aposta**: ${bet.amount}`,
                `**Tipo de aposta**: ${betTypeFormatted[bet.type] ?? bet.type}`,
                `**Odd**: ${bet.odds}`
            ),
            new ButtonBuilder({
                customId: `football/bet/remove/${bet.id}/${bet.userId}/bet`,
                label: "Deletar",
                style: ButtonStyle.Danger
            })
        );
    });

    // Intercala separadores ENTRE as seções (não no final)
    const betsPageComponents: any[] = [];
    betSections.forEach((section, i) => {
        if (i > 0) {
            betsPageComponents.push(createSeparator());
        }
        betsPageComponents.push(section);
    });

    const container = createContainer(
        settings.colors.fuchsia,
        brBuilder("## Suas apostas"),
        createSeparator(), // ← apenas um após o título
        ...betsPageComponents,
        createRow(
            new ButtonBuilder({
                customId: `football/bet/page/${page - 1}/${bets[0]?.userId}`,
                label: "Voltar",
                style: ButtonStyle.Primary,
                disabled: page === 0
            }),
            new ButtonBuilder({
                customId: `football/bet/page/${page + 1}/${bets[0]?.userId}`,
                label: "Avançar",
                style: ButtonStyle.Primary,
                disabled: page === totalPages - 1 || totalPages === 0
            })
        ),
        `-# Página: ${page + 1}/${totalPages || 1}`
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}