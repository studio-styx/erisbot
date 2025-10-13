import { Cards, icon } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { userMention } from "discord.js";

export default {
    ptbr: {
        errors: {
            alreadyInGame: {
                text: `${icon.denied} | Você já está jogando uma partida, você deseja deletar ela?`,
                button: "Sim"
            },
            notEnoughMoney: `${icon.denied} | Você não tem dinheiro suficiente para apostar.`
        },
        menu: {
            start: {
                chooseGameMode: (games: number) => brBuilder(
                    "# BlackJack",
                    "Escolha um modo de jogo",
                    games >= 4 ? "> Alguns modos estão desativados pois você está jogando muito." : null
                ),
                buttons: {
                    dealerClassic: "Dealer clássico",
                    erisEasy: "Éris fácil",
                    erisNormal: "Éris normal",
                    erisDifficult: "Éris dificil",
                    erisNighmare: "Pesadelo",
                    otherPlayer: "Jogar contra outro jogador"
                }
            },
            game: {
                title: (difficulty: number) => brBuilder(
                    "## 🃏 BlackJack",
                    `-# ╰ Dificuldade selecionada: ${difficulty === 0 ? "Dealer comum"
                        : difficulty === 1 ? "Fácil"
                            : difficulty === 2 ? "Normal"
                                : difficulty === 3 ? "Difícil"
                                    : difficulty === 4 ? "Pesadelo"
                                        : "?"}`
                ),
                erisHand: (erisCards: Cards[], handValue: number, difficulty: number, hide: boolean = true) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Cartas ${difficulty === 0 ? "do Dealer" : "da Éris"}`,
                    hide ? erisCards.map((c, index) => index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", ") : erisCards.map(c => `**\`${c.name}\`**`).join(", "),
                    !hide ? `Mão: ${handValue}` : null
                ),
                userHand: (userCards: Cards[], handValue: number) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Suas cartas`,
                    userCards.map(c => `**\`${c.name}\`**`).join(", "),
                    `Mão: ${handValue}`
                ),
                humor: (humor: string) => brBuilder(
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
                ),
                winsMessage: (wins: "eris" | "user" | "draw", amount: number, multiplier: number) => wins === "eris" ?
                    `## Você apostou: ${amount} stx e perdeu!`
                    : wins === "user"
                        ? `## Você apostou: ${amount} stx e ganhou: ${(amount * multiplier) % 1 === 0
                            ? (amount * multiplier)
                            : (amount * multiplier).toFixed(2)
                        } stx!`
                        : `## Você apostou: ${amount} stx e a partida acabou em empate!`,
                erisAction: (action: "hit" | "pass" | "stand" | "thinking" | undefined) => `Ação da éris: ${action === "hit" ? "Pegou uma carta"
                    : action === "pass" ? "Passou"
                        : action === "stand" ? "Parou"
                            : action === "thinking" ? "Pensando"
                                : "?"}`,
                buttons: {
                    hit: "Pegar uma carta",
                    pass: "Passar",
                    stand: "Parar"
                }
            },
            multiplayerGame: {
                title: (userId: string, targetId: string, amount: number) => brBuilder(
                    `## Partida de Blackjack Multiplayer`,
                    `**Jogador 1:** ${userMention(userId)}`,
                    `**Jogador 2:** ${userMention(targetId)}`,
                    `**Aposta:** ${amount} stx`,
                ),
                userHand: (userId: string, userCards: Cards[], handValue: number, endGame?: boolean) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Cartas de ${userMention(userId)}`,
                    userCards.map((c, index) => endGame ? `**\`${c.name}\`**` : index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", "),
                    endGame ? `**Valor da mão:** **${handValue}**` : null
                ),
                turn: (endGame: boolean, turn: "user" | "target", userId: string, targetId: string) => endGame ? endGame : `**Turno de:** ${turn === "user" ? userMention(userId) : userMention(targetId)}`,
                buttons: {
                    hit: "Pegar uma carta",
                    pass: "Passar",
                    stand: "Parar"
                }
            }
        }
    },
    enus: {
        errors: {
            alreadyInGame: {
                text: `${icon.denied} | You are already in a game, do you want to delete it?`,
                button: "Yes"
            },
            notEnoughMoney: `${icon.denied} | You don't have enough money to bet.`
        },
        menu: {
            start: {
                chooseGameMode: (games: number) => brBuilder(
                    "# BlackJack",
                    "Choose a game mode",
                    games >= 4 ? "> Some modes are disabled because you're playing too much." : null
                ),
                buttons: {
                    dealerClassic: "Classic dealer",
                    erisEasy: "Eris easy",
                    erisNormal: "Eris normal",
                    erisDifficult: "Eris difficult",
                    erisNighmare: "Nightmare",
                    otherPlayer: "Play against another player"
                }
            },
            game: {
                title: (difficulty: number) => brBuilder(
                    "## 🃏 BlackJack",
                    `-# ╰ Selected difficulty: ${difficulty === 0 ? "Common dealer"
                        : difficulty === 1 ? "Easy"
                            : difficulty === 2 ? "Normal"
                                : difficulty === 3 ? "Difficult"
                                    : difficulty === 4 ? "Nightmare"
                                        : "?"}`
                ),
                erisHand: (erisCards: Cards[], handValue: number, difficulty: number, hide: boolean = true) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ ${difficulty === 0 ? "Dealer's" : "Eris'"} Cards`,
                    hide ? erisCards.map((c, index) => index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", ") : erisCards.map(c => `**\`${c.name}\`**`).join(", "),
                    !hide ? `Hand: ${handValue}` : null
                ),
                userHand: (userCards: Cards[], handValue: number) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Your cards`,
                    userCards.map(c => `**\`${c.name}\`**`).join(", "),
                    `Hand: ${handValue}`
                ),
                humor: (humor: string) => brBuilder(
                    `### ( ${humor === "happy" ? icon.Eris_happy
                        : humor === "angry" ? icon.Eris_Angry
                            : humor === "sad" ? icon.Eris_cry
                                : humor === "neutral" ? icon.Eris_thinking
                                    : humor === "scared" ? icon.Eris_shy
                                        : humor === "surprised" ? icon.Eris_enchanted
                                            : humor === "confused" ? icon.Eris_thinking
                                                : "?"} ╺╸ Eris' Mood: ${humor === "happy" ? "Happy"
                                                    : humor === "angry" ? "Furious"
                                                        : humor === "sad" ? "Sad"
                                                            : humor === "neutral" ? "Neutral"
                                                                : humor === "scared" ? "Calm"
                                                                    : humor === "surprised" ? "Surprised"
                                                                        : humor === "confused" ? "Confused"
                                                                            : "?"}`,
                ),
                winsMessage: (wins: "eris" | "user" | "draw", amount: number, multiplier: number) => wins === "eris" ?
                    `## You bet: ${amount} stx and lost!`
                    : wins === "user"
                        ? `## You bet: ${amount} stx and won: ${(amount * multiplier) % 1 === 0
                            ? (amount * multiplier)
                            : (amount * multiplier).toFixed(2)
                        } stx!`
                        : `## You bet: ${amount} stx and the match ended in a draw!`,
                erisAction: (action: "hit" | "pass" | "stand" | "thinking" | undefined) => `Eris' action: ${action === "hit" ? "Took a card"
                    : action === "pass" ? "Passed"
                        : action === "stand" ? "Stood"
                            : action === "thinking" ? "Thinking"
                                : "?"}`,
                buttons: {
                    hit: "Take a card",
                    pass: "Pass",
                    stand: "Stand"
                }
            },
            multiplayerGame: {
                title: (userId: string, targetId: string, amount: number) => brBuilder(
                    `## Blackjack Multiplayer Match`,
                    `**Player 1:** ${userMention(userId)}`,
                    `**Player 2:** ${userMention(targetId)}`,
                    `**Bet:** ${amount} stx`,
                ),
                userHand: (userId: string, userCards: Cards[], handValue: number, endGame?: boolean) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ ${userMention(userId)}'s cards`,
                    userCards.map((c, index) => endGame ? `**\`${c.name}\`**` : index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", "),
                    endGame ? `**Hand value:** **${handValue}**` : null
                ),
                turn: (endGame: boolean, turn: "user" | "target", userId: string, targetId: string) => endGame ? endGame : `**Turn of:** ${turn === "user" ? userMention(userId) : userMention(targetId)}`,
                buttons: {
                    hit: "Take a card",
                    pass: "Pass",
                    stand: "Stand"
                }
            }
        },
    },
    eses: {
        errors: {
            alreadyInGame: {
                text: `${icon.denied} | Ya estás en una partida, ¿quieres eliminarla?`,
                button: "Sí"
            },
            notEnoughMoney: `${icon.denied} | No tienes suficiente dinero para apostar.`
        },
        menu: {
            start: {
                chooseGameMode: (games: number) => brBuilder(
                    "# BlackJack",
                    "Elige un modo de juego",
                    games >= 4 ? "> Algunos modos están desactivados porque estás jugando demasiado." : null
                ),
                buttons: {
                    dealerClassic: "Dealer clásico",
                    erisEasy: "Éris fácil",
                    erisNormal: "Éris normal",
                    erisDifficult: "Éris difícil",
                    erisNighmare: "Pesadilla",
                    otherPlayer: "Jugar contra otro jugador"
                }
            },
            game: {
                title: (difficulty: number) => brBuilder(
                    "## 🃏 BlackJack",
                    `-# ╰ Dificultad seleccionada: ${difficulty === 0 ? "Dealer común"
                        : difficulty === 1 ? "Fácil"
                            : difficulty === 2 ? "Normal"
                                : difficulty === 3 ? "Difícil"
                                    : difficulty === 4 ? "Pesadilla"
                                        : "?"}`
                ),
                erisHand: (erisCards: Cards[], handValue: number, difficulty: number, hide: boolean = true) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Cartas ${difficulty === 0 ? "del Dealer" : "de Éris"}`,
                    hide ? erisCards.map((c, index) => index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", ") : erisCards.map(c => `**\`${c.name}\`**`).join(", "),
                    !hide ? `Mano: ${handValue}` : null
                ),
                userHand: (userCards: Cards[], handValue: number) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Tus cartas`,
                    userCards.map(c => `**\`${c.name}\`**`).join(", "),
                    `Mano: ${handValue}`
                ),
                humor: (humor: string) => brBuilder(
                    `### ( ${humor === "happy" ? icon.Eris_happy
                        : humor === "angry" ? icon.Eris_Angry
                            : humor === "sad" ? icon.Eris_cry
                                : humor === "neutral" ? icon.Eris_thinking
                                    : humor === "scared" ? icon.Eris_shy
                                        : humor === "surprised" ? icon.Eris_enchanted
                                            : humor === "confused" ? icon.Eris_thinking
                                                : "?"} ╺╸ Humor de Éris: ${humor === "happy" ? "Feliz"
                                                    : humor === "angry" ? "Furiosa"
                                                        : humor === "sad" ? "Triste"
                                                            : humor === "neutral" ? "Neutral"
                                                                : humor === "scared" ? "Calma"
                                                                    : humor === "surprised" ? "Sorprendida"
                                                                        : humor === "confused" ? "Confusa"
                                                                            : "?"}`,
                ),
                winsMessage: (wins: "eris" | "user" | "draw", amount: number, multiplier: number) => wins === "eris" ?
                    `## Apostaste: ${amount} stx y ¡perdiste!`
                    : wins === "user"
                        ? `## Apostaste: ${amount} stx y ¡ganaste: ${(amount * multiplier) % 1 === 0
                            ? (amount * multiplier)
                            : (amount * multiplier).toFixed(2)
                        } stx!`
                        : `## Apostaste: ${amount} stx y ¡la partida terminó en empate!`,
                erisAction: (action: "hit" | "pass" | "stand" | "thinking" | undefined) => `Acción de Éris: ${action === "hit" ? "Tomó una carta"
                    : action === "pass" ? "Pasó"
                        : action === "stand" ? "Se plantó"
                            : action === "thinking" ? "Pensando"
                                : "?"}`,
                buttons: {
                    hit: "Tomar una carta",
                    pass: "Pasar",
                    stand: "Plantarse"
                }
            },
            multiplayerGame: {
                title: (userId: string, targetId: string, amount: number) => brBuilder(
                    `## Partida de Blackjack Multijugador`,
                    `**Jugador 1:** ${userMention(userId)}`,
                    `**Jugador 2:** ${userMention(targetId)}`,
                    `**Apuesta:** ${amount} stx`,
                ),
                userHand: (userId: string, userCards: Cards[], handValue: number, endGame?: boolean) => brBuilder(
                    `### ( ${icon.card_joker} ╺╸ Cartas de ${userMention(userId)}`,
                    userCards.map((c, index) => endGame ? `**\`${c.name}\`**` : index === 0 ? `**\`${c.name}\`**` : "**\`?\`**").join(", "),
                    endGame ? `**Valor de la mano:** **${handValue}**` : null
                ),
                turn: (endGame: boolean, turn: "user" | "target", userId: string, targetId: string) => endGame ? endGame : `**Turno de:** ${turn === "user" ? userMention(userId) : userMention(targetId)}`,
                buttons: {
                    hit: "Tomar una carta",
                    pass: "Pasar",
                    stand: "Plantarse"
                }
            }
        },
    }
}