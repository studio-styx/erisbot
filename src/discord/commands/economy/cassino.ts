import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { slotsCommand } from "./cassinoCommands/slots.js";
import { coinflipCommand } from "./cassinoCommands/coinflip.js";
import { horseRacingCommand } from "./cassinoCommands/horseRacing.js";
import { blackjackCommand } from "./cassinoCommands/blackjack.js";

createCommand({
    name: "cassino",
    description: "cassino commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "slots",
            description: "play slots",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "amount",
                    description: "amount to bet",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 25,
                    nameLocalizations: {
                        "pt-BR": "valor",
                        "en-US": "amount",
                        "es-ES": "valor",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "valor a apostar",
                        "en-US": "amount to bet",
                        "es-ES": "valor a apostar",
                    }
                }
            ],
            nameLocalizations: {
                "pt-BR": "caça-níqueis",
                "en-US": "slots",
                "es-ES": "tragamonedas",
            },
            descriptionLocalizations: {
                "pt-BR": "jogue caça-níqueis",
                "en-US": "play slots",
                "es-ES": "jugar a las tragamonedas",
            }
        },
        {
            name: "coinflip",
            description: "play coinflip",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "amount",
                    description: "the amount of coins to bet",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 15,
                    nameLocalizations: {
                        "pt-BR": "aposta",
                        "en-US": "amount",
                        "es-ES": "apuesta"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "a quantidade de moedas a apostar",
                        "en-US": "the amount of coins to bet",
                        "es-ES": "la cantidad de monedas a apostar"
                    }
                },
                {
                    name: "side",
                    description: "the side to bet on",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "heads",
                            value: "heads",
                            nameLocalizations: {
                                "pt-BR": "cara",
                                "en-US": "heads",
                                "es-ES": "cara"
                            }
                        },
                        {
                            name: "tails",
                            value: "tails",
                            nameLocalizations: {
                                "pt-BR": "coroa",
                                "en-US": "tails",
                                "es-ES": "coroa"
                            }
                        }
                    ],
                    nameLocalizations: {
                        "pt-BR": "lado",
                        "en-US": "side",
                        "es-ES": "lado"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "o lado a apostar",
                        "en-US": "the side to bet on",
                        "es-ES": "el lado a apostar"
                    }
                }
            ],
            nameLocalizations: {
                "pt-BR": "caraoucoroa",
                "en-US": "coinflip",
                "es-ES": "lanzamiento",
            },
            descriptionLocalizations: {
                "pt-BR": "jogue cara ou coroa",
                "en-US": "play coinflip",
                "es-ES": "jugar cara o cruz",
            }
        },
        {
            name: "horse-racing",
            description: "bet on horse racing",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "corrida-de-cavalos",
                "en-US": "horse-racing",
                "es-ES": "carreras-de-caballos",
            },
            descriptionLocalizations: {
                "pt-BR": "apostar na corrida de cavalos",
                "en-US": "bet on horse racing",
                "es-ES": "apostar en carreras de caballos",
            },
            options: [
                {
                    name: "amount",
                    description: "amount to bet",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 50,
                    nameLocalizations: {
                        "pt-BR": "quantia",
                        "en-US": "amount",
                        "es-ES": "cantidad"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantia a apostar",
                        "en-US": "amount to bet",
                        "es-ES": "cantidad a apostar"
                    }
                },
                {
                    name: "horse",
                    description: "horse to bet",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: "purple", value: "purple", nameLocalizations: { "pt-BR": "roxo", "en-US": "purple", "es-ES": "morado" } },
                        { name: "blue", value: "blue", nameLocalizations: { "pt-BR": "azul", "en-US": "blue", "es-ES": "azul" } },
                        { name: "green", value: "green", nameLocalizations: { "pt-BR": "verde", "en-US": "green", "es-ES": "verde" } },
                        { name: "yellow", value: "yellow", nameLocalizations: { "pt-BR": "amarelo", "en-US": "yellow", "es-ES": "amarillo" } },
                        { name: "orange", value: "orange", nameLocalizations: { "pt-BR": "laranja", "en-US": "orange", "es-ES": "naranja" } },
                        { name: "red", value: "red", nameLocalizations: { "pt-BR": "vermelho", "en-US": "red", "es-ES": "rojo" } },
                        { name: "pink", value: "pink", nameLocalizations: { "pt-BR": "rosa", "en-US": "pink", "es-ES": "rosa" } },
                        { name: "brown", value: "brown", nameLocalizations: { "pt-BR": "marrom", "en-US": "brown", "es-ES": "marrón" } },
                    ],
                    nameLocalizations: {
                        "pt-BR": "cavalo",
                        "en-US": "horse",
                        "es-ES": "caballo"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "cavalo a apostar",
                        "en-US": "horse to bet",
                        "es-ES": "caballo"
                    }
                }
            ]
        },
        {
            name: "blackjack",
            description: "play blackjack",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "blackjack",
                "en-US": "blackjack",
                "es-ES": "blackjack",
            },
            descriptionLocalizations: {
                "pt-BR": "jogar blackjack",
                "en-US": "play blackjack",
                "es-ES": "jugar blackjack",
            },
            options: [
                {
                    name: "amount",
                    description: "amount to bet",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 50,
                    nameLocalizations: {
                        "pt-BR": "quantia",
                        "en-US": "amount",
                        "es-ES": "cantidad"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantia a apostar",
                        "en-US": "amount to bet",
                        "es-ES": "cantidad a apostar"
                    }
                }
            ]
        }
    ],
    nameLocalizations: {
        "pt-BR": "cassino",
        "en-US": "cassino",
        "es-ES": "casino",
    },
    descriptionLocalizations: {
        "pt-BR": "comandos de cassino",
        "en-US": "casino-related commands",
        "es-ES": "comandos relacionados al casino",
    },
    async run(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "slots": {
                await slotsCommand(interaction)
                break;
            }
            case "coinflip": {
                await coinflipCommand(interaction)
                break;
            }
            case "horse-racing": {
                await horseRacingCommand(interaction)
                break;
            }
            case "blackjack": {
                await blackjackCommand(interaction)
                break;
            }
            default:
                break;
        }
    }
});