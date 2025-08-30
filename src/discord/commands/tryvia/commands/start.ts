import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { TryviaQuestions } from "#prisma";
import { settings } from "#settings";
import { TryviaGame } from "#types/tryviaGames.js";
import { createContainer, brBuilder, createSeparator, createSection, createEmbed } from "@magicyan/discord";
import { ChatInputCommandInteraction, DiscordAPIError, Message, OmitPartialGroupDMChannel, time } from "discord.js";

async function sendIntervalMessage(
    channel: OmitPartialGroupDMChannel<Message<boolean>>["channel"],
    game: TryviaGame,
    top1User: { displayAvatarURL?: () => string | null; avatarURL?: () => string | null }
): Promise<Message> {
    const ranking = game.participants.sort((a, b) => b.points - a.points);
    const container = createContainer({
        accentColor: settings.colors.azoxo,
        components: [
            brBuilder(`# Intervalo`),
            createSeparator(),
            createSection({
                content: brBuilder(
                    `Próxima pergunta ${time(new Date(Date.now() + 1000 * 10), "R")}`,
                    "Aproveite esse tempo para descansar, e pensar sobre a próxima pergunta.",
                    "## Melhores usuários:",
                    ranking
                        .slice(0, 10)
                        .map((p, i) => `**${i + 1}.** - **<@${p.id}>** - **${p.points}** pontos`)
                        .join("\n")
                ),
                thumbnail: top1User?.displayAvatarURL?.() ?? top1User?.avatarURL?.() ?? channel.client.user.displayAvatarURL(),
            }),
        ],
    });
    return channel.send({ components: [container], flags: ["IsComponentsV2"] });
}

// Função auxiliar para construir a query de forma segura
function buildSafeQuery(category: string | null, difficultyFilter: { in: string[] } | null, questionTypeFilter: { in: string[] } | null, amount: number) {
    let whereParts: string[] = [];
    let parameters: any[] = [];
    let paramIndex = 1;

    // Condição base
    whereParts.push("status = 'APPROVED'");

    // Filtro de categoria (seguro contra SQL Injection)
    if (category) {
        whereParts.push(`$${paramIndex} = ANY(tags)`);
        parameters.push(category);
        paramIndex++;
    }

    // Filtro de dificuldade com type cast corrigido
    if (difficultyFilter?.in) {
        const difficultyPlaceholders = difficultyFilter.in.map(() => `$${paramIndex++}::"TryviaDifficulty"`).join(',');
        whereParts.push(`difficulty IN (${difficultyPlaceholders})`);
        parameters.push(...difficultyFilter.in);
    }

    // Filtro de tipo de pergunta com type cast (se necessário)
    if (questionTypeFilter?.in) {
        const typePlaceholders = questionTypeFilter.in.map(() => `$${paramIndex++}::"TryviaTypes"`).join(',');
        whereParts.push(`type IN (${typePlaceholders})`);
        parameters.push(...questionTypeFilter.in);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    return {
        query: `SELECT * FROM "TryviaQuestions" ${whereClause} ORDER BY RANDOM() LIMIT $${paramIndex}`,
        parameters: [...parameters, Math.min(amount, 30)]
    };
}

export async function startTryviaGame(interaction: ChatInputCommandInteraction<"cached">) {
    if (!interaction.channel) {
        interaction.reply(res.danger(`${icon.error} | Esse comando deve ser usado em um canal de texto!`))
        return;
    }
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
    const questionType = interaction.options.getString("type");

    type DifficultyType = "easy" | "medium" | "hard" | "easy_medium" | "medium_hard" | "easy_hard";

    const difficultyMap: Record<DifficultyType, string[]> = {
        easy: ["EASY"],
        medium: ["MEDIUM"],
        hard: ["HARD"],
        easy_medium: ["EASY", "MEDIUM"],
        medium_hard: ["MEDIUM", "HARD"],
        easy_hard: ["EASY", "HARD"]
    };

    type QuestionType = "boolean" | "multiple" | "writeInChat" | "boolean_multiple" | "boolean_writeInChat" | "multiple_writeInChat";

    const questionMap: Record<QuestionType, string[]> = {
        boolean: ["BOOLEAN"],
        multiple: ["MULTIPLE"],
        writeInChat: ["WRITEINCHAT"],
        boolean_multiple: ["BOOLEAN", "MULTIPLE"],
        boolean_writeInChat: ["BOOLEAN", "WRITEINCHAT"],
        multiple_writeInChat: ["MULTIPLE", "WRITEINCHAT"]
    };

    // Validar se a dificuldade é válida
    const isValidDifficulty = (input: string | null): input is DifficultyType => {
        return input !== null && input in difficultyMap;
    };

    const difficultyFilter = isValidDifficulty(difficultyInput) ? {
        in: difficultyMap[difficultyInput]
    } : null;

    // Validar se o tipo de pergunta é válido
    const isValidQuestionType = (input: string | null): input is QuestionType => {
        return input !== null && input in questionMap;
    };

    const questionTypeFilter = isValidQuestionType(questionType) ? {
        in: questionMap[questionType]
    } : null;

    // AGORA passando os objetos corretos para a função
    const { query, parameters } = buildSafeQuery(category, difficultyFilter, questionTypeFilter, amount);
    const questions = await prisma.$queryRawUnsafe(query, ...parameters) as TryviaQuestions[];

    if (questions.length === 0) {
        interaction.editReply(res.danger(`${icon.Eris_cry} | Não foi possivel encontrar perguntas baseadas nesses parametros`))
        return;
    }

    const object: TryviaGame = {
        questions: questions, // Já vem randomizado do banco, não precisa embaralhar de novo
        currentQuestion: 0,
        owner: interaction.user.id,
        channel: interaction.channelId,
        participants: [{
            correctAnswers: [],
            incorrectAnswers: [],
            id: interaction.user.id,
            points: 0,
            streak: 0
        }],
        timeoutId: null,
        hasResponse: false,
        consecutiveNoResponse: 0
    };

    await prisma.guildMember.upsert({
        where: {
            guildId_id: {
                id: interaction.user.id,
                guildId: interaction.guildId!,
            },
        },
        update: {
            tryviaGames: {
                increment: 1,
            },
        },
        create: {
            id: interaction.user.id,
            guildId: interaction.guildId!,
            tryviaGames: 1,
        }
    })

    await redis.setex(key, 60 * 30, JSON.stringify(object));

    interaction.editReply(res.success(`${icon.Eris_happy} | Um novo jogo de trivia foi iniciado nesse canal! ${questions.length < amount ? `Por causa de alguns critérios, não foi possivel obter todas as **${amount}** perguntas solicitadas, foram encontradas: **${questions.length}** perguntas.` : ""}`));

    const questionMsg = await interaction.channel.send(menus.tryviaGame.question(object));

    // esperar 20 segundos e verificar se foi respondida
    setTimeout(async () => {
        const alreadyRespondedRaw = await redis.get(key);
        if (!alreadyRespondedRaw) return;
        const data = JSON.parse(alreadyRespondedRaw) as TryviaGame;
        const alreadyResponded = data.currentQuestion !== object.currentQuestion;
        if (alreadyResponded) return;
        object.participants.forEach((p) => (p.streak = 0));
        await redis.set(key, JSON.stringify(object));
        const questionMsgReplied = await questionMsg.reply(res.warning("Ninguém acertou a pergunta em 20 segundos! Streaks zerados.", {
            embeds: [
                createEmbed({
                    description: `A resposta correta era: **${object.questions[object.currentQuestion].correctAnswer}**. \n **Explicação:** ${object.questions[object.currentQuestion].explanation}`,
                    color: settings.colors.fuchsia
                })
            ]
        }));

        const intervealMsg = await sendIntervalMessage(interaction.channel!, object, {
            avatarURL: () => interaction.client.user.displayAvatarURL(),
            displayAvatarURL: () => interaction.client.user.displayAvatarURL()
        });

        object.currentQuestion++;
        await redis.set(key, JSON.stringify(object));

        setTimeout(async () => {
            try {
                await questionMsgReplied.delete().catch(() => { });
                await questionMsg.delete().catch(() => { })
                await intervealMsg.edit(menus.tryviaGame.question(object));
            } catch (error: unknown) {
                if (error instanceof DiscordAPIError && error.code === 10008) {
                    await interaction.channel!.send(menus.tryviaGame.question(object));
                } else {
                    throw error;
                }
            }
        }, 1000 * 10);
        await redis.set(key, JSON.stringify(object));
    }, 1000 * 20);
    return;
}