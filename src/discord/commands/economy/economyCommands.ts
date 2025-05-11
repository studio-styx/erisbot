import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { PrismaClient } from "#prisma";
import i18next from "i18next";
import { generalEconomyCommands } from "./generalEconomyCommands.js";

const prisma = new PrismaClient();

createCommand({
    name: "economy",
    description: "economy commands",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "general",
            description: "general economy commands",
            type: ApplicationCommandOptionType.SubcommandGroup,
            nameLocalizations: {
                "pt-BR": "geral",
                "en-US": "general",
                "es-ES": "general",
            },
            descriptionLocalizations: {
                "pt-BR": "comandos gerais de economia",
                "en-US": "general economy commands",
                "es-ES": "comandos generales de economía",
            },
            options: [
                {
                    name: "work",
                    description: "work to earn money",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "trabalhar",
                        "en-US": "work",
                        "es-ES": "trabajar",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "trabalhe para ganhar dinheiro",
                        "en-US": "work to earn money",
                        "es-ES": "trabaja para ganar dinero",
                    }
                },
                {
                    name: "daily",
                    description: "claim your daily reward",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "diário",
                        "en-US": "daily",
                        "es-ES": "diario",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "resgate sua recompensa diária",
                        "en-US": "claim your daily reward",
                        "es-ES": "reclama tu recompensa diaria",
                    }
                },
                {
                    name: "balance",
                    description: "get your balance",
                    type: ApplicationCommandOptionType.Subcommand,
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
                            }
                        }
                    ],
                    nameLocalizations: {
                        "pt-BR": "saldo",
                        "en-US": "balance",
                        "es-ES": "balance",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "obter seu saldo",
                        "en-US": "get your balance",
                        "es-ES": "obtener su saldo",
                    }
                },
                {
                    name: "deposit",
                    description: "deposit money into your bank",
                    type: ApplicationCommandOptionType.Subcommand,
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
                            }
                        }
                    ],
                    nameLocalizations: {
                        "pt-BR": "depositar",
                        "en-US": "deposit",
                        "es-ES": "depositar",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "deposite dinheiro no banco",
                        "en-US": "deposit money into your bank",
                        "es-ES": "depositar dinero en tu banco",
                    }
                },
                {
                    name: "withdraw",
                    description: "withdraw money from your bank",
                    type: ApplicationCommandOptionType.Subcommand,
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
                            }
                        }
                    ],
                    nameLocalizations: {
                        "pt-BR": "sacar",
                        "en-US": "withdraw",
                        "es-ES": "retirar",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "sacar dinheiro do banco",
                        "en-US": "withdraw money from your bank",
                        "es-ES": "retirar dinero del banco",
                    }
                },
                {
                    name: "transfer",
                    description: "transfer money to another user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
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
                            nameLocalizations: {
                                "pt-BR": "valor",
                                "en-US": "value",
                                "es-ES": "valor",
                            },
                            descriptionLocalizations: {
                                "pt-BR": "valor a transferir",
                                "en-US": "value to transfer",
                                "es-ES": "valor para transferir",
                            }
                        }
                    ],
                    nameLocalizations: {
                        "pt-BR": "transferir",
                        "en-US": "transfer",
                        "es-ES": "transferir",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "transferir dinheiro para outro usuário",
                        "en-US": "transfer money to another user",
                        "es-ES": "transferir dinero a otro usuario",
                    }
                },
                {
                    name: "leaderboard",
                    description: "check the leaderboard",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "ranking",
                        "en-US": "leaderboard",
                        "es-ES": "clasificación",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "ver o ranking",
                        "en-US": "check the leaderboard",
                        "es-ES": "ver la clasificación",
                    }
                },
                {
                    name: "shop",
                    description: "check the shop",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "loja",
                        "en-US": "shop",
                        "es-ES": "tienda",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "ver a loja",
                        "en-US": "check the shop",
                        "es-ES": "ver la tienda",
                    }
                }
            ]
        },
        {
            name: "cassino",
            description: "casino-related commands",
            type: ApplicationCommandOptionType.SubcommandGroup,
            nameLocalizations: {
                "pt-BR": "cassino",
                "en-US": "cassino",
                "es-ES": "casino",
            },
            descriptionLocalizations: {
                "pt-BR": "comandos de jogos de azar",
                "en-US": "casino-related commands",
                "es-ES": "comandos relacionados al casino",
            },
            options: [
                {
                    name: "roulette",
                    description: "play roulette",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "roleta",
                        "en-US": "roulette",
                        "es-ES": "ruleta",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "jogue roleta",
                        "en-US": "play roulette",
                        "es-ES": "jugar a la ruleta",
                    }
                },
                {
                    name: "slots",
                    description: "play slots",
                    type: ApplicationCommandOptionType.Subcommand,
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
                    name: "blackjack",
                    description: "play blackjack",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "blackjack",
                        "en-US": "blackjack",
                        "es-ES": "blackjack",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "jogue blackjack",
                        "en-US": "play blackjack",
                        "es-ES": "jugar al blackjack",
                    }
                },
                {
                    name: "coinflip",
                    description: "play coinflip",
                    type: ApplicationCommandOptionType.Subcommand,
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
                }
            ]
        },
        {
            name: "dishonest",
            description: "dishonest economy actions",
            type: ApplicationCommandOptionType.SubcommandGroup,
            nameLocalizations: {
                "pt-BR": "desonesto",
                "en-US": "dishonest",
                "es-ES": "deshonesto",
            },
            descriptionLocalizations: {
                "pt-BR": "ações econômicas desonestas",
                "en-US": "dishonest economy actions",
                "es-ES": "acciones económicas deshonestas",
            },
            options: [
                {
                    name: "rob",
                    description: "rob another user",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "assaltar",
                        "en-US": "rob",
                        "es-ES": "robar",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "assaltar outro usuário",
                        "en-US": "rob another user",
                        "es-ES": "robar a otro usuario",
                    }
                },
                {
                    name: "scam",
                    description: "scam another user",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "golpear",
                        "en-US": "scam",
                        "es-ES": "estafar",
                    },
                    descriptionLocalizations: {
                        "pt-BR": "aplicar golpe em outro usuário",
                        "en-US": "scam another user",
                        "es-ES": "estafar a otro usuario",
                    }
                }
            ]
        }
    ],
    nameLocalizations: {
        "pt-BR": "economia",
        "en-US": "economy",
        "es-ES": "economía",
    },
    descriptionLocalizations: {
        "pt-BR": "comandos de economia",
        "en-US": "economy commands",
        "es-ES": "comandos de economía",
    },
    async run(interaction) {
        const { options } = interaction;
        const subCommandGroup = options.getSubcommandGroup()
        await i18next.changeLanguage(interaction.locale);

        switch (subCommandGroup) {
            case "general": {
                await generalEconomyCommands(interaction)
            }
        }
    }
});