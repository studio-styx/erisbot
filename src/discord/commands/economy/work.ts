import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { EconomyWorkCommand } from "./generalCommands/work.js";

createCommand({
    name: "work",
    description: "work to earn money",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "trabalhar",
        "en-US": "work",
        "es-ES": "trabajar",
    },
    descriptionLocalizations: {
        "pt-BR": "trabalhe para ganhar dinheiro",
        "en-US": "work to earn money",
        "es-ES": "trabaja para ganar dinero",
    },
    async run(interaction) {
        await EconomyWorkCommand(interaction)
    }
});