import { icon } from "#functions";

export default {
    ptbr: {
        notEnoughMoney: `${icon.denied} | Você não tem dinheiro suficiente para apostar.`,
        embed: {
            title: "🎰 Caça-Níqueis",
            description: {
                slot1: (slot1: string) => `${slot1} | - | - \n\nGirando...`,
                slot2: (slot1: string, slot2: string) => `${slot1} | ${slot2} | - \n\nGirando...`,
                winMessage: (slot1: string, slot2: string, slot3: string, winAmount: number) => `${slot1} | ${slot2} | ${slot3}\n\n${icon.success} **JACKPOT!** Você ganhou **${winAmount}** STX!`,
                loseMessage: (slot1: string, slot2: string, slot3: string, amount: number) => `${slot1} | ${slot2} | ${slot3}\n\nVocê perdeu **${amount}** STX.`
            }
        },
        log: (isWin: boolean, winAmount: number, amount: number) => `Apostou no caça-níqueis e ${isWin ? `ganhou ${winAmount} stx` : `perdeu ${amount} stx`}`
    },
    enus: {
        notEnoughMoney: `${icon.denied} | You don't have enough money to bet.`,
        embed: {
            title: "🎰 Slot Machine",
            description: {
                slot1: (slot1: string) => `${slot1} | - | - \n\nSpinning...`,
                slot2: (slot1: string, slot2: string) => `${slot1} | ${slot2} | - \n\nSpinning...`,
                winMessage: (slot1: string, slot2: string, slot3: string, winAmount: number) => `${slot1} | ${slot2} | ${slot3}\n\n${icon.success} **JACKPOT!** You won **${winAmount}** STX!`,
                loseMessage: (slot1: string, slot2: string, slot3: string, amount: number) => `${slot1} | ${slot2} | ${slot3}\n\nYou lost **${amount}** STX.`
            }
        },
        log: (isWin: boolean, winAmount: number, amount: number) => `Bet on slots and ${isWin ? `won ${winAmount} stx` : `lost ${amount} stx`}`
    },
    eses: {
        notEnoughMoney: `${icon.denied} | No tienes suficiente dinero para apostar.`,
        embed: {
            title: "🎰 Tragaperras",
            description: {
                slot1: (slot1: string) => `${slot1} | - | - \n\nGirando...`,
                slot2: (slot1: string, slot2: string) => `${slot1} | ${slot2} | - \n\nGirando...`,
                winMessage: (slot1: string, slot2: string, slot3: string, winAmount: number) => `${slot1} | ${slot2} | ${slot3}\n\n${icon.success} **¡JACKPOT!** ¡Ganaste **${winAmount}** STX!`,
                loseMessage: (slot1: string, slot2: string, slot3: string, amount: number) => `${slot1} | ${slot2} | ${slot3}\n\nPerdiste **${amount}** STX.`
            }
        },
        log: (isWin: boolean, winAmount: number, amount: number) => `Apostó en la tragaperras y ${isWin ? `ganó ${winAmount} stx` : `perdió ${amount} stx`}`
    }
}