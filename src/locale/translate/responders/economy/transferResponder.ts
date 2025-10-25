import { icon } from "#functions"
import { Transaction } from "#prisma"
import { userMention } from "discord.js"

export default {
    ptbr: {
        manyAttempts: (count: number) => {
            const messages: string[] = []
            if (count === 1) {
                messages.push(
                    `${icon.denied} | Eu já te disse que essa transação não é sua!`,
                    `${icon.denied} | Ei por quê você ainda tá tentando roubar dinheiro dos outros? isso não é legal! ${icon.Eris_Angry_left}`,
                    `${icon.denied} | Ei! tem usuários querendo paz aqui!`
                )
            } else if (count === 2) {
                messages.push(
                    `${icon.Eris_Angry} | Ei volte pra onde veio seu ladrãozinho!`,
                    `${icon.Eris_Angry} | Essa já é sua terceira tentativa tentando roubar dinheiro dos outros, já te disse que isso não é possivel!`,
                    `${icon.Eris_Angry} | Você não conseguirá furar essa transação!`
                )
            } else if (count === 3) {
                messages.push(
                    `${icon.Eris_Angry} | Eu não irei repetir! volte pra onde veio!`,
                    `${icon.Eris_Angry} | Eu vou começar a te ignorar!`,
                    `${icon.Eris_Angry} | Pode ficar ai tentando roubar, você não terá mais respostas.`,
                )
            }

            return messages;
        },
        firstAttempt: [
            "Você não pode usar este botão!",
            "Você está tentando pegar dinheiro dos outros? não tente mais isso!",
            `Essa transação não é para você! ${icon.Eris_Angry_left}`,
        ],
        processing: `${icon.waiting_white} | Processando a transação...`,
        insufficientFunds: {
            followUpMessage: `${icon.denied} | Saldo insuficiente!`,
            throwMessage: 'Saldo insuficiente'
        },
        expired: {
            followUpMessage: `${icon.Eris_cry} | Você demorou demais para aceitar essa transação, por isso ela foi fechada!`,
            throwMessage: 'Essa transação foi expirada!'
        },
        alreadyConcluded: {
            followUpMessage: `${icon.denied} | Essa transação já foi concluída!`,
            throwMessage: 'Essa transação já foi concluída'
        },
        log: {
            author: (transaction: { amount: number }, targetId: string) => `Deu **${transaction.amount} stx** para: ${userMention(targetId)}`,
            targetId: (transaction: { amount: number }, authorId: string) => `Recebeu **${transaction.amount} stx** de: ${userMention(authorId)}`
        },
        success: (transaction: Transaction) => `${icon.Eris_happy} | O usuário ${userMention(transaction.userId)} enviou **${transaction.amount} stx** para ${userMention(transaction.targetId!)}!`,
        buttonConfirm: (acceptedCount: number) => `Confirmar ( ${acceptedCount}/2 )`,
        errorMessage: (message: string) => `Erro na transferência: ${message}`
    },
    enus: {
        manyAttempts: (count: number) => {
            const messages: string[] = []
            if (count === 1) {
                messages.push(
                    `${icon.denied} | I already told you that this transaction isn't yours!`,
                    `${icon.denied} | Hey, why are you still trying to steal money from others? That's not cool! ${icon.Eris_Angry_left}`,
                    `${icon.denied} | Hey! There are users who want peace here!`
                )
            } else if (count === 2) {
                messages.push(
                    `${icon.Eris_Angry} | Hey, go back where you came from, you little thief!`,
                    `${icon.Eris_Angry} | This is already your third attempt trying to steal money from others, I already told you it's not possible!`,
                    `${icon.Eris_Angry} | You won't be able to breach this transaction!`
                )
            } else if (count === 3) {
                messages.push(
                    `${icon.Eris_Angry} | I won't repeat myself! Go back where you came from!`,
                    `${icon.Eris_Angry} | I'm going to start ignoring you!`,
                    `${icon.Eris_Angry} | You can keep trying to steal, you won't get any more responses.`,
                )
            }

            return messages;
        },
        firstAttempt: [
            "You cannot use this button!",
            "Are you trying to take money from others? Don't try that again!",
            `This transaction is not for you! ${icon.Eris_Angry_left}`,
        ],
        processing: `${icon.waiting_white} | Processing transaction...`,
        insufficientFunds: {
            followUpMessage: `${icon.denied} | Insufficient funds!`,
            throwMessage: 'Insufficient funds'
        },
        expired: {
            followUpMessage: `${icon.Eris_cry} | You took too long to accept this transaction, so it was closed!`,
            throwMessage: 'This transaction has expired!'
        },
        alreadyConcluded: {
            followUpMessage: `${icon.denied} | This transaction has already been completed!`,
            throwMessage: 'This transaction has already been completed'
        },
        log: {
            author: (transaction: { amount: number }, targetId: string) => `Gave **${transaction.amount} stx** to: ${userMention(targetId)}`,
            targetId: (transaction: { amount: number }, authorId: string) => `Received **${transaction.amount} stx** from: ${userMention(authorId)}`
        },
        success: (transaction: Transaction) => `${icon.Eris_happy} | User ${userMention(transaction.userId)} sent **${transaction.amount} stx** to ${userMention(transaction.targetId!)}!`,
        buttonConfirm: (acceptedCount: number) => `Confirm ( ${acceptedCount}/2 )`,
        errorMessage: (message: string) => `Transfer error: ${message}`
    },
    eses: {
        manyAttempts: (count: number) => {
            const messages: string[] = []
            if (count === 1) {
                messages.push(
                    `${icon.denied} | ¡Ya te dije que esta transacción no es tuya!`,
                    `${icon.denied} | ¡Oye, por qué sigues intentando robar dinero de otros? ¡eso no está bien! ${icon.Eris_Angry_left}`,
                    `${icon.denied} | ¡Oye! ¡hay usuarios que quieren paz aquí!`
                )
            } else if (count === 2) {
                messages.push(
                    `${icon.Eris_Angry} | ¡Oye, vuelve de donde viniste, pequeño ladrón!`,
                    `${icon.Eris_Angry} | ¡Este ya es tu tercer intento de robar dinero de otros, ya te dije que no es posible!`,
                    `${icon.Eris_Angry} | ¡No podrás vulnerar esta transacción!`
                )
            } else if (count === 3) {
                messages.push(
                    `${icon.Eris_Angry} | ¡No voy a repetirme! ¡vuelve de donde viniste!`,
                    `${icon.Eris_Angry} | ¡Voy a empezar a ignorarte!`,
                    `${icon.Eris_Angry} | Puedes seguir intentando robar, no tendrás más respuestas.`,
                )
            }

            return messages;
        },
        firstAttempt: [
            "¡No puedes usar este botón!",
            "¿Estás intentando tomar dinero de otros? ¡No intentes eso de nuevo!",
            `¡Esta transacción no es para ti! ${icon.Eris_Angry_left}`,
        ],
        processing: `${icon.waiting_white} | Procesando la transacción...`,
        insufficientFunds: {
            followUpMessage: `${icon.denied} | ¡Fondos insuficientes!`,
            throwMessage: 'Fondos insuficientes'
        },
        expired: {
            followUpMessage: `${icon.Eris_cry} | ¡Te demoraste demasiado en aceptar esta transacción, por eso fue cerrada!`,
            throwMessage: '¡Esta transacción ha expirado!'
        },
        alreadyConcluded: {
            followUpMessage: `${icon.denied} | ¡Esta transacción ya ha sido completada!`,
            throwMessage: 'Esta transacción ya ha sido completada'
        },
        log: {
            author: (transaction: { amount: number }, targetId: string) => `Dió **${transaction.amount} stx** a: ${userMention(targetId)}`,
            targetId: (transaction: { amount: number }, authorId: string) => `Recibió **${transaction.amount} stx** de: ${userMention(authorId)}`
        },
        success: (transaction: Transaction) => `${icon.Eris_happy} | ¡El usuario ${userMention(transaction.userId)} envió **${transaction.amount} stx** a ${userMention(transaction.targetId!)}!`,
        buttonConfirm: (acceptedCount: number) => `Confirmar ( ${acceptedCount}/2 )`,
        errorMessage: (message: string) => `Error en la transferencia: ${message}`
    }
}