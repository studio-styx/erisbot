export interface WordleGame {
    word: string;
    attempts: string[];
    maxAttempts: number;
    isOver: boolean;
    isWon: boolean;
    startedAt: Date;
    endedAt?: Date;
    lastAttemptAt?: Date;
    guildId: string;
    channelId: string;
    messageId?: string;
    userId: string;
}