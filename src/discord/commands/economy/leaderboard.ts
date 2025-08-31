import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
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
    options: [
        {
            name: "ephemeral",
            description: "only visible to you. default: (false)",
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ],
    async run(interaction) {
        await economyLeaderboardCommand(interaction)
    }
});