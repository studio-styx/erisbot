import balance from "./translate/commands/balance.js";
import bankManage from "./translate/commands/bankManage.js";
import daily from "./translate/commands/daily.js";
import dismiss from "./translate/commands/dismiss.js";
import transfer from "./translate/commands/transfer.js";
import work from "./translate/commands/work.js";

export const translate = {
    commands: {
        daily,
        balance,
        bankManage,
        dismiss,
        transfer,
        work
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
