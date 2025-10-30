import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { footballMatchesCommand } from "./subCommands/matches.js";

createCommand({
    name: "football",
    description: "football api bet commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "matches",
            description: "see all football matches",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async run(interaction){
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "matches": 
                await footballMatchesCommand(interaction);
                break;
        }
    }
});