import { icon } from "#functions";

export default {
    ptbr: {
        notEnoughMoney: `${icon.Eris_cry} | Você precisa ter no mínimo 50 STX para apostar.`,
        horces: {
            purple: { name: "Roxo", emoji: "🐎", colorEmoji: "🟣", position: 0 },
            blue: { name: "Azul", emoji: "🐎", colorEmoji: "🔵", position: 0 },
            green: { name: "Verde", emoji: "🐎", colorEmoji: "🟢", position: 0 },
            yellow: { name: "Amarelo", emoji: "🐎", colorEmoji: "🟡", position: 0 },
            orange: { name: "Laranja", emoji: "🐎", colorEmoji: "🟠", position: 0 },
            red: { name: "Vermelho", emoji: "🐎", colorEmoji: "🔴", position: 0 },
            pink: { name: "Rosa", emoji: "🐎", colorEmoji: "🌸", position: 0 },
            brown: { name: "Marrom", emoji: "🐎", colorEmoji: "🟤", position: 0 }
        },
        playing: {
            title: "🏇 Corrida de Cavalos",
        },
        end: {
            title: "🏁 Corrida Finalizada!",
            fields: {
                winner: {
                    name: "Vencedor",
                    value: (emoji: string, winner: string) => `${emoji} ${winner}`,
                },
                bet: {
                    name: "Sua aposta",
                    value: (emoji: string, winner: string) => `${emoji} ${winner}`,
                },
                result: {
                    name: "Resultado",
                    value: (isWinner: boolean, amount: number, multiplier: number) => isWinner ? 
                        `${icon.success} | Você apostou **${amount}** e ganhou ${amount * multiplier} stx!`
                        : `${icon.denied} | Você apostou **${amount}** e infelizmente perdeu ${icon.Eris_cry_left}`
                }
            }
        },
        logWinner: (horse: string, amount: number, winMultiplier: number) => `Apostou no cavalo ${horse} e ganhou ${amount * winMultiplier} stx`,
        logLoser: (horse: string, amount: number) => `Apostou no cavalo ${horse} e perdeu ${amount} stx`,
    },
    enus: {
        notEnoughMoney: `${icon.Eris_cry} | You need to have at least 50 STX to bet.`,
        horces: {
            purple: { name: "Purple", emoji: "🐎", colorEmoji: "🟣", position: 0 },
            blue: { name: "Blue", emoji: "🐎", colorEmoji: "🔵", position: 0 },
            green: { name: "Green", emoji: "🐎", colorEmoji: "🟢", position: 0 },
            yellow: { name: "Yellow", emoji: "🐎", colorEmoji: "🟡", position: 0 },
            orange: { name: "Orange", emoji: "🐎", colorEmoji: "🟠", position: 0 },
            red: { name: "Red", emoji: "🐎", colorEmoji: "🔴", position: 0 },
            pink: { name: "Pink", emoji: "🐎", colorEmoji: "🌸", position: 0 },
            brown: { name: "Brown", emoji: "🐎", colorEmoji: "🟤", position: 0 }
        },
        playing: {
            title: "🏇 Horse Race",
        },
        end: {
            title: "🏁 Race Finished!",
            fields: {
                winner: {
                    name: "Winner",
                    value: (emoji: string, winner: string) => `${emoji} ${winner}`,
                },
                bet: {
                    name: "Your bet",
                    value: (emoji: string, winner: string) => `${emoji} ${winner}`,
                },
                result: {
                    name: "Result",
                    value: (isWinner: boolean, amount: number, multiplier: number) => isWinner ? 
                        `${icon.success} | You bet **${amount}** and won ${amount * multiplier} stx!`
                        : `${icon.denied} | You bet **${amount}** and unfortunately lost ${icon.Eris_cry_left}`
                }
            }
        },
        logWinner: (horse: string, amount: number, winMultiplier: number) => `Bet on the ${horse} horse and won ${amount * winMultiplier} stx`,
        logLoser: (horse: string, amount: number) => `Bet on the ${horse} horse and lost ${amount} stx`,
    },
    eses: {
        notEnoughMoney: `${icon.Eris_cry} | Necesitas tener al menos 50 STX para apostar.`,
        horces: {
            purple: { name: "Púrpura", emoji: "🐎", colorEmoji: "🟣", position: 0 },
            blue: { name: "Azul", emoji: "🐎", colorEmoji: "🔵", position: 0 },
            green: { name: "Verde", emoji: "🐎", colorEmoji: "🟢", position: 0 },
            yellow: { name: "Amarillo", emoji: "🐎", colorEmoji: "🟡", position: 0 },
            orange: { name: "Naranja", emoji: "🐎", colorEmoji: "🟠", position: 0 },
            red: { name: "Rojo", emoji: "🐎", colorEmoji: "🔴", position: 0 },
            pink: { name: "Rosa", emoji: "🐎", colorEmoji: "🌸", position: 0 },
            brown: { name: "Marrón", emoji: "🐎", colorEmoji: "🟤", position: 0 }
        },
        playing: {
            title: "🏇 Carrera de Caballos",
        },
        end: {
            title: "🏁 ¡Carrera Finalizada!",
            fields: {
                winner: {
                    name: "Ganador",
                    value: (emoji: string, winner: string) => `${emoji} ${winner}`,
                },
                bet: {
                    name: "Tu apuesta",
                    value: (emoji: string, winner: string) => `${emoji} ${winner}`,
                },
                result: {
                    name: "Resultado",
                    value: (isWinner: boolean, amount: number, multiplier: number) => isWinner ? 
                        `${icon.success} | Apostaste **${amount}** y ganaste ${amount * multiplier} stx!`
                        : `${icon.denied} | Apostaste **${amount}** y desafortunadamente perdiste ${icon.Eris_cry_left}`
                }
            }
        },
        logWinner: (horse: string, amount: number, winMultiplier: number) => `Apostó en el caballo ${horse} y ganó ${amount * winMultiplier} stx`,
        logLoser: (horse: string, amount: number) => `Apostó en el caballo ${horse} y perdió ${amount} stx`,
    }
}