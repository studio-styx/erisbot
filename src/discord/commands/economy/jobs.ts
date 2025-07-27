import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { EconomyJobsCommand } from "./generalCommands/jobs.js";
import { EconomyDismissCommand } from "./generalCommands/dismiss.js";

createCommand({
    name: "jobs",
    description: "jobs commands",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "empregos",
        "en-US": "jobs",
        "es-ES": "emplegos",
    },
    descriptionLocalizations: {
        "pt-BR": "comandos de empregos",
        "en-US": "jobs commands",
        "es-ES": "comandos de empleo",
    },
    options: [
        {
            name: "search",
            description: "search for a job",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "procurar",
                "en-US": "search",
                "es-ES": "buscar",
            },
            descriptionLocalizations: {
                "pt-BR": "procurar um emprego",
                "en-US": "search for a job",
                "es-ES": "buscar un empleo",
            }
        },
        {
            name: "dismiss",
            description: "quit your job",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "se-demitir",
                "en-US": "dismiss",
                "es-ES": "demitir"
            },
            descriptionLocalizations: {
                "pt-BR": "deixar seu emprego",
                "en-US": "quit your job",
                "es-ES": "dejar su empleo",
            }
        }
    ],
    async run(interaction) {
        const subCommand = interaction.options.getSubcommand();
        switch (subCommand) {
            case "search": {
                await EconomyJobsCommand(interaction)
                break
            }
            case "dismiss": {
                await EconomyDismissCommand(interaction)
                break
            }
        }
    }
});