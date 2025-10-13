import { icon } from "#functions";

export default {
    ptbr: {
        deposit: {
            notEnoughMoney: `${icon.Eris_cry} | Parece que você não tem dinheiro suficiente para realizar essa transação.`,
            message: (value: number, bank: number) => `${icon.Eris_ok} | Depósito de: **\`${value}\`** stx realizado com sucesso! agora você possui: **\`${bank}\`** em sua conta bancária`,
            log: (value: number) => `Depositou ${value} stx na conta bancária`
        },
        withdraw: {
            notEnoughMoney: `${icon.Eris_cry} | Parece que você não tem dinheiro suficiente para realizar essa transação.`,
            message: (value: number, money: number) => `${icon.Eris_ok} | Saque de: **\`${value}\`** stx realizado com sucesso! agora você possui: **\`${money}\`** em sua carteira!`,
            log: (value: number) => `Saque de ${value} stx da conta bancária`
        }
    },
    enus: {
        deposit: {
            notEnoughMoney: `${icon.Eris_cry} | It seems you don't have enough money to complete this transaction.`,
            message: (value: number, bank: number) => `${icon.Eris_ok} | Deposit of: **\`${value}\`** stx completed successfully! You now have: **\`${bank}\`** in your bank account`,
            log: (value: number) => `Deposited ${value} stx into bank account`
        },
        withdraw: {
            notEnoughMoney: `${icon.Eris_cry} | It seems you don't have enough money to complete this transaction.`,
            message: (value: number, money: number) => `${icon.Eris_ok} | Withdrawal of: **\`${value}\`** stx completed successfully! You now have: **\`${money}\`** in your wallet!`,
            log: (value: number) => `Withdrew ${value} stx from bank account`
        }
    },
    eses: {
        deposit: {
            notEnoughMoney: `${icon.Eris_cry} | Parece que no tienes suficiente dinero para completar esta transacción.`,
            message: (value: number, bank: number) => `${icon.Eris_ok} | ¡Depósito de: **\`${value}\`** stx realizado con éxito! Ahora tienes: **\`${bank}\`** en tu cuenta bancaria`,
            log: (value: number) => `Depositó ${value} stx en la cuenta bancaria`
        },
        withdraw: {
            notEnoughMoney: `${icon.Eris_cry} | Parece que no tienes suficiente dinero para completar esta transacción.`,
            message: (value: number, money: number) => `${icon.Eris_ok} | ¡Retiro de: **\`${value}\`** stx realizado con éxito! Ahora tienes: **\`${money}\`** en tu cartera!`,
            log: (value: number) => `Retiró ${value} stx de la cuenta bancaria`
        }
    }
}