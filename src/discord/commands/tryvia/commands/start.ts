import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { TryviaGame } from "#types/tryviaGames.js";
import { ChatInputCommandInteraction } from "discord.js";

export async function startTryviaGame(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply();
    const key = `tryvia:game:${interaction.channelId}`
    await redis.del(key) // apenas para desenvolvimento
    const channelHasGame = await redis.get(key);
    if (channelHasGame) {
        interaction.editReply(res.danger(`${icon.denied} | Já existe um jogo nesse canal!`))
        return;
    }

    const category = interaction.options.getString("category");
    const amount = interaction.options.getInteger("amount") ?? 10;
    const difficultyInput = interaction.options.getString("difficulty");

    type DifficultyType = "easy" | "medium" | "hard" | "easy_medium" | "medium_hard" | "easy_hard";

    // Mapeamento completo com validação
    const difficultyMap: Record<DifficultyType, string[]> = {
        easy: ["EASY"],
        medium: ["MEDIUM"],
        hard: ["HARD"],
        easy_medium: ["EASY", "MEDIUM"],
        medium_hard: ["MEDIUM", "HARD"],
        easy_hard: ["EASY", "HARD"]
    };

    // Validar se a dificuldade é válida
    const isValidDifficulty = (input: string | null): input is DifficultyType => {
        return input !== null && input in difficultyMap;
    };

    const difficultyFilter = isValidDifficulty(difficultyInput) ? {
        in: difficultyMap[difficultyInput]
    } : undefined;

    const questions = await prisma.tryviaQuestions.findMany({
        where: {
            tags: category ? { has: category } : undefined,
            difficulty: difficultyFilter as any,
            status: "APPROVED"
        },
        take: Math.min(amount, 30),
    });

    if (questions.length === 0) {
        interaction.editReply(res.danger(`${icon.Eris_cry} | Não foi possivel encontrar perguntas baseadas nesses parametros`))
        return;
    }

    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    const object: TryviaGame = {
        questions: shuffledQuestions,
        currentQuestion: 0,
        owner: interaction.user.id,
        channel: interaction.channelId,
        participants: [],
        timeoutId: null
    }
    await redis.setex(key, 60 * 30, JSON.stringify(object));
    
    interaction.editReply(menus.tryviaGame.question(object));
    return;
}