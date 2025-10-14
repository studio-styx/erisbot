import { icon } from "#functions";

type Side = "heads" | "tails";

export default {
    ptbr: {
        errors: {
            notEnoughMoney: `${icon.denied} | Você não tem dinheiro suficiente para apostar.`
        },
        won: (side: Side, wonValue: number) => `${icon.Eris_enchanted} | A moeda caiu em ${side === "heads" ? "cara" : "coroa"}, você ganhou **${wonValue}** STX!`,
        wonLog: (side: Side, wonValue: number) => `Apostou na moeda do lado ${side} e ganhou ${wonValue} stx`,
        lose: (side: Side, amount: number) => `${icon.Eris_shy} | A moeda caiu em ${side}, você perdeu **${amount}** STX!`,
        loseLog: (side: Side, amount: number) => `Apostou na moeda do lado ${side} e perdeu ${amount} stx`
    },
    enus: {
        errors: {
            notEnoughMoney: `${icon.denied} | You don't have enough money to bet.`
        },
        won: (side: Side, wonValue: number) => `${icon.Eris_enchanted} | The coin landed on ${side === "heads" ? "heads" : "tails"}, you won **${wonValue}** STX!`,
        wonLog: (side: Side, wonValue: number) => `Bet on the coin on ${side} side and won ${wonValue} stx`,
        lose: (side: Side, amount: number) => `${icon.Eris_shy} | The coin landed on ${side}, you lost **${amount}** STX!`,
        loseLog: (side: Side, amount: number) => `Bet on the coin on ${side} side and lost ${amount} stx`
    },
    eses: {
        errors: {
            notEnoughMoney: `${icon.denied} | No tienes suficiente dinero para apostar.`
        },
        won: (side: Side, wonValue: number) => `${icon.Eris_enchanted} | La moneda cayó en ${side === "heads" ? "cara" : "cruz"}, ¡ganaste **${wonValue}** STX!`,
        wonLog: (side: Side, wonValue: number) => `Apostó en la moneda del lado ${side === "heads" ? "cara" : "cruz"} y ganó ${wonValue} stx`,
        lose: (side: Side, amount: number) => `${icon.Eris_shy} | La moneda cayó en ${side === "heads" ? "cara" : "cruz"}, ¡perdiste **${amount}** STX!`,
        loseLog: (side: Side, amount: number) => `Apostó en la moneda del lado ${side === "heads" ? "cara" : "cruz"} y perdió ${amount} stx`
    }
}