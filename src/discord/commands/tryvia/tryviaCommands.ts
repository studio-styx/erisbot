import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { startTryviaGame } from "./commands/start.js";
import { closeTryviaGame } from "./commands/close.js";

createCommand({
    name: "tryvia",
    description: "tryvia commands",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "trivia",
        "en-US": "tryvia",
        "es-ES": "trivia",
    },
    descriptionLocalizations: {
        "pt-BR": "comandos de trivia",
        "en-US": "tryvia commands",
        "es-ES": "comandos de trivia",
    },
    options: [
        {
            name: "start",
            description: "start a tryvia game in this channel",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "iniciar",
                "en-US": "start",
                "es-ES": "iniciar"
            },
            descriptionLocalizations: {
                "pt-BR": "iniciar um jogo de trivia nesse canal",
                "en-US": "start a tryvia game in this channel",
                "es-ES": "iniciar un juego de trivia en este canal"
            },
            options: [
                {
                    name: "category",
                    description: "category of the questions",
                    type: ApplicationCommandOptionType.String,
                    nameLocalizations: {
                        "pt-BR": "categoria",
                        "en-US": "category",
                        "es-ES": "categoria"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "categoria das perguntas",
                        "en-US": "category of the questions",
                        "es-ES": "categoria de las preguntas"
                    },
                    autocomplete: true,
                    required: false
                },
                {
                    name: "amount",
                    description: "amount of questions",
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 3,
                    maxValue: 30,
                    nameLocalizations: {
                        "pt-BR": "quantidade",
                        "en-US": "amount",
                        "es-ES": "cantidad"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantidade de perguntas",
                        "en-US": "amount of questions",
                        "es-ES": "cantidad de preguntas"
                    },
                    required: false
                },
                {
                    name: "difficulty",
                    description: "difficulty of the questions",
                    type: ApplicationCommandOptionType.String,
                    nameLocalizations: {
                        "pt-BR": "dificuldade",
                        "en-US": "difficulty",
                        "es-ES": "dificultad"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "dificuldade das perguntas",
                        "en-US": "difficulty of the questions",
                        "es-ES": "dificultad de las preguntas"
                    },
                    required: false,
                    choices: [
                        {
                            name: "easy",
                            value: "easy",
                            nameLocalizations: {
                                "pt-BR": "fácil",
                                "en-US": "easy",
                                "es-ES": "fácil"
                            }
                        },
                        {
                            name: "medium",
                            value: "medium",
                            nameLocalizations: {
                                "pt-BR": "médio",
                                "en-US": "medium",
                                "es-ES": "medio"
                            }
                        },
                        {
                            name: "hard",
                            value: "hard",
                            nameLocalizations: {
                                "pt-BR": "difícil",
                                "en-US": "hard",
                                "es-ES": "difícil"
                            }
                        },
                        {
                            name: "easy_medium",
                            value: "easy_medium",
                            nameLocalizations: {
                                "pt-BR": "fácil_médio",
                                "en-US": "easy_medium",
                                "es-ES": "fácil_medio"
                            }
                        },
                        {
                            name: "medium_hard",
                            value: "medium_hard",
                            nameLocalizations: {
                                "pt-BR": "médio_difícil",
                                "en-US": "medium_hard",
                                "es-ES": "medio_difícil"
                            }
                        },
                        {
                            name: "easy_hard",
                            value: "easy_hard",
                            nameLocalizations: {
                                "pt-BR": "fácil_difícil",
                                "en-US": "easy_hard",
                                "es-ES": "fácil_difícil"
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: "close",
            description: "close the tryvia game in this channel",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "fechar",
                "en-US": "close",
                "es-ES": "cerrar"
            },
            descriptionLocalizations: {
                "pt-BR": "fechar o jogo de trivia deste canal",
                "en-US": "close the tryvia game in this channel",
                "es-ES": "cerrar el juego de trivia en este canal"
            }
        }
    ],
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true);

        switch(interaction.options.getSubcommand()) {
            case "start": {
                const getCategories = async () => {
                    const raw = await redis.get(`tryvia:questions:categories`);
                    if (!raw) {
                        const categories = await prisma.tryviaQuestions.findMany({
                            select: {
                                tags: true
                            }
                        });

                        const tags = new Set(categories.flatMap(category => category.tags));
                        await redis.setex(`tryvia:questions:categories`, 60 * 30, JSON.stringify(Array.from(tags)));
                        return Array.from(tags) as string[];
                    }
                    return JSON.parse(raw) as string[];
                }
                const categories = await getCategories();

                const categoriesFiltred = categories.filter(category => category.toLowerCase().includes(focused.value.toLowerCase()));
                
                if (categoriesFiltred.length === 0) {
                    return await interaction.respond([
                        {
                            name: "Nenhuma categoria encontrada",
                            value: "none"
                        }
                    ])
                }

                return await interaction.respond(categoriesFiltred.map(category => ({
                    name: category,
                    value: category
                })));
            }
        }
    },
    async run(interaction){
        switch(interaction.options.getSubcommand()) {
            case "start": {
                await startTryviaGame(interaction);
                return;
            }
            case "close": {
                await closeTryviaGame(interaction);
                return;
            }
        }
    }
});