import { icon } from "#functions";

export default {
    ptbr: {
        botNotFound: `${icon.error} | Bot não encontrado!`,
        message: (newToken: { key: string; hash: string }) => `${icon.success} | Novo token gerado: **\`${newToken.key}\`**`
    },
    enus: {
        botNotFound: `${icon.error} | Bot not found!`,
        message: (newToken: { key: string; hash: string }) => `${icon.success} | New token generated: **\`${newToken.key}\`**`
    },
    eses: {
        botNotFound: `${icon.error} | ¡Bot no encontrado!`,
        message: (newToken: { key: string; hash: string }) => `${icon.success} | Nuevo token generado: **\`${newToken.key}\`**`
    }
}