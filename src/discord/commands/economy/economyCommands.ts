import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { generalEconomyCommands } from "./generalEconomyCommands.js";
import { PrismaClient } from "#prisma/client";
import { cassinoEconomyCommands } from "./cassinoEconomyCommands.js";
import { investmentsEconomyCommands } from "./investmentEconomyCommand.js";

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
                    name: "jobs",
                    description: "search for a job",
                    type: ApplicationCommandOptionType.Subcommand,
                    nameLocalizations: {
                        "pt-BR": "empregos",
                        "en-US": "jobs",
                        "es-ES": "emplegos",
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
                        "pt-BR": "demitir",
                        "en-US": "dismiss",
                        "es-ES": "demitir"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "deixar seu emprego",
                        "en-US": "quit your job",
                        "es-ES": "dejar su empleo",
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
            ]
        },
        {
            name: "investment",
            description: "invest in stocks",
            type: ApplicationCommandOptionType.SubcommandGroup,
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
    dmPermission: false,
    async autocomplete(interaction) {
        const { options } = interaction;
        const subCommandGroup = options.getSubcommandGroup()
        const subCommand = options.getSubcommand()
        const focused = options.getFocused()

        switch (subCommandGroup) {
            case "investment": {
                switch (subCommand) {
                    case "buy": {
                        const stocks = await prisma.stock.findMany({
                            where: {
                                OR: [
                                    { name: { contains: focused, mode: "insensitive" } },
                                    { description: { contains: focused, mode: "insensitive" } }
                                ]
                            }
                        })

                        const amount = options.getNumber("amount");

                        return interaction.respond(stocks.map(stock => ({
                            name: `${stock.id} - ${stock.name} price: ${stock.price.toNumber()} value to pay: ${amount ? amount * stock.price.toNumber() : "unknown"}`,
                            value: `${stock.id}`
                        })).slice(0, 25))
                    }
                }
            }
        }
    },
    async run(interaction) {
        const { options } = interaction;
        const subCommandGroup = options.getSubcommandGroup()

        await prisma.user.upsert({
            where: { id: interaction.user.id },
            update: {},
            create: { id: interaction.user.id }
        })

        switch (subCommandGroup) {
            case "general": {
                await generalEconomyCommands(interaction)
            }
            case "cassino": {
                await cassinoEconomyCommands(interaction)
            }
            case "investment": {
                await investmentsEconomyCommands(interaction)
            }
        }
    }
});