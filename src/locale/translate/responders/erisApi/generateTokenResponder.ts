import { icon } from "#functions";

export default {
    ptbr: {
        errors: {
            userIsNotBot: `${icon.error} | Esse id não pertence a um bot!`,
            alreadyExist: `${icon.error} | Um bot com esse id já está registrado em meu sistema! se você é o dono desse bot e nunca criou um token antes, por favor entre em contato com a staff.`,
            alreadyHasBot: `${icon.error} | Você já tem um bot! para adicionar mais bots por favor entre em contato com a staff.`,
        },
        message: (token: { key: string; hash: string }) => `${icon.success} | Token gerado com sucesso! por favor nunca compartilhe esse token com ninguém. \n\n \`\`\`${token.key}\`\`\``
    },
    enus: {
        errors: {
            userIsNotBot: `${icon.error} | This ID does not belong to a bot!`,
            alreadyExist: `${icon.error} | A bot with this ID is already registered in my system! If you are the owner of this bot and have never created a token before, please contact the staff.`,
            alreadyHasBot: `${icon.error} | You already have a bot! To add more bots please contact the staff.`,
        },
        message: (token: { key: string; hash: string }) => `${icon.success} | Token generated successfully! Please never share this token with anyone. \n\n \`\`\`${token.key}\`\`\``
    },
    eses: {
        errors: {
            userIsNotBot: `${icon.error} | ¡Este ID no pertenece a un bot!`,
            alreadyExist: `${icon.error} | ¡Un bot con este ID ya está registrado en mi sistema! Si eres el dueño de este bot y nunca has creado un token antes, por favor contacta al staff.`,
            alreadyHasBot: `${icon.error} | ¡Ya tienes un bot! Para agregar más bots por favor contacta al staff.`,
        },
        message: (token: { key: string; hash: string }) => `${icon.success} | ¡Token generado con éxito! Por favor nunca compartas este token con nadie. \n\n \`\`\`${token.key}\`\`\``
    }
}