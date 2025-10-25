import { formatNumber, icon } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { time, userMention } from "discord.js";

export default {
    ptbr: {
        cooldown: (cooldown: Date) => `**${icon.denied_pink} | Eu sei que distribuir dinheiro é legal, mas por favor aguarde um pouco, volte ${time(cooldown)}**`,
        firstUse: `${icon.denied} | Ei! por quê você não tenta usar outros comandos? sua primeira vez aqui e já quer dar dinheiro pros outros! ${icon.Eris_Angry_left}`,
        notEnoughMoney: `${icon.denied} | Parece que você não tem dinheiro suficiente para realizar essa transação. ${icon.Eris_cry_left}`,
        manyTransferContainer: {
            title: `## Transação`,
            description: (value: number) => brBuilder(
                "Você não mencionou nenhum usuário para fazer a transação, por isso você pode escolher 1 ou mais usuários para transferir stx de maneira rápida e fácil!",
                "",
                "Os usuários escolhidos tem que aceitar a transação, o máximo de usuários para a transação é **10**, para evitar abusos, mas **atenção**: você precisa ter a quantidade de stx que irá distribuir pra cada usuário, ou seja, se vc quer distribuir 50 stx para 4 usuários, então você precisa ter 50 vezes 4 stx que é: 200",
                "",
                `Se o limite de usuários for menor que 10, significa que você não tem o dinheiro necessário para transferir **${formatNumber(value)}** para 10 usuários`,
                "",
                "Por favor escolha os usuários para distribuir os seus stx!"
            ),
            placeholder: "Usuários a transferir o dinheiro"
        },
        ownTransfer: `**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra você mesmo? se for pra dá dinheiro dá pra mim!**`,
        erisTransfer: `**${icon.denied_pink} | Eu queria tanto poder receber esse dinheiro! mas minhas regras não permitem isso! ${icon.Eris_cry_left}**`,
        botTransfer: `**${icon.denied_pink} | Ei! por quê você está tentando dar dinheiro pra um bot? se for pra dá dinheiro dá pra mim!**`,
        embed: {
            title: "Transferência",
            description: (authorId: string, targetId: string, value: number) => `${icon.alarm} | ${userMention(authorId)} quer enviar **${formatNumber(value)}** styx para ${userMention(targetId)}, ambos precisam apertar no botão abaixo para que a transferência seja concluida`,
        },
        button: "Confirmar ( 0/2 )"
    },
    enus: {
        cooldown: (cooldown: Date) => `**${icon.denied_pink} | I know giving away money is fun, but please wait a bit, come back ${time(cooldown)}**`,
        firstUse: `${icon.denied} | Hey! Why don't you try using other commands? Your first time here and already want to give money to others! ${icon.Eris_Angry_left}`,
        notEnoughMoney: `${icon.denied} | It seems you don't have enough money to complete this transaction. ${icon.Eris_cry_left}`,
        manyTransferContainer: {
            title: `## Transaction`,
            description: (value: number) => brBuilder(
                "You didn't mention any user for the transaction, so you can choose 1 or more users to transfer stx quickly and easily!",
                "",
                "The chosen users have to accept the transaction, the maximum users for a transaction is **10**, to avoid abuse, but **attention**: you need to have the amount of stx you will distribute to each user, meaning if you want to distribute 50 stx to 4 users, then you need to have 50 times 4 stx which is: 200",
                "",
                `If the user limit is less than 10, it means you don't have the necessary money to transfer **${formatNumber(value)}** to 10 users`,
                "",
                "Please choose the users to distribute your stx!"
            ),
            placeholder: "Users to transfer money to"
        },
        ownTransfer: `**${icon.denied_pink} | Hey! Why are you trying to give money to yourself? If you want to give money, give it to me!**`,
        erisTransfer: `**${icon.denied_pink} | I wish I could receive this money! But my rules don't allow it! ${icon.Eris_cry_left}**`,
        botTransfer: `**${icon.denied_pink} | Hey! Why are you trying to give money to a bot? If you want to give money, give it to me!**`,
        embed: {
            title: "Transfer",
            description: (authorId: string, targetId: string, value: number) => `${icon.alarm} | ${userMention(authorId)} wants to send **${formatNumber(value)}** styx to ${userMention(targetId)}, both need to click the button below for the transfer to be completed`,
        },
        button: "Confirm ( 0/2 )"
    },
    eses: {
        cooldown: (cooldown: Date) => `**${icon.denied_pink} | Sé que repartir dinero es divertido, pero por favor espera un poco, vuelve ${time(cooldown)}**`,
        firstUse: `${icon.denied} | ¡Oye! ¿Por qué no intentas usar otros comandos? ¡Es tu primera vez aquí y ya quieres dar dinero a los demás! ${icon.Eris_Angry_left}`,
        notEnoughMoney: `${icon.denied} | Parece que no tienes suficiente dinero para completar esta transacción. ${icon.Eris_cry_left}`,
        manyTransferContainer: {
            title: `## Transacción`,
            description: (value: number) => brBuilder(
                "No mencionaste ningún usuario para la transacción, por eso puedes elegir 1 o más usuarios para transferir stx de manera rápida y fácil!",
                "",
                "Los usuarios elegidos tienen que aceptar la transacción, el máximo de usuarios para una transacción es **10**, para evitar abusos, pero **atención**: necesitas tener la cantidad de stx que distribuirás a cada usuario, es decir, si quieres distribuir 50 stx a 4 usuarios, entonces necesitas tener 50 por 4 stx que es: 200",
                "",
                `Si el límite de usuarios es menor que 10, significa que no tienes el dinero necesario para transferir **${formatNumber(value)}** a 10 usuarios`,
                "",
                "¡Por favor elige los usuarios para distribuir tus stx!"
            ),
            placeholder: "Usuarios a transferir el dinero"
        },
        ownTransfer: `**${icon.denied_pink} | ¡Oye! ¿Por qué estás intentando darte dinero a ti mismo? ¡Si es para dar dinero, dámelo a mí!**`,
        erisTransfer: `**${icon.denied_pink} | ¡Ojalá pudiera recibir este dinero! ¡Pero mis reglas no lo permiten! ${icon.Eris_cry_left}**`,
        botTransfer: `**${icon.denied_pink} | ¡Oye! ¿Por qué estás intentando dar dinero a un bot? ¡Si es para dar dinero, dámelo a mí!**`,
        embed: {
            title: "Transferencia",
            description: (authorId: string, targetId: string, value: number) => `${icon.alarm} | ${userMention(authorId)} quiere enviar **${formatNumber(value)}** styx a ${userMention(targetId)}, ambos necesitan presionar el botón de abajo para que la transferencia se complete`,
        },
        button: "Confirmar ( 0/2 )"
    }
}