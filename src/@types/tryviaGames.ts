import { TryviaQuestions } from "#prisma";

export interface TryviaGame {
    questions: TryviaQuestions[];
    currentQuestion: number;
    timeoutId: NodeJS.Timeout | null
    owner: string;
    channel: string;
    participants: TryviaGameParticipants[]; // owner includes
    hasResponse: boolean;
    consecutiveNoResponse: number;
}

export interface TryviaGameParticipants {
    id: string;
    streak: number;
    points: number;
    correctAnswers: TryviaQuestions[],
    incorrectAnswers: TryviaQuestions[]
}