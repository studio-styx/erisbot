import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";
import { economyLeaderboardCommand } from "./generalCommands/leaderboard.js";

createCommand({
    name: "leaderboard",
    description: "check the leaderboard",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "ranking",
        "en-US": "leaderboard",
        "es-ES": "clasificación",
    },
    descriptionLocalizations: {
        "pt-BR": "ver o ranking",
        "en-US": "check the leaderboard",
        "es-ES": "ver la clasificación",
    },
    async run(interaction) {
        await economyLeaderboardCommand(interaction)
    }
});