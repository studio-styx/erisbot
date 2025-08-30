import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "devMenu/tryvia",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        interaction.update(menus.dev.dashboard("tryvia"));
        return;
    },
});

createResponder({
    customId: "devMenu/tryvia/fetchAll/:page",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            page: parseInt(params.page)
        }
    },
    async run(interaction, { page }) {
        await interaction.deferUpdate();
        const questions = await prisma.tryviaQuestions.findMany();
        if (questions.length === 0) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Nenhuma pergunta encontrada!`));
            setTimeout(async () => {
                await interaction.editReply(menus.dev.dashboard());
            }, 5000)
            return;
        }
        interaction.editReply(menus.dev.tryvia.fetchAllQuestions(questions, page));
        return;
    }
});

createResponder({
    customId: "devMenu/tryvia/fetchPending/:page",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            page: parseInt(params.page)
        }
    },
    async run(interaction, { page }) {
        await interaction.deferUpdate();
        const questions = await prisma.tryviaQuestions.findMany({
            where: {
                status: "PENDING"
            }
        });
        if (questions.length === 0) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Nenhuma pergunta encontrada!`));
            setTimeout(async () => {
                await interaction.editReply(menus.dev.dashboard());
            }, 5000)
            return;
        }
        interaction.editReply(menus.dev.tryvia.fetchAllPendingQuestions(questions, page));
        return;
    }
});

createResponder({
    customId: "devMenu/tryvia/add",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        interaction.update(menus.dev.tryvia.addQuestion({
            question: null,
            difficulty: null,
            tags: null,
            correctAnswer: null,
            correctAnswersVariation: null,
            incorrectAnswers: null
        }));
        return;
    }
})

createResponder({
    customId: "devMenu/tryvia/edit/:id",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            id: parseInt(params.id)
        }
    },
    async run(interaction, { id }) {
        await interaction.deferUpdate();
        const question = await prisma.tryviaQuestions.findUnique({
            where: { id }
        });
        if (!question) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Pergunta não encontrada!`));
            return;
        }

        interaction.editReply(menus.dev.tryvia.editQuestion(id, {
            question: question.question,
            difficulty: question.difficulty,
            tags: question.tags,
            correctAnswer: question.correctAnswer,
            correctAnswersVariation: question.correctAnswersVariation,
            incorrectAnswers: question.incorrectAnswers
        }));
        return;
    },
});