import { Store } from "#base";
import { BlackjackIA, getBlackjackGame, resv2 } from "#functions";
import { LangCode, translate } from "#locale";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, type InteractionReplyOptions } from "discord.js";

const userGames = new Store<number>()

export function blackjackMenu<R>(userId: string, amount: number, lang: LangCode, game?: BlackjackIA, erisAction?: 'hit' | 'pass' | 'stand' | 'thinking', options?: {
    disableButtons?: boolean,
    wins?: "eris" | "user" | "draw",
    comentary?: string
}): R {
    const t = translate.commands.blackjack[lang];

    if (!game) {
        const aGameExist = getBlackjackGame(userId);
        if (aGameExist !== undefined) {
            return (resv2.danger(t.errors.alreadyInGame.text, createRow(
                new ButtonBuilder({
                    customId: `blackjack/delete/delete`,
                    label: t.errors.alreadyInGame.button,
                    style: ButtonStyle.Danger
                })
            )) satisfies InteractionReplyOptions) as R;
        }
        const games = userGames.get(userId) || 0;

        const buttons = t.menu.start.buttons;

        const components = [
            t.menu.start.chooseGameMode(games),
            createSeparator(),
            createRow(
                new ButtonBuilder({
                    customId: `blackjack/start/0/${userId}/${amount}`,
                    label: buttons.dealerClassic,
                    style: ButtonStyle.Secondary,
                    disabled: games >= 4
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/1/${userId}/${amount}`,
                    label: buttons.erisEasy,
                    style: ButtonStyle.Success,
                    disabled: games >= 4
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/2/${userId}/${amount}`,
                    label: buttons.erisNormal,
                    style: ButtonStyle.Success,
                    disabled: games >= 6
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/3/${userId}/${amount}`,
                    label: buttons.erisDifficult,
                    style: ButtonStyle.Danger,
                    disabled: games >= 8
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/4/${userId}/${amount}`,
                    label: buttons.erisNighmare,
                    style: ButtonStyle.Danger,
                    disabled: games >= 14
                })
            ),
            createRow(
                new UserSelectMenuBuilder({
                    customId: `blackjack/start/other/${userId}/${amount}`,
                    placeholder: buttons.otherPlayer,
                    minValues: 1,
                    maxValues: 1,
                    disabled: games >= 20
                })
            )
        ];

        const container = createContainer({
            accentColor: settings.colors.danger,
            components,
        });

        return ({
            flags: ["IsComponentsV2"],
            components: [container]
        } satisfies InteractionReplyOptions) as R;
    }

    const g = t.menu.game;

    if (options?.wins) {
        userGames.set(userId, (userGames.get(userId) || 0) + 1, { time: 1000 * 60 * 60 * 10 })
        const multiplier = game.getErisDifficulty() <= 1 ? 1.5 : game.getErisDifficulty() * 1.5;
        const humor = game.getErisHumor()
        const components = [
            g.title(game.getErisDifficulty()),
            createSeparator(),
            g.erisHand(game.getErisCards(), game.calculateHandValue(game.getErisCards()), game.getErisDifficulty(), false),
            createSeparator(),
            g.userHand(game.getUserCards(), game.calculateHandValue(game.getUserCards())),
            game.getErisDifficulty() !== 0 && createSeparator(),
            game.getErisDifficulty() !== 0 && brBuilder(
                g.humor(humor),
                options?.comentary || null
            ),
            createSeparator(),
            g.winsMessage(options.wins, amount, multiplier),
        ];

        const container = createContainer({
            accentColor: options.wins === "eris" ? settings.colors.danger : options.wins === "user" ? settings.colors.success : settings.colors.secondary,
            components,
        });

        return ({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container]
        } satisfies InteractionReplyOptions) as R;
    }
    const humor = game.getErisHumor()
    const components = [
        g.title(game.getErisDifficulty()),
        createSeparator(),
        g.erisHand(game.getErisCards(), game.calculateHandValue(game.getErisCards()), game.getErisDifficulty()),
        createSeparator(),
        g.userHand(game.getUserCards(), game.calculateHandValue(game.getUserCards())),
        game.getErisDifficulty() !== 0 && createSeparator(),
        game.getErisDifficulty() !== 0 && brBuilder(
            g.humor(humor),
            options?.comentary || null
        ),
        erisAction && createSeparator(),
        g.erisAction(erisAction),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `blackjack/game/hit/${userId}`,
                label: g.buttons.hit,
                style: ButtonStyle.Primary,
                disabled: options?.disableButtons
            }),
            new ButtonBuilder({
                customId: `blackjack/game/pass/${userId}`,
                label: g.buttons.pass,
                style: ButtonStyle.Secondary,
                disabled: options?.disableButtons
            }),
            new ButtonBuilder({
                customId: `blackjack/game/stand/${userId}`,
                label: g.buttons.stand,
                style: ButtonStyle.Danger,
                disabled: options?.disableButtons || game.turnCount <= 5
            })
        )
    ];

    const container = createContainer({
        accentColor: settings.colors.fuchsia,
        components,
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}