import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";
import { menus } from "#menus";
import { TryviaQuestions } from "#prisma";
import { createLabel, createModalFields } from "@magicyan/discord";
import { TextInputBuilder, TextInputStyle } from "discord.js";

createResponder({
    customId: "devMenu/tryvia/editO/:field/:id",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    parse(params) {
        return {
            field: params.field as "question" | "difficulty" | "tags" | "correctAnswer" | "correctAnswersVariation" | "incorrectAnswers",
            id: parseInt(params.id)
        }
    },
    async run(interaction, { field, id }) {
        let question: TryviaQuestions | null = null;
        if (!interaction.isButton()) {
            await interaction.deferUpdate();
            question = await prisma.tryviaQuestions.findUniqueOrThrow({
                where: { id }
            }) as TryviaQuestions;
        }
        

        if (!question && !interaction.isButton()) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Pergunta não encontrada!`));
            return;
        }


        switch (field) {
            case "question": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/editO/question/${id}`,
                        title: "Editar Pergunta",
                        components: createModalFields(
                            createLabel({
                                label: "Nova pergunta",
                                component: new TextInputBuilder({
                                    customId: "question",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Qual a pergunta?",
                                    value: question?.question
                                })
                            })
                        )
                    })
                    return;
                }
                const questionI = interaction.fields.getTextInputValue("question");
                const newQuestion = await prisma.tryviaQuestions.update({
                    where: { id },
                    data: { question: questionI }
                });

                interaction.editReply(menus.dev.tryvia.editQuestion(newQuestion.id, {
                    question: newQuestion.question,
                    difficulty: newQuestion.difficulty,
                    tags: newQuestion.tags,
                    correctAnswer: newQuestion.correctAnswer,
                    correctAnswersVariation: newQuestion.correctAnswersVariation,
                    incorrectAnswers: newQuestion.incorrectAnswers
                }));
                return;
            }
            case "difficulty": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/editO/difficulty/${id}`,
                        title: "Editar Dificuldade",
                        components: createModalFields(
                            createLabel({
                                label: "Nova dificuldade",
                                component: new TextInputBuilder({
                                    customId: "difficulty",
                                    style: TextInputStyle.Short,
                                    required: true,
                                    placeholder: "Qual a dificuldade?",
                                    value: question?.difficulty
                                })
                            })
                        )
                    })
                    return;
                }
                const difficulty = interaction.fields.getTextInputValue("difficulty") as "EASY" | "MEDIUM" | "HARD";

                const newQuestion = await prisma.tryviaQuestions.update({
                    where: { id },
                    data: { difficulty }
                });

                interaction.editReply(menus.dev.tryvia.editQuestion(newQuestion.id, {
                    question: newQuestion.question,
                    difficulty: newQuestion.difficulty,
                    tags: newQuestion.tags,
                    correctAnswer: newQuestion.correctAnswer,
                    correctAnswersVariation: newQuestion.correctAnswersVariation,
                    incorrectAnswers: newQuestion.incorrectAnswers
                }));
                return;
            }
            case "tags": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/editO/tags/${id}`,
                        title: "Editar Tags",
                        components: createModalFields(
                            createLabel({
                                label: "Novas tags",
                                component: new TextInputBuilder({
                                    customId: "tags",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Quais as tags?",
                                    value: question?.tags.join(", ")
                                })
                            })
                        )
                    })
                    return;
                }

                const tags = interaction.fields.getTextInputValue("tags").split(",").map(t => t.trim());

                const newQuestion = await prisma.tryviaQuestions.update({
                    where: { id },
                    data: { tags }
                });

                interaction.editReply(menus.dev.tryvia.editQuestion(newQuestion.id, {
                    question: newQuestion.question,
                    difficulty: newQuestion.difficulty,
                    tags: newQuestion.tags,
                    correctAnswer: newQuestion.correctAnswer,
                    correctAnswersVariation: newQuestion.correctAnswersVariation,
                    incorrectAnswers: newQuestion.incorrectAnswers
                }));
                return;
            }
            case "correctAnswer": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/editO/correctAnswer/${id}`,
                        title: "Editar Resposta Correta",
                        components: createModalFields(
                            createLabel({
                                label: "Nova resposta correta",
                                component: new TextInputBuilder({
                                    customId: "correctAnswer",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Qual a resposta correta?",
                                    value: question?.correctAnswer
                                })
                            })
                        )
                    })
                    return;
                }
                const correctAnswer = interaction.fields.getTextInputValue("correctAnswer");

                const newQuestion = await prisma.tryviaQuestions.update({
                    where: { id },
                    data: { correctAnswer }
                });

                interaction.editReply(menus.dev.tryvia.editQuestion(newQuestion.id, {
                    question: newQuestion.question,
                    difficulty: newQuestion.difficulty,
                    tags: newQuestion.tags,
                    correctAnswer: newQuestion.correctAnswer,
                    correctAnswersVariation: newQuestion.correctAnswersVariation,
                    incorrectAnswers: newQuestion.incorrectAnswers
                }));
                return;
            }
            case "correctAnswersVariation": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/editO/correctAnswersVariation/${id}`,
                        title: "Editar Variações da Resposta Correta",
                        components: createModalFields(
                            createLabel({
                                label: "Edite as variações da resposta correta",
                                component: new TextInputBuilder({
                                    customId: "correctAnswersVariation",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Quais as variações da resposta correta?",
                                    value: question?.correctAnswersVariation.join(", ")
                                })
                            })
                        )
                    })
                    return;
                }
                const correctAnswersVariation = interaction.fields.getTextInputValue("correctAnswersVariation").split(",").map(t => t.trim());

                const newQuestion = await prisma.tryviaQuestions.update({
                    where: { id },
                    data: { correctAnswersVariation }
                });

                interaction.editReply(menus.dev.tryvia.editQuestion(newQuestion.id, {
                    question: newQuestion.question,
                    difficulty: newQuestion.difficulty,
                    tags: newQuestion.tags,
                    correctAnswer: newQuestion.correctAnswer,
                    correctAnswersVariation: newQuestion.correctAnswersVariation,
                    incorrectAnswers: newQuestion.incorrectAnswers
                }));
                return;
            }
            case "incorrectAnswers": {
                if (interaction.isButton()) {
                    interaction.showModal({
                        customId: `devMenu/tryvia/editO/incorrectAnswers/${id}`,
                        title: "Editar Respostas Incorretas",
                        components: createModalFields(
                            createLabel({
                                label: "Edite as respostas incorretas",
                                component: new TextInputBuilder({
                                    customId: "incorrectAnswers",
                                    style: TextInputStyle.Paragraph,
                                    required: true,
                                    placeholder: "Quais as respostas incorretas?",
                                    value: question?.incorrectAnswers.join(", ")
                                })
                            })
                        )
                    })
                    return;
                }
                const incorrectAnswers = interaction.fields.getTextInputValue("incorrectAnswers").split(",").map(t => t.trim());

                const newQuestion = await prisma.tryviaQuestions.update({
                    where: { id },
                    data: { incorrectAnswers }
                });

                interaction.editReply(menus.dev.tryvia.editQuestion(newQuestion.id, {
                    question: newQuestion.question,
                    difficulty: newQuestion.difficulty,
                    tags: newQuestion.tags,
                    correctAnswer: newQuestion.correctAnswer,
                    correctAnswersVariation: newQuestion.correctAnswersVariation,
                    incorrectAnswers: newQuestion.incorrectAnswers
                }));
                return;
            }
        }
    },
});