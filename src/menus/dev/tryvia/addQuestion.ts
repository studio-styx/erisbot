import { settings } from "#settings";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

export function addQuestionMenu<R>(o: {
    question: string | null;
    difficulty: "EASY" | "MEDIUM" | "HARD" | null;
    tags: string[] | null;
    correctAnswer: string | null;
    correctAnswersVariation: string[] | null;
    incorrectAnswers: string[] | null;
}): R {
    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            "## Adicionar questões",
            o.question && `**Pergunta:** ${o.question}`,
            o.difficulty && `**Dificuldade:** ${o.difficulty}`,
            o.tags && `**Tags:** ${o.tags.join(", ")}`,
            o.correctAnswer && `**Resposta Correta:** ${o.correctAnswer}`,
            o.correctAnswersVariation && `**Variações da Resposta Correta:** ${o.correctAnswersVariation.join(", ")}`,
            o.incorrectAnswers && `**Respostas Incorretas:** ${o.incorrectAnswers.join(", ")}`
        ),
        createSeparator(),
        createRow(
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/question",
                label: "Pergunta",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/difficulty",
                label: "Dificuldade",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/tags",
                label: "Tags",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/correctAnswer",
                label: "Resposta Correta",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/correctAnswersVariation",
                label: "Variações da Resposta Correta",
                style: ButtonStyle.Primary
            })
        ),
        createRow(
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/incorrectAnswers",
                label: "Respostas Incorretas",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: "devMenu/tryvia/add/submit",
                label: "Enviar",
                style: ButtonStyle.Primary,
                disabled: !o.question || !o.difficulty || !o.tags || !o.correctAnswer
            }),
            new ButtonBuilder({
                customId: "devMenu/back/tryvia",
                label: "Voltar",
                style: ButtonStyle.Secondary
            })
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}