import { Store } from "#base";
import { BlackjackIA, getBlackjackGame, icon, resv2 } from "#functions";
import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

const userGames = new Store<number>()

export function blackjackMenu<R>(userId: string, amount: number, game?: BlackjackIA, erisAction?: 'hit' | 'pass' | 'stand' | 'thinking', options?: {
    disableButtons?: boolean,
    wins?: "eris" | "user" | "draw",
    comentary?: string
}): R {
    if (!game) {
        const aGameExist = getBlackjackGame(userId);
        if (aGameExist !== undefined) {
            return (resv2.danger(`${icon.denied} | Você já está jogando uma partida, você deseja deletar ela?`, createRow(
                new ButtonBuilder({
                    customId: `blackjack/delete/delete`,
                    label: "Sim",
                    style: ButtonStyle.Danger
                })
            )) satisfies InteractionReplyOptions) as R;
        }
        const games = userGames.get(userId) || 0;

        const components = [
            brBuilder(
                "# BlackJack",
                "Escolha um modo de jogo",
                games >= 4 ? "> Alguns modos estão desativados pois você está jogando muito." : null
            ),
            createSeparator(),
            createRow(
                new ButtonBuilder({
                    customId: `blackjack/start/0/${userId}/${amount}`,
                    label: "Dealer clássico",
                    style: ButtonStyle.Secondary,
                    disabled: games >= 4
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/1/${userId}/${amount}`,
                    label: "Éris fácil",
                    style: ButtonStyle.Success,
                    disabled: games >= 4
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/2/${userId}/${amount}`,
                    label: "Éris normal",
                    style: ButtonStyle.Success,
                    disabled: games >= 6
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/3/${userId}/${amount}`,
                    label: "Éris dificil",
                    style: ButtonStyle.Danger,
                    disabled: games >= 8
                }),
                new ButtonBuilder({
                    customId: `blackjack/start/4/${userId}/${amount}`,
                    label: "Pesadelo",
                    style: ButtonStyle.Danger,
                    disabled: games >= 14
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

    if (options?.wins) {
        userGames.set(userId, (userGames.get(userId) || 0) + 1, { time: 1000 * 60 * 60 * 10 })
        const multiplier = game.getErisDifficulty() <= 1 ? 1.5 : game.getErisDifficulty() * 1.5;
        const humor = game.getErisHumor()
        const components = [
            brBuilder(
                "## 🃏 BlackJack",
                `-# ╰ Dificuldade selecionada: ${game.getErisDifficulty() === 0 ? "Dealer comum" 
                    : game.getErisDifficulty() === 1 ? "Fácil" 
                        : game.getErisDifficulty() === 2 ? "Normal" 
                            : game.getErisDifficulty() === 3 ? "Difícil" 
                                : game.getErisDifficulty() === 4 ? "Pesadelo" 
                                    : "?"}`
            ),
            createSeparator(),
            brBuilder(
                `### ( ${icon.card_joker} ╺╸ Cartas ${game.getErisDifficulty() === 0 ? "do Dealer" : "da Éris"}`,
                game.getErisCards().map(c => `**\`${c.name}\`**`).join(", "),
                `Mão: ${game.calculateHandValue(game.getErisCards())}`
            ),
            createSeparator(),
            brBuilder(
                `### ( ${icon.card_joker} ╺╸ Suas cartas`,
                game.getUserCards().map(c => `**\`${c.name}\`**`).join(", "),
                `Mão: ${game.calculateHandValue(game.getUserCards())}`
            ),
            game.getErisDifficulty() !== 0 && createSeparator(),
            game.getErisDifficulty() !== 0 && brBuilder(
                `### ( ${humor === "happy" ? icon.Eris_happy
                    : humor === "angry" ? icon.Eris_Angry
                        : humor === "sad" ? icon.Eris_cry
                            : humor === "neutral" ? icon.Eris_thinking
                                : humor === "scared" ? icon.Eris_shy
                                    : humor === "surprised" ? icon.Eris_enchanted
                                        : humor === "confused" ? icon.Eris_thinking
                                            : "?"} ╺╸ Humor da Éris: ${humor === "happy" ? "Feliz"
                                                : humor === "angry" ? "Furiosa"
                                                    : humor === "sad" ? "Triste"
                                                        : humor === "neutral" ? "Neutra"
                                                            : humor === "scared" ? "Calma"
                                                                : humor === "surprised" ? "Surpresa"
                                                                    : humor === "confused" ? "Confusa"
                                                                        : "?"}`,
                options?.comentary || null
            ),
            createSeparator(),
            options.wins === "eris" ? 
                `## Você apostou: ${game.amountAposted} stx e perdeu!`
                : options.wins === "user" 
                    ? `## Você apostou: ${game.amountAposted} stx e ganhou: ${game.amountAposted * multiplier} stx!`
                    : `## Você apostou: ${game.amountAposted} stx e a partida acabou em empate!`
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
        brBuilder(
            "## 🃏 BlackJack",
             `-# ╰ Dificuldade selecionada: ${game.getErisDifficulty() === 0 ? "Dealer comum" 
                    : game.getErisDifficulty() === 1 ? "Fácil" 
                        : game.getErisDifficulty() === 2 ? "Normal" 
                            : game.getErisDifficulty() === 3 ? "Difícil" 
                                : game.getErisDifficulty() === 4 ? "Pesadelo" 
                                    : "?"}`
        ),
        createSeparator(),
        brBuilder(
            `### ( ${icon.card_joker} ╺╸ Cartas ${game.getErisDifficulty() === 0 ? "do Dealer" : "da Éris"}`,
            game.getErisCards().map((c, index) => index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", ")
        ),
        createSeparator(),
        brBuilder(
            `### ( ${icon.card_joker} ╺╸ Suas cartas`,
            game.getUserCards().map(c => `**\`${c.name}\`**`).join(", "),
            `Mão: ${game.calculateHandValue(game.getUserCards())}`
        ),
        game.getErisDifficulty() !== 0 && createSeparator(),
        game.getErisDifficulty() !== 0 && brBuilder(
            `### ( ${humor === "happy" ? icon.Eris_happy
                : humor === "angry" ? icon.Eris_Angry
                    : humor === "sad" ? icon.Eris_cry
                        : humor === "neutral" ? icon.Eris_thinking
                            : humor === "scared" ? icon.Eris_shy
                                : humor === "surprised" ? icon.Eris_enchanted
                                    : humor === "confused" ? icon.Eris_thinking
                                        : "?"} ╺╸ Humor da Éris: ${humor === "happy" ? "Feliz"
                                            : humor === "angry" ? "Furiosa"
                                                : humor === "sad" ? "Triste"
                                                    : humor === "neutral" ? "Neutra"
                                                        : humor === "scared" ? "Assustada"
                                                            : humor === "surprised" ? "Surpresa"
                                                                : humor === "confused" ? "Confusa"
                                                                    : "?"}`,
            options?.comentary || null
        ),
        erisAction && createSeparator(),
        erisAction && `Ação da éris: ${erisAction === "hit" ? "Pegou uma carta"
            : erisAction === "pass" ? "Passou"
                : erisAction === "stand" ? "Parou"
                    : erisAction === "thinking" ? "Pensando"
                        : "?"}`,
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: `blackjack/game/hit/${userId}`,
                label: "Pegar uma carta",
                style: ButtonStyle.Primary,
                disabled: options?.disableButtons
            }),
            new ButtonBuilder({
                customId: `blackjack/game/pass/${userId}`,
                label: "Passar",
                style: ButtonStyle.Secondary,
                disabled: options?.disableButtons
            }),
            new ButtonBuilder({
                customId: `blackjack/game/stand/${userId}`,
                label: "Parar",
                style: ButtonStyle.Danger,
                disabled: options?.disableButtons || game.turnCount <= 4
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