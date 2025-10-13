import { calculateHandValue } from "#functions";
import { LangCode, translate } from "#locale";
import { settings } from "#settings";
import { BlackjackMultiplayerGame } from "#types/blackjackMultiplayerGame.js";
import { createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function blackjackMultiplayerMenu<R>(data: BlackjackMultiplayerGame, lang: LangCode, endGameReason?: string): R {
    const t = translate.commands.blackjack[lang].menu.multiplayerGame;

    const container = createContainer(settings.colors.fuchsia,
        t.title(data.userId, data.targetId, data.amount),
        createSeparator(),
        t.userHand(data.userId, data.userHand, calculateHandValue(data.userHand), !!endGameReason),
        createSeparator(),
        t.userHand(data.targetId, data.targetHand, calculateHandValue(data.targetHand), !!endGameReason),
        createSeparator(),
        t.turn(!!endGameReason, data.turn, data.userId, data.targetId),
        createRow(
            new ButtonBuilder({
                customId: `blackjackMultiplayer/game/hit/${data.turn === "user" ? data.userId : data.targetId}`,
                label: t.buttons.hit,
                style: ButtonStyle.Primary,
                disabled: !!endGameReason,
            }),
            new ButtonBuilder({
                customId: `blackjackMultiplayer/game/pass/${data.turn === "user" ? data.userId : data.targetId}`,
                label: t.buttons.pass,
                style: ButtonStyle.Secondary,
                disabled: !!endGameReason,
            }),
            new ButtonBuilder({
                customId: `blackjackMultiplayer/game/stand/${data.turn === "user" ? data.userId : data.targetId}`,
                label: t.buttons.stand,
                style: ButtonStyle.Danger,
                disabled: !!endGameReason || data.rounds < 3,
            })
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}