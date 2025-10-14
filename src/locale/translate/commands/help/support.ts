import { icon } from "#functions";
import { time } from "discord.js";

export default {
    ptbr: {
        cooldown: (cooldown: Date) => `${icon.error} Você já reportou algo recentemente, volte novamente em: ${time(cooldown, "R")}`,
        errors: {
            supportChannelNotFound: `${icon.error} | Não foi possível encontrar o canal de suporte`,
            channelSupportIsNotTextChannel: `${icon.error} | O canal de suporte não é um canal de texto`
        },
        bug: {
            message: `${icon.success} | Bug reportado com sucesso`,
            errorMessage: `${icon.error} | Não foi possível enviar o bug para o canal`
        },
        report: {
            selfReport: `${icon.error} | Você não pode reportar você mesmo`,
            erisReport: `${icon.error} | Você não pode me reportar`,
            errorMessage: `${icon.error} | Não foi possível enviar o report para o canal`,
            message: `${icon.success} | Usuário reportado com sucesso`
        },
        suggestion: {
            errorMessage: `${icon.error} | Não foi possível enviar a sugestão para o canal`,
            message: `${icon.success} | Sugestão enviada com sucesso`
        }
    },
    enus: {
        cooldown: (cooldown: Date) => `${icon.error} You already reported something recently, come back again at: ${time(cooldown, "R")}`,
        errors: {
            supportChannelNotFound: `${icon.error} | Could not find the support channel`,
            channelSupportIsNotTextChannel: `${icon.error} | The support channel is not a text channel`
        },
        bug: {
            message: `${icon.success} | Bug reported successfully`,
            errorMessage: `${icon.error} | Could not send the bug to the channel`
        },
        report: {
            selfReport: `${icon.error} | You cannot report yourself`,
            erisReport: `${icon.error} | You cannot report me`,
            errorMessage: `${icon.error} | Could not send the report to the channel`,
            message: `${icon.success} | User reported successfully`
        },
        suggestion: {
            errorMessage: `${icon.error} | Could not send the suggestion to the channel`,
            message: `${icon.success} | Suggestion sent successfully`
        }
    },
    eses: {
        cooldown: (cooldown: Date) => `${icon.error} Ya reportaste algo recientemente, vuelve nuevamente en: ${time(cooldown, "R")}`,
        errors: {
            supportChannelNotFound: `${icon.error} | No se pudo encontrar el canal de soporte`,
            channelSupportIsNotTextChannel: `${icon.error} | El canal de soporte no es un canal de texto`
        },
        bug: {
            message: `${icon.success} | Error reportado con éxito`,
            errorMessage: `${icon.error} | No se pudo enviar el error al canal`
        },
        report: {
            selfReport: `${icon.error} | No puedes reportarte a ti mismo`,
            erisReport: `${icon.error} | No puedes reportarme a mí`,
            errorMessage: `${icon.error} | No se pudo enviar el reporte al canal`,
            message: `${icon.success} | Usuario reportado con éxito`
        },
        suggestion: {
            errorMessage: `${icon.error} | No se pudo enviar la sugerencia al canal`,
            message: `${icon.success} | Sugerencia enviada con éxito`
        }
    }
}
