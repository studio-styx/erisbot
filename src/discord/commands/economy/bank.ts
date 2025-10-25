import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { economyBalanceCommand } from "./generalCommands/balance.js";
import { economyTransferCommand } from "./generalCommands/transfer.js";

createCommand({
    name: "balance",
    description: "view and manage your balance",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "saldo",
        "en-US": "balance",
        "es-ES": "saldo",
    },
    descriptionLocalizations: {
        "pt-BR": "verifique e gerencie seu saldo",
        "en-US": "view and manage your balance",
        "es-ES": "verifique y gestione su saldo",
    },
    options: [
        {
            name: "view",
            description: "view your bank balance",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "saldo",
                "en-US": "view",
                "es-ES": "saldo",
            },
            descriptionLocalizations: {
                "pt-BR": "verifique seu saldo no banco",
                "en-US": "view your bank balance",
                "es-ES": "verifique su saldo en el banco",
            },
            options: [
                {
                    name: "user",
                    description: "user to get balance",
                    type: ApplicationCommandOptionType.User,
                    nameLocalizations: {
                        "pt-BR": "usuário",
                        "en-US": "user",
                        "es-ES": "usuario",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para obter saldo",
                        "en-US": "user to get balance",
                        "es-ES": "usuario para obtener saldo",
                    },
                    required: false
                }
            ]
        },
        {
            name: "transfer",
            description: "transfer money to another user",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "transferir",
                "en-US": "transfer",
                "es-ES": "transferir",
            },
            descriptionLocalizations: {
                "pt-BR": "transferir dinheiro para outro usuário",
                "en-US": "transfer money to another user",
                "es-ES": "transferir dinero a otro usuario",
            },
            options:[
                {
                    name: "amount",
                    description: "value to transfer",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 15,
                    required: true,
                },
                {
                    name: "user",
                    description: "user to transfer money",
                    required: false,
                    type: ApplicationCommandOptionType.User,
                    nameLocalizations: {
                        "pt-BR": "usuário",
                        "en-US": "user",
                        "es-ES": "usuario",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para transferir dinheiro",
                        "en-US": "user to transfer money",
                        "es-ES": "usuario para transferir dinero",
                    }
                },
            ]
        }
    ],
    async run(interaction){
        const subCommand = interaction.options.getSubcommand();

        switch(subCommand) {
            case "view": {
                await economyBalanceCommand(interaction)
                break;
            }
            case "transfer": {
                await economyTransferCommand(interaction)
                break;
            }
        
        }
    }
});