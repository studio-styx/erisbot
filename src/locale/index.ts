import blackjack from "./translate/commands/cassinoCommands/blackjack.js";
import coinflip from "./translate/commands/cassinoCommands/coinflip.js";
import horseRacing from "./translate/commands/cassinoCommands/horse-racing.js";
import slots from "./translate/commands/cassinoCommands/slots.js";
import deleteToken from "./translate/commands/erisApi/deleteToken.js";
import generateKeyModal from "./translate/commands/erisApi/generateKeyModal.js";
import regenerateToken from "./translate/commands/erisApi/regenerateToken.js";
import balance from "./translate/commands/generalEconomyCommands/balance.js";
import bankManage from "./translate/commands/generalEconomyCommands/bankManage.js";
import daily from "./translate/commands/generalEconomyCommands/daily.js";
import dismiss from "./translate/commands/generalEconomyCommands/dismiss.js";
import transfer from "./translate/commands/generalEconomyCommands/transfer.js";
import work from "./translate/commands/generalEconomyCommands/work.js";
import support from "./translate/commands/help/support.js";
import generateTokenResponder from "./translate/responders/erisApi/generateTokenResponder.js";

export const translate = {
    commands: {
        daily,
        balance,
        bankManage,
        dismiss,
        transfer,
        work,
        blackjack,
        coinflip,
        slots,
        horseRacing,
        keyManage: {
            regenerateToken,
            generateKeyModal,
            deleteToken
        },
        support
    },
    responders: {
        erisApi: {
            generateTokenResponder
        }
    }
}

const langMap = {
    ptbr: "ptbr",
    eses: "eses",
    enus: "enus",
  } as const;

export type LangCode = typeof langMap[keyof typeof langMap];

// Mapas de variantes -> idioma base
const langAliases: Record<string, LangCode> = {
    // Português
    "pt-br": "ptbr",
    "pt": "ptbr",
    // Espanhol
    "es-es": "eses",
    "es-mx": "eses", // espanhol mexicano
    "es-ar": "eses", // espanhol argentino
    "es": "eses",
    // Inglês
    "en-us": "enus",
    "en-gb": "enus", // inglês britânico
    "en-au": "enus", // inglês australiano
    "en": "enus",
};

export function getLang(locale?: string): LangCode {
    const normalized = (locale ?? "en-US").toLowerCase();
    return langAliases[normalized] ?? "enus"; // fallback para inglês
}
