import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSection, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function rankingMenu<R>(area: "Guild" | "Global", type: "stx" | "xp" | "tryviaGames" | "tryviaWins" | "tryviaPoints", ranking: { user: { id: string; name: string; avatarUrl: string; }; amount: number; }[], authorId: string, page: number = 0): R {
    const inicial = page * 10;
    const final = inicial + 10;
    
    const rankingFormatted = ranking.slice(inicial, final).map((u, index) => `**${index + 1}. ${u.user.name} - ${u.amount} ${type === "stx" ? "Stx" : type === "tryviaGames" ? "Jogos" : type === "tryviaWins" ? "Vitórias" : type === "tryviaPoints" ? "Pontos" : "Xp"}** ${u.user.id === authorId ? '**`(você)`**' : ''}`).join('\n');
    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            `## Ranking ${area === "Guild" ? "local" : "global"}`,
            `-# Ranking de: ${type === "stx" ? "Stx" : type === "xp" ? "Xp" : type === "tryviaGames" ? "Jogos de trivia" : type === "tryviaWins" ? "Vitórias no trivia" : "Pontos no trivia"}`
        ),
        createSeparator(),
        createSection({
            content: rankingFormatted,
            thumbnail: ranking[0].user.avatarUrl
        }),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `leaderboard/rank/${page - 1}/${area}/${type}`,
                label: "Voltar",
                disabled: page === 0,
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: `leaderboard/rank/${page + 1}/${area}/${type}`,
                label: "Avançar",
                disabled: final >= ranking.length,
                style: ButtonStyle.Primary
            })
        ),
        createRow(
            new StringSelectMenuBuilder({
                customId: "leaderboard/choice",
                placeholder: "Escolha o tipo de ranking",
                disabled: area === null,
                options: [
                    {
                        label: "Stx",
                        description: area === "Guild" ? "Veja os usuários mais ricos do servidor" : "Veja os usuários mais ricos do discord",
                        value: `stx/${area?.toLowerCase()}`,
                        default: type === "stx"
                    },
                    {
                        label: "Xp",
                        description: area === "Guild" ? "Veja os usuários com mais xp do servidor" : "Veja os usuários com mais xp do discord",
                        value: `xp/${area?.toLowerCase()}`,
                        default: type === "xp"
                    },
                    {
                        label: "Jogos de trivia",
                        description: area === "Guild" ? "Veja os usuários com mais jogos de trivia do servidor" : "Veja os usuários com mais jogos de tryvia do discord",
                        value: `tryviaGames/${area?.toLowerCase()}`,
                        default: type === "tryviaGames"
                    },
                    {
                        label: "Vitórias no trivia",
                        description: area === "Guild" ? "Veja os usuários com mais vitórias no trivia do servidor" : "Veja os usuários com mais vitórias no trivia do discord",
                        value: `tryviaWins/${area?.toLowerCase()}`,
                        default: type === "tryviaWins"
                    },
                    {
                        label: "Pontos no trivia",
                        description: area === "Guild" ? "Veja os usuários com mais pontos no trivia do servidor" : "Veja os usuários com mais pontos no trivia do discord",
                        value: `tryviaPoints/${area?.toLowerCase()}`,
                        default: type === "tryviaPoints"
                    }
                ]
            })
        )
    );

    const row = createRow(
        new ButtonBuilder({
            label: "Servidor",
            customId: "leaderboard/server",
            style: ButtonStyle.Primary,
            disabled: area === "Guild"
        }),
        new ButtonBuilder({
            label: "Discord",
            customId: "leaderboard/global",
            style: ButtonStyle.Primary,
            disabled: area === "Global"
        })
    )

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container, row]
    } satisfies InteractionReplyOptions) as R;
}