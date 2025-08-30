import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

export function startRankingMenu<R>(area: "Guild" | "Global" | null, type: "stx" | "xp" | "tryviaGames" | "tryviaWins" | "tryviaPoints" | null): R {
    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            "## Menu dos rankings"
        ),
        createSeparator(),
        brBuilder(
            `Escolha uma área para ver os rankings`
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
                        value: `syx/${area?.toLowerCase()}`,
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