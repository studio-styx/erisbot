import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, resv2 } from "#functions";
import { menus } from "#menus";
import { createLabel, createModalFields } from "@magicyan/discord";
import { TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "devMenu/tryvia/add/:field",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    parse(params) {
        return {
            field: params.field as "question" | "difficulty" | "tags" | "correctAnswer" | "correctAnswersVariation" | "incorrectAnswers" | "submit",
        }
    },
    async run(interaction, { field }) {
        if (!interaction.isButton()) {
            await interaction.deferUpdate();
        }

        const raw = await redis.get(`devmenu:tryvia:add`);
        if (!raw) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Pergunta não encontrada!`));
            return;
        }

        const question = JSON.parse(raw) as {
            question: string;
            difficulty: "EASY" | "MEDIUM" | "HARD";
            tags: string[];
            correctAnswer: string;
            correctAnswersVariation: string[];
            incorrectAnswers: string[];
            explanation: string;
        };

        switch (field) {
            case "question": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/add/question`,
                        title: "Editar Pergunta",
                        components: createModalFields(
                            createLabel({
                                label: "Nova pergunta",
                                component: new TextInputBuilder({
                                    customId: "question",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Qual a pergunta?",
                                    value: question.question
                                })
                            })
                        )
                    })
                    return;
                }
                const questionI = interaction.fields.getTextInputValue("questionI");
                await redis.setex(`devmenu:tryvia:add`, 60 * 60, JSON.stringify({
                    ...question,
                    question: questionI
                }))

                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: questionI,
                    difficulty: question.difficulty,
                    tags: question.tags,
                    correctAnswer: question.correctAnswer,
                    correctAnswersVariation: question.correctAnswersVariation,
                    incorrectAnswers: question.incorrectAnswers
                }));
                return;
            }
            case "difficulty": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/add/difficulty`,
                        title: "Editar Dificuldade",
                        components: createModalFields(
                            createLabel({
                                label: "Nova dificuldade",
                                component: new TextInputBuilder({
                                    customId: "difficulty",
                                    style: TextInputStyle.Short,
                                    required: true,
                                    placeholder: "Qual a dificuldade?",
                                    value: question.difficulty
                                })
                            })
                        )
                    })
                    return;
                }
                const difficulty = interaction.fields.getTextInputValue("difficulty") as "EASY" | "MEDIUM" | "HARD";
                
                await redis.setex(`devmenu:tryvia:add`, 60 * 60, JSON.stringify({
                    ...question,
                    difficulty
                }));

                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: question.question,
                    difficulty,
                    tags: question.tags,
                    correctAnswer: question.correctAnswer,
                    correctAnswersVariation: question.correctAnswersVariation,
                    incorrectAnswers: question.incorrectAnswers
                }));
                return;
            }
            case "tags": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/add/tags`,
                        title: "Editar Tags",
                        components: createModalFields(
                            createLabel({
                                label: "Novas tags",
                                component: new TextInputBuilder({
                                    customId: "tags",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Quais as tags?",
                                    value: question.tags.join(", ")
                                })
                            })
                        )
                    })
                    return;
                }

                const tags = interaction.fields.getTextInputValue("tags").split(",").map(t => t.trim());

                await redis.setex(`devmenu:tryvia:add`, 60 * 60, JSON.stringify({
                    ...question,
                    tags
                }));

                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: question.question,
                    difficulty: question.difficulty,
                    tags,
                    correctAnswer: question.correctAnswer,
                    correctAnswersVariation: question.correctAnswersVariation,
                    incorrectAnswers: question.incorrectAnswers
                }));
                return;
            }
            case "correctAnswer": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/add/correctAnswer`,
                        title: "Editar Resposta Correta",
                        components: createModalFields(
                            createLabel({
                                label: "Nova resposta correta",
                                component: new TextInputBuilder({
                                    customId: "correctAnswer",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Qual a resposta correta?",
                                    value: question.correctAnswer
                                })
                            })
                        )
                    })
                    return;
                }
                const correctAnswer = interaction.fields.getTextInputValue("correctAnswer");

                await redis.setex(`devmenu:tryvia:add`, 60 * 60, JSON.stringify({
                    ...question,
                    correctAnswer
                }));

                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: question.question,
                    difficulty: question.difficulty,
                    tags: question.tags,
                    correctAnswer,
                    correctAnswersVariation: question.correctAnswersVariation,
                    incorrectAnswers: question.incorrectAnswers
                }));
                return;
            }
            case "correctAnswersVariation": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/add/correctAnswersVariation`,
                        title: "Editar Variações da Resposta Correta",
                        components: createModalFields(
                            createLabel({
                                label: "Novas variações da resposta correta",
                                component: new TextInputBuilder({
                                    customId: "correctAnswersVariation",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Quais as variações da resposta correta?",
                                    value: question.correctAnswersVariation.join(", ")
                                })
                            })
                        )
                    })
                    return;
                }
                const correctAnswersVariation = interaction.fields.getTextInputValue("correctAnswersVariation").split(",").map(t => t.trim());

                await redis.setex(`devmenu:tryvia:add`, 60 * 60, JSON.stringify({
                    ...question,
                    correctAnswersVariation
                }));

                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: question.question,
                    difficulty: question.difficulty,
                    tags: question.tags,
                    correctAnswer: question.correctAnswer,
                    correctAnswersVariation,
                    incorrectAnswers: question.incorrectAnswers
                }));
                return;
            }
            case "incorrectAnswers": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/add/incorrectAnswers`,
                        title: "Editar Respostas Incorretas",
                        components: createModalFields(
                            createLabel({
                                label: "Novas respostas incorretas",
                                component: new TextInputBuilder({
                                    customId: "incorrectAnswers",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Quais as respostas incorretas?",
                                    value: question.incorrectAnswers.join(", ")
                                })
                            })
                        )
                    })
                    return;
                }
                const incorrectAnswers = interaction.fields.getTextInputValue("incorrectAnswers").split(",").map(t => t.trim());

                await redis.setex(`devmenu:tryvia:add`, 60 * 60, JSON.stringify({
                    ...question,
                    incorrectAnswers
                }));

                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: question.question,
                    difficulty: question.difficulty,
                    tags: question.tags,
                    correctAnswer: question.correctAnswer,
                    correctAnswersVariation: question.correctAnswersVariation,
                    incorrectAnswers
                }));
                return;
            }
            case "submit": {
                if (!interaction.isButton()) return;

                await prisma.tryviaQuestions.create({
                    data: {
                        correctAnswer: question.correctAnswer,
                        correctAnswersVariation: question.correctAnswersVariation,
                        difficulty: question.difficulty,
                        explanation: question.explanation,
                        incorrectAnswers: question.incorrectAnswers,
                        question: question.question,
                        tags: question.tags,
                        origin: "ADMIN",
                        status: "APPROVED",
                    }
                })

                await redis.del(`devmenu:tryvia:add`);
                interaction.editReply(menus.dev.tryvia.addQuestion({
                    question: null,
                    difficulty: null,
                    tags: null,
                    correctAnswer: null,
                    correctAnswersVariation: null,
                    incorrectAnswers: null
                }))
                interaction.followUp(resv2.success("Pergunta adicionada com sucesso!"));
                return;
            }
        }
    },
});