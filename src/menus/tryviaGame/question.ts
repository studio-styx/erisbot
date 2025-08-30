import { settings } from "#settings";
import { TryviaGame } from "#types/tryviaGames.js";
import { brBuilder, createContainer, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";

export function questionMenu<R>(game: TryviaGame): R {
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

    item.type === "MULTIPLE" && shuffledAlternatives.forEach((alt, index) => {
        const letter = String.fromCharCode(65 + index);
        buttons.push(new ButtonBuilder({
            customId: `tryvia/game/multiple/${alt === item.correctAnswer}`,
            label: letter,
            style: ButtonStyle.Primary,
        }))
    })

    item.type === "BOOLEAN" && buttons.push(
        new ButtonBuilder({
            customId: `tryvia/game/boolean/${item.correct! === true ? "correct" : "incorrect"}`,
            label: "Verdadeiro",
            style: ButtonStyle.Success,
        }),
        new ButtonBuilder({
            customId: `tryvia/game/boolean/${item.correct! === false ? "correct" : "incorrect"}`,
            label: "Verdadeiro",
            style: ButtonStyle.Danger,
        })
    )
    
    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            `### ${game.currentQuestion === 0 ? "Primeira pergunta" : game.currentQuestion === game.questions.length - 1 ? "Última pergunta" : `Pergunta ${game.currentQuestion + 1}`}`
        ),
        createSeparator(),
        brBuilder(
            "# Pergunta:",
            `## ${item.question}`,
            "",
            item.type === "MULTIPLE" && "# Alternativas:",
            item.type === "MULTIPLE" && alternativesText,
            item.type === "BOOLEAN" && "# Resonda com verdadeiro ou falso:",
            item.type !== "WRITEINCHAT" && "Escreva no chat a resposta correta:",
            "",
            `-# **id:** ${item.id} | **dificuldade**: ${item.difficulty === "EASY" ? "Fácil" : item.difficulty === "MEDIUM" ? "Médio" : "Difícil"} | **tags:** ${item.tags.join(", ")}`
        ),
        buttons.length > 0 && createRow(buttons),
        createSeparator(),
        brBuilder(
            `Todos tem 20 segundos para responder! expira ${time(new Date(Date.now() + 1000 * 20), "R")}`
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}