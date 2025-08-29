import { settings } from "#settings";
import { TryviaGame } from "#types/tryviaGames.js";
import { brBuilder, createContainer, createSeparator } from "@magicyan/discord";
import { type InteractionReplyOptions } from "discord.js";

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
    
    const container = createContainer(settings.colors.azoxo,
        brBuilder(
            `### ${game.currentQuestion === 0 ? "Primeira pergunta" : game.currentQuestion === game.questions.length - 1 ? "Última pergunta" : `Pergunta ${game.currentQuestion + 1}`}`
        ),
        createSeparator(),
        brBuilder(
            "# Pergunta:",
            `## ${item.question}`,
            "",
            "# Alternativas:",
            alternativesText,
            "",
            `-# **id:** ${item.id} | **dificuldade**: ${item.difficulty === "EASY" ? "Fácil" : item.difficulty === "MEDIUM" ? "Médio" : "Difícil"} | **tags:** ${item.tags.join(", ")}`
        ),
        createSeparator(),
        brBuilder(
            "Responda a pergunta escrevendo no chat"
        )
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}