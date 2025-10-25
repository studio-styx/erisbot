import { formatNumber, icon } from "#functions";
import { userMention } from "discord.js";

export default {
    ptbr: {
        erisMoney: `**${icon.Eris_cry} | Eu sou pobre, eu não tenho dinheiro! ${icon.Eris_shy_left}**`,
        botMoney: `${icon.denied} | Você não pode ver o saldo de um bot!`,
        message: (money: number, id: string) => {
            const messages: string[] = [];

            const formattedNumber = formatNumber(money);

            if (money > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${formattedNumber}** stx, ele poderia dividir um pouquinho comigo...`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem impressionantes **${formattedNumber}** stx!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem um saldo impressionante de **${formattedNumber}** stx!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${formattedNumber}** stx, que inveja!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${formattedNumber}** stx... eu queria ser que nem ele algum dia.`
                );
            } else if (money > 200 && money <= 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} tem **${formattedNumber}** stx.`,
                    `${icon.money_bag} | ${userMention(id)} tem **${formattedNumber}** stx, eu gostaria de ter isso...`,
                    `${icon.money_bag} | ${userMention(id)} tem **${formattedNumber}** stx, poderia ser mais ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} tem **${formattedNumber}** stx, ele deve estar feliz com esse saldo.`
                );
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} tem **${formattedNumber}** stx.`,
                    `${icon.money} | ${userMention(id)} tem **${formattedNumber}** stx... muito pouco. ${icon.Eris_cry_left}`,
                    `${icon.money} | ${userMention(id)} tem **${formattedNumber}** stx, eu não sei o que dá pra fazer só com isso...`,
                    `${icon.money} | ${userMention(id)} tem apenas **${formattedNumber}** stx, alguém ajuda ele!`,
                    `${icon.money} | ${userMention(id)} tem apenas **${formattedNumber}** stx, como alguém sobrevive assim? ${icon.Eris_cry_left}`
                );
            }

            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${formattedNumber}** stx, como ele tem coragem de andar com tudo isso no bolso? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tem **${formattedNumber}** stx, ele é bem corajoso pra carregar tudo isso!`
                );
            }

            return messages;
        },
        log: (id: string, userId: string) =>
            id === userId
                ? "Verificou o próprio saldo"
                : `Verificou o saldo de ${userMention(id)}`,
    },
    enus: {
        erisMoney: `**${icon.Eris_cry} | I'm broke... I have no money! ${icon.Eris_shy_left}**`,
        botMoney: `${icon.denied} | You can't check a bot's balance!`,
        message: (money: number, id: string) => {
            const messages: string[] = [];

            const formattedNumber = formatNumber(money);

            if (money > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${formattedNumber}** stx — they could totally share a bit with me...`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has an impressive **${formattedNumber}** stx!`,
                    `${icon.Eris_enchanted} | ${userMention(id)}'s balance is stunning: **${formattedNumber}** stx!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${formattedNumber}** stx, I'm so jealous!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${formattedNumber}** stx... I wish I could be like them someday.`
                );
            } else if (money > 200 && money <= 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} has **${formattedNumber}** stx.`,
                    `${icon.money_bag} | ${userMention(id)} has **${formattedNumber}** stx — I'd love to have that much...`,
                    `${icon.money_bag} | ${userMention(id)} has **${formattedNumber}** stx, could be better though ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} has **${formattedNumber}** stx — they must be happy with that.`
                );
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} has **${formattedNumber}** stx.`,
                    `${icon.money} | ${userMention(id)} has **${formattedNumber}** stx... that’s not much. ${icon.Eris_cry_left}`,
                    `${icon.money} | ${userMention(id)} only has **${formattedNumber}** stx, that’s kinda sad...`,
                    `${icon.money} | ${userMention(id)} has **${formattedNumber}** stx — someone should help them out!`,
                    `${icon.money} | ${userMention(id)} has only **${formattedNumber}** stx, how do they even survive? ${icon.Eris_cry_left}`
                );
            }

            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${formattedNumber}** stx — brave enough to walk around with that much cash? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} has **${formattedNumber}** stx, carrying that much is risky!`
                );
            }

            return messages;
        },
        log: (id: string, userId: string) =>
            id === userId
                ? "Checked their own balance"
                : `Checked ${userMention(id)}'s balance`,
    },
    eses: {
        erisMoney: `**${icon.Eris_cry} | ¡Estoy pobre, no tengo dinero! ${icon.Eris_shy_left}**`,
        botMoney: `${icon.denied} | ¡No puedes ver el saldo de un bot!`,
        message: (money: number, id: string) => {
            const messages: string[] = [];

            const formattedNumber = formatNumber(money);

            if (money > 800) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${formattedNumber}** stx, podría compartir un poco conmigo...`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene un impresionante saldo de **${formattedNumber}** stx!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${formattedNumber}** stx, ¡qué envidia!`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${formattedNumber}** stx... ojalá fuera como él algún día.`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${formattedNumber}** stx, definitivamente no es pobre.`
                );
            } else if (money > 200 && money <= 800) {
                messages.push(
                    `${icon.money_bag} | ${userMention(id)} tiene **${formattedNumber}** stx.`,
                    `${icon.money_bag} | ${userMention(id)} tiene **${formattedNumber}** stx, me gustaría tener tanto...`,
                    `${icon.money_bag} | ${userMention(id)} tiene **${formattedNumber}** stx, podría ser más ${icon.Eris_Angry_left}`,
                    `${icon.money_bag} | ${userMention(id)} tiene **${formattedNumber}** stx, seguramente está contento con eso.`
                );
            } else {
                messages.push(
                    `${icon.money} | ${userMention(id)} tiene **${formattedNumber}** stx.`,
                    `${icon.money} | ${userMention(id)} tiene solo **${formattedNumber}** stx... muy poco. ${icon.Eris_cry_left}`,
                    `${icon.money} | ${userMention(id)} tiene **${formattedNumber}** stx, eso no alcanza para mucho...`,
                    `${icon.money} | ${userMention(id)} apenas tiene **${formattedNumber}** stx, ¡alguien debería ayudarlo!`,
                    `${icon.money} | ${userMention(id)} tiene solo **${formattedNumber}** stx, ¿cómo sobrevive así? ${icon.Eris_cry_left}`
                );
            }

            if (money > 500) {
                messages.push(
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${formattedNumber}** stx, ¿cómo se atreve a andar con tanto dinero encima? ${icon.Eris_thinking_left}`,
                    `${icon.Eris_enchanted} | ${userMention(id)} tiene **${formattedNumber}** stx, ¡qué valiente por llevar tanto!`
                );
            }

            return messages;
        },
        log: (id: string, userId: string) =>
            id === userId
                ? "Revisó su propio saldo"
                : `Revisó el saldo de ${userMention(id)}`,
    },

}