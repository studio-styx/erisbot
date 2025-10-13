import { icon } from "#functions";
import { userMention } from "discord.js";

export default {
    ptbr: {
        erisMoney: `**${icon.Eris_cry} | Eu sou pobre, eu não tenho dinheiro! ${icon.Eris_shy_left}**`,
        botMoney: `${icon.denied} | Você não pode ver o saldo de um bot!`,
        message: (money: number, bank: number, id: string) => {
            const messages: string[] = [];
            if (money + bank > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu acho que ele poderia dividir`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem impressionantes: **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem um saldo impressionante: **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, que inveja!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu queria ser que nem ele algum dia...`,
                )
            } else if (money + bank > 200 && money + bank < 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária.`,
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu gostaria de ter isso...`,
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, poderia ser mais ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, ele deve estar feliz com tudo isso de dinheiro`,
                )
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária.`,
                    `${icon.money} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, muito pouco...`,
                    `${icon.money} | ${userMention(id)} tem **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu não sei o que fazer só com isso...`,
                    `${icon.money} | ${userMention(id)} tem apenas **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, eu acho que a gente deveria dividir com ele...`,
                    `${icon.money} | ${userMention(id)} tem apenas **${money}** stx em sua carteira e **${bank}** stx em sua conta bancária, como alguem consegue sobreviver só com isso ${icon.Eris_cry_left}`
                )
            }
            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua conta e **${bank}** stx em sua conta bancária, como que ele tem coragem pra andar com tudo isso no bolso? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${money}** stx em sua conta e **${bank}** stx em sua conta bancária, ele tem muita coragem pra andar com tudo isso no bolso!`,
                )
            }

            return messages;
        },
        log: (id: string, userId: string) => id === userId ? "Verificou o próprio saldo" : `Verificou o saldo de ${userMention(id)}`,
    },
    enus: {
        erisMoney: `**${icon.Eris_cry} | I'm poor, I don't have any money! ${icon.Eris_shy_left}**`,
        botMoney: `${icon.denied} | You can't check a bot's balance!`,
        message: (money: number, bank: number, id: string) => {
            const messages: string[] = [];
            if (money + bank > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, I think they could share`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has impressive: **${money}** stx in their wallet and **${bank}** stx in their bank account!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has an impressive balance: **${money}** stx in their wallet and **${bank}** stx in their bank account!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, so jealous!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, I wish I could be like them someday...`,
                )
            } else if (money + bank > 200 && money + bank < 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account.`,
                    `${icon.money_bag} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, I wish I had that...`,
                    `${icon.money_bag} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, could be more ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, they must be happy with all that money`,
                )
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account.`,
                    `${icon.money} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, so little...`,
                    `${icon.money} | ${userMention(id)} has **${money}** stx in their wallet and **${bank}** stx in their bank account, I don't know what to do with just that...`,
                    `${icon.money} | ${userMention(id)} has only **${money}** stx in their wallet and **${bank}** stx in their bank account, I think we should share with them...`,
                    `${icon.money} | ${userMention(id)} has only **${money}** stx in their wallet and **${bank}** stx in their bank account, how can someone survive with just that ${icon.Eris_cry_left}`
                )
            }
            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${money}** stx in their account and **${bank}** stx in their bank account, how do they have the courage to walk around with all that in their pocket? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${money}** stx in their account and **${bank}** stx in their bank account, they have a lot of courage to walk around with all that in their pocket!`,
                )
            }

            return messages;
        },
        log: (id: string, userId: string) => id === userId ? "Checked their own balance" : `Checked ${userMention(id)}'s balance`,
    },

    eses: {
        erisMoney: `**${icon.Eris_cry} | ¡Soy pobre, no tengo dinero! ${icon.Eris_shy_left}**`,
        botMoney: `${icon.denied} | ¡No puedes ver el saldo de un bot!`,
        message: (money: number, bank: number, id: string) => {
            const messages: string[] = [];
            if (money + bank > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, creo que podría compartir`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene impresionantes: **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene un saldo impresionante: **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, ¡qué envidia!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, ojalá fuera como él algún día...`,
                )
            } else if (money + bank > 200 && money + bank < 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria.`,
                    `${icon.money_bag} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, me gustaría tener eso...`,
                    `${icon.money_bag} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, podría ser más ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, debe estar feliz con todo ese dinero`,
                )
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria.`,
                    `${icon.money} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, muy poco...`,
                    `${icon.money} | ${userMention(id)} tiene **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, no sé qué hacer solo con eso...`,
                    `${icon.money} | ${userMention(id)} tiene solo **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, creo que deberíamos compartir con él...`,
                    `${icon.money} | ${userMention(id)} tiene solo **${money}** stx en su cartera y **${bank}** stx en su cuenta bancaria, ¿cómo alguien puede sobrevivir solo con eso? ${icon.Eris_cry_left}`
                )
            }
            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${money}** stx en su cuenta y **${bank}** stx en su cuenta bancaria, ¿cómo tiene coraje para andar con todo eso en el bolsillo? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${money}** stx en su cuenta y **${bank}** stx en su cuenta bancaria, ¡tiene mucho coraje para andar con todo eso en el bolsillo!`,
                )
            }

            return messages;
        },
        log: (id: string, userId: string) => id === userId ? "Verificó su propio saldo" : `Verificó el saldo de ${userMention(id)}`,
    }
}