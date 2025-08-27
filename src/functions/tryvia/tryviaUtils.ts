import { prisma } from "#database";

export function mapApiDifficultyToPrisma(difficulty: string): 'EASY' | 'MEDIUM' | 'HARD' {
    const difficultyMap = {
        'easy': 'EASY',
        'medium': 'MEDIUM',
        'hard': 'HARD'
    } as const;
    
    return difficultyMap[difficulty as keyof typeof difficultyMap] || 'MEDIUM';
}

export function sanitizeQuestionText(question: string): string {
    // Remove entidades HTML que podem vir da API
    return question
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

export async function questionExists(questionText: string): Promise<boolean> {
    const existing = await prisma.tryviaQuestions.findFirst({
        where: { question: questionText }
    });
    return !!existing;
}