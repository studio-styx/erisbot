import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";
import { menus } from "#menus";
import { TryviaQuestions } from "#prisma";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";

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
                        components: createModalFields({
                            questionI: {
                                label: "Nova pergunta",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Qual a pergunta?"
                            }
                        })
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
                        components: createModalFields({
                            difficulty: {
                                label: "Nova dificuldade",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Qual a dificuldade?",
                            }
                        })
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
                        components: createModalFields({
                            tags: {
                                label: "Novas tags",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Quais as tags?",
                            }
                        })
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
                        components: createModalFields({
                            correctAnswer: {
                                label: "Resposta correta",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Qual a resposta correta?",
                            }
                        })
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
                        components: createModalFields({
                            correctAnswersVariation: {
                                label: "Variações da resposta correta",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Quais as variações da resposta correta?",
                            }
                        })
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
                        components: createModalFields({
                            incorrectAnswers: {
                                label: "Respostas incorretas",
                                style: TextInputStyle.Short,
                                required: true,
                                placeholder: "Quais as respostas incorretas?",
                            }
                        })
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