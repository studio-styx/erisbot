import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { economyDailyCommand } from "./generalCommands/daily.js";

createCommand({
    name: "daily",
    description: "claim your daily reward",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "diário",
        "en-US": "daily",
        "es-ES": "diario",
    },
    descriptionLocalizations: {
        "pt-BR": "resgate sua recompensa diária",
        "en-US": "claim your daily reward",
        "es-ES": "reclama tu recompensa diaria",
    },
    async run(interaction) {
        await economyDailyCommand(interaction)
    }
});