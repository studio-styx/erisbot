import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { economyBalanceCommand } from "./generalCommands/balance.js";
import { economyDepositCommand } from "./generalCommands/deposit.js";
import { economyWithdrawCommand } from "./generalCommands/withdraw.js";
import { economyTransferCommand } from "./generalCommands/transfer.js";

createCommand({
    name: "bank",
    description: "view and manage your bank",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "banco",
        "en-US": "bank",
        "es-ES": "banco",
    },
    descriptionLocalizations: {
        "pt-BR": "verifique e gerencie seu banco",
        "en-US": "view and manage your bank",
        "es-ES": "verifique y gestione su banco",
    },
    options: [
        {
            name: "balance",
            description: "view your bank balance",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "saldo",
                "en-US": "balance",
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
            name: "deposit",
            description: "deposit money into your bank",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "depositar",
                "en-US": "deposit",
                "es-ES": "depositar",
            },
            descriptionLocalizations: {
                "pt-BR": "deposite dinheiro no banco",
                "en-US": "deposit money into your bank",
                "es-ES": "depositar dinero en tu banco",
            },
            options: [
                {
                    name: "amount",
                    description: "value to deposit",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1,
                    nameLocalizations: {
                        "pt-BR": "valor",
                        "en-US": "value",
                        "es-ES": "valor",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "valor a depositar",
                        "en-US": "value to deposit",
                        "es-ES": "valor para depositar",
                    },
                    required: true
                }
            ]
        },
        {
            name: "withdraw",
            description: "withdraw money from your bank",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "sacar",
                "en-US": "withdraw",
                "es-ES": "retirar",
            },
            descriptionLocalizations: {
                "pt-BR": "sacar dinheiro do banco",
                "en-US": "withdraw money from your bank",
                "es-ES": "retirar dinero del banco",
            },
            options: [
                {
                    name: "amount",
                    description: "value to withdraw",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1,
                    nameLocalizations: {
                        "pt-BR": "valor",
                        "en-US": "value",
                        "es-ES": "valor",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "valor a sacar",
                        "en-US": "value to withdraw",
                        "es-ES": "valor para retirar",
                    },
                    required: true
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
                    name: "user",
                    description: "user to transfer money",
                    required: true,
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
                {
                    name: "amount",
                    description: "value to transfer",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 15,
                    required: true,
                }
            ]
        }
    ],
    async run(interaction){
        const subCommand = interaction.options.getSubcommand();

        switch(subCommand) {
            case "balance": {
                await economyBalanceCommand(interaction)
                break;
            }
            case "deposit": {
                await economyDepositCommand(interaction)
                break;
            }
            case "withdraw": {
                await economyWithdrawCommand(interaction)
                break;
            }
            case "transfer": {
                await economyTransferCommand(interaction)
                break;
            }
        
        }
    }
});