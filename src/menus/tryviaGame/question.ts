import { settings } from "#settings";
import { TryviaGame } from "#types/tryviaGames.js";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

export function questionMenu<R>(game: TryviaGame, disableButtons?: boolean): R {
    const item = game.questions[game.currentQuestion];

    const alternatives = [
        ...item.incorrectAnswers,
        item.correctAnswer
    ];
    
    function shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    const shuffledAlternatives = shuffleArray(alternatives);
    
    const alternativesText = shuffledAlternatives.map((alt, index) => {
        const letter = String.fromCharCode(65 + index);
        return `${letter}. ${alt}`;
    }).join('\n');

    const buttons: ButtonBuilder[] = [];

    if (item.type === "MULTIPLE") {
        shuffledAlternatives.forEach((alt, index) => {
            const letter = String.fromCharCode(65 + index);
            buttons.push(new ButtonBuilder({
                customId: `tryvia/game/multiple/${alt === item.correctAnswer}/${letter}`,
                label: letter,
                style: ButtonStyle.Primary,
                disabled: disableButtons,
            }));
        });
    }

    if (item.type === "BOOLEAN") {
        if (typeof item.correct !== "boolean") {
            console.error(`Erro: item.correct não é um booleano para a pergunta ${item.id}. Valor encontrado: ${item.correct}`);
            throw new Error("item.correct deve ser um valor booleano para perguntas do tipo BOOLEAN");
        }
        buttons.push(
            new ButtonBuilder({
                customId: `tryvia/game/boolean/${item.correct === true ? "correct" : "incorrect"}`,
                label: "Verdadeiro",
                style: ButtonStyle.Success,
                disabled: disableButtons,
            }),
            new ButtonBuilder({
                customId: `tryvia/game/boolean/${item.correct === false ? "correct" : "incorrect"}`,
                label: "Falso",
                style: ButtonStyle.Danger,
                disabled: disableButtons,
            })
        );
    }

    const container = createContainer(settings.colors.fuchsia,
        brBuilder(
            `### ${game.currentQuestion === 0 ? "Primeira pergunta" : game.currentQuestion === game.questions.length - 1 ? "Última pergunta" : `Pergunta ${game.currentQuestion + 1}`}`
        ),
        createSeparator(),
        brBuilder(
            "# Pergunta:",
            `## ${item.question}`,
            "",
            item.type === "MULTIPLE" ? "# Alternativas:" : null,
            item.type === "MULTIPLE" ? alternativesText : null,
            item.type === "BOOLEAN" ? "# Responda com verdadeiro ou falso:" : null,
            item.type === "WRITEINCHAT" ? "Escreva no chat a resposta correta:" : null,
            "",
            `-# **id:** ${item.id} | **dificuldade**: ${item.difficulty === "EASY" ? "Fácil" : item.difficulty === "MEDIUM" ? "Médio" : "Difícil"}`
        ),
        buttons.length > 0 && createRow(buttons),
        createSeparator(),
        brBuilder(
            `Todos têm 20 segundos para responder! Expira ${time(new Date(Date.now() + 1000 * 20), "R")}`
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}