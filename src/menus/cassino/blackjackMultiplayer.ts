import { icon } from "#functions";
import { settings } from "#settings";
import { BlackjackMultiplayerGame } from "#types/blackjackMultiplayerGame.js";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, userMention, type InteractionReplyOptions } from "discord.js";

export function blackjackMultiplayerMenu<R>(data: BlackjackMultiplayerGame): R {
    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            `## Partida de Blackjack Multiplayer`,
            `**Jogador 1:** ${userMention(data.userId)}`,
            `**Jogador 2:** ${userMention(data.targetId)}`,
            `**Aposta:** ${data.amount} stx`,
            `\u200b`
        ),
        createSeparator(),
        brBuilder(
            `### ( ${icon.card_joker} ╺╸ Cartas de ${userMention(data.userId)}`,
            data.userHand.map((c, index) => index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", ")
        ),
        createSeparator(),
        brBuilder(
            `### ( ${icon.card_joker} ╺╸ Cartas de ${userMention(data.targetId)}`,
            data.targetHand.map((c, index) => index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", ")
        ),
        createSeparator(),
        brBuilder(
            `**Turno de:** ${data.turn === "user" ? userMention(data.userId) : userMention(data.targetId)}`,
        ),
        createRow(
            new ButtonBuilder({
                customId: `blackjackMultiplayer/game/hit/${data.turn === "user" ? data.userId : data.targetId}`,
                label: "Pegar uma carta",
                style: ButtonStyle.Primary,
            }),
            new ButtonBuilder({
                customId: `blackjackMultiplayer/game/pass/${data.turn === "user" ? data.userId : data.targetId}`,
                label: "Passar",
                style: ButtonStyle.Secondary,
            }),
            new ButtonBuilder({
                customId: `blackjackMultiplayer/game/stand/${data.turn === "user" ? data.userId : data.targetId}`,
                label: "Parar",
                style: ButtonStyle.Danger,
                disabled: data.rounds < 3,
            })
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}