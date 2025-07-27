import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { buyStockCommand } from "./investmentCommands/buy.js";
import { ownStocksCommand } from "./investmentCommands/ownStocks.js";
import { stocksCommand } from "./investmentCommands/stocks.js";
import { iaAvaliationCommand } from "./investmentCommands/iaAvaliation.js";

createCommand({
    name: "investment",
    description: "invest in stocks",
    nameLocalizations: {
        "pt-BR": "investimento",
        "en-US": "investment",
        "es-ES": "inversión",
    },
    descriptionLocalizations: {
        "pt-BR": "investir em ações",
        "en-US": "invest in stocks",
        "es-ES": "invertir en acciones",
    },
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "buy",
            description: "buy stocks",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "comprar",
                "en-US": "buy",
                "es-ES": "comprar",
            },
            descriptionLocalizations: {
                "pt-BR": "comprar ações",
                "en-US": "buy stocks",
                "es-ES": "comprar acciones",
            },
            options: [
                {
                    name: "amount",
                    description: "amount to buy",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1,
                    nameLocalizations: {
                        "pt-BR": "quantia",
                        "en-US": "amount",
                        "es-ES": "cantidad"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantia a comprar",
                        "en-US": "amount to buy",
                        "es-ES": "cantidad a comprar"
                    }
                },
                {
                    name: "stock",
                    description: "stock to buy",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "ação",
                        "en-US": "stock",
                        "es-ES": "acción"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "ação a comprar",
                        "en-US": "stock to buy",
                        "es-ES": "acción a comprar"
                    }
                }
            ]
        },
        {
            name: "own-stocks",
            description: "see your stocks",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "ações-próprias",
                "en-US": "own-stocks",
                "es-ES": "acciones-propias"
            },
            descriptionLocalizations: {
                "pt-BR": "veja suas ações",
                "en-US": "see your stocks",
                "es-ES": "vea sus acciones"
            }
        },
        {
            name: "stocks",
            description: "see all stocks",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "ações",
                "en-US": "stocks",
                "es-ES": "acciones"
            },
            descriptionLocalizations: {
                "pt-BR": "veja todas as ações",
                "en-US": "see all stocks",
                "es-ES": "vea todas las acciones"
            }
        },
        {
            name: "ia-avaliation",
            description: "see the IA's avaliation of the stocks",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "avaliação-da-ia",
                "en-US": "ia-avaliation",
                "es-ES": "avaliación-de-la-ia"
            },
            descriptionLocalizations: {
                "pt-BR": "veja a avaliação da IA das ações",
                "en-US": "see the IA's avaliation of the stocks",
                "es-ES": "vea la avaliación de la IA de las acciones"
            },
            options: [
                {
                    name: "amount",
                    description: "Quantity you want to buy for AI to evaluate, do not worry you will not buy",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1,
                    nameLocalizations: {
                        "pt-BR": "quantia",
                        "en-US": "amount",
                        "es-ES": "cantidad"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantia que você quer comprar para a IA avaliar, não se preocupe você não vai comprar",
                        "en-US": "Quantity you want to buy for AI to evaluate, do not worry you will not buy",
                        "es-ES": "cantidad que desea comprar para que la IA evalúe, no se preocupe, no lo comprará"
                    }
                }
            ]
        }
    ],
    async run(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "buy": {
                await buyStockCommand(interaction)
                break;
            }
            case "own-stocks": {
                await ownStocksCommand(interaction)
                break;
            }
            case "stocks": {
                await stocksCommand(interaction)
                break;
            }
            case "ia-avaliation": {
                await iaAvaliationCommand(interaction)
                break;
            }
        }
    }
});