import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { TryviaGame } from "#types/tryviaGames.js";
import { brBuilder, createContainer, createEmbed, createSection, createSeparator } from "@magicyan/discord";
import { ChannelType, DiscordAPIError, Message, OmitPartialGroupDMChannel, time } from "discord.js";

export const timeoutMap = new Map<string, NodeJS.Timeout>();

// Função para normalizar texto, removendo acentos e caracteres especiais
function normalizeText(text: string): string {
    return text
        .toLowerCase() // Mover para o início - converte TUDO para minúsculas primeiro
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[ç]/g, "c") // Agora só precisa das minúsculas
        .replace(/[ãõôáàâäéèêëíìîïóòöúùûü]/g, (match) =>
            ({ a: "a", e: "e", i: "i", o: "o", u: "u" }[match] || match)
        )
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Mensagens organizadas por dificuldade e streak
export const messagesByDifficulty: Record<string, string[]> = {
    GENERAL: [
        `${icon.Eris_happy} | Parabéns, você acertou a pergunta!`,
        `${icon.Eris_happy} | Incrível! Você acertou a pergunta!`,
        `${icon.Eris_ok} | Certa resposta!`,
        `${icon.success} | Resposta correta! ${icon.Eris_ok_left}`,
        `${icon.Eris_enchanted} | Que legal! Você acertou a resposta!`,
        `${icon.Eris_happy} | 🎯 Acertou em cheio!`,
        `${icon.Eris_ok} | Boa! Resposta certa!`,
        `${icon.Eris_enchanted} | Você mandou bem!`,
        `${icon.success} | 🎉 Acerto preciso!`,
        `${icon.Eris_happy} | 👏 Excelente! Você acertou!`,
        `${icon.Eris_ok} | 🧠 Inteligente! Resposta correta!`,
        `${icon.Eris_enchanted} | 💫 Você brilhou nessa!`,
    ],
    EASY: [
        `${icon.Eris_happy} | Fácil demais pra você! ${icon.Eris_ok_left}`,
        `${icon.Eris_ok} | Você nem precisou pensar muito!`,
        `${icon.success_pink} | 🎯 Acertou sem dificuldade!`,
        `${icon.Eris_happy} | 👶 Essa era moleza!`,
        `${icon.Eris_ok} | 💨 Fácil como sopa!`,
        `${icon.Eris_enchanted} | 🍰 Pedaço de bolo pra você!`,
        `${icon.success_pink} | 😎 De primeira! Você domina o fácil!`,
        `${icon.Eris_happy} | 🏆 Campeão das perguntas fáceis!`,
        `${icon.Eris_ok} | 🌟 Você faz parecer fácil!`,
        `${icon.Eris_enchanted} | 🚀 Fácil demais para seu nível!`,
    ],
    MEDIUM: [
        `${icon.Eris_enchanted} | Boa! Uma pergunta média não te assusta!`,
        `${icon.Eris_ok} | 💪 Você mandou bem na média!`,
        `${icon.success_pink} | 🎯 Acertou uma de nível médio! ${icon.Eris_ok_left}`,
        `${icon.Eris_happy} | 👏 Média pra você é fácil!`,
        `${icon.Eris_enchanted} | 🧠 Conhecimento médio dominado!`,
        `${icon.success_pink} | 🌟 Você equilibrou bem essa!`,
        `${icon.Eris_ok} | 💫 Média? Mais uma vitória!`,
        `${icon.Eris_happy} | 🏅 Medalha de prata garantida!`,
        `${icon.Eris_enchanted} | 🔥 Esquentou, mas você conseguiu!`,
        `${icon.success_pink} | 🎪 Show na pergunta média!`,
    ],
    HARD: [
        `${icon.Eris_enchanted} | Que isso ein? Você acertou uma difícil!`,
        `${icon.Eris_enchanted} | Impressionante! Uma pergunta difícil!`,
        `${icon.Eris_happy} | Essa é para poucos, e você conseguiu! ${icon.Eris_enchanted_left}`,
        `${icon.success_pink} | 🧠 GÊNIO! Você acertou uma difícil!`,
        `${icon.Eris_enchanted} | 💎 Raridade! Poucos acertariam essa!`,
        `${icon.Eris_happy} | 🏆 CAMPEÃO das perguntas difíceis!`,
        `${icon.success_pink} | 🌟 BRILHOU na dificuldade máxima!`,
        `${icon.Eris_enchanted} | 🔥 DESBRAVADOR das perguntas difíceis!`,
        `${icon.Eris_happy} | 🎯 PRECISÃO absurta numa difícil!`,
        `${icon.Eris_enchanted} | 🧩 Quebra-cabeça complexo resolvido!`,
        `${icon.Eris_happy} | 🏔️ Escalou o Everest das perguntas!`,
    ],
};

// Função auxiliar para enviar mensagem de intervalo
export async function sendIntervalMessage(
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
    return channel.send({ components: [container], flags: ["IsComponentsV2"] }).then(res => {
        console.log("Mensagem de intervalo enviada com sucesso", new Date().toLocaleString());
        return res;
    }).catch(err => {
        console.error("Erro ao enviar mensagem de intervalo:", err);
        throw err;
    });
}

// Função auxiliar para enviar mensagem de fim de jogo
export async function sendGameOverMessage(
    channel: OmitPartialGroupDMChannel<Message<boolean>>["channel"],
    game: TryviaGame,
    top1User: { displayAvatarURL?: () => string | null; avatarURL?: () => string | null }
): Promise<Message> {
    const ranking = game.participants.sort((a, b) => b.points - a.points);
    const container = createContainer({
        accentColor: settings.colors.success,
        components: [
            brBuilder(`# Fim de jogo`),
            createSeparator(),
            brBuilder(
                game.questions.length > 5
                    ? `Tivemos várias perguntas até chegarmos aqui`
                    : `Tivemos algumas perguntas até chegarmos aqui`,
                `Perguntas difíceis e fáceis, e ${game.participants.length} participantes!`,
                "Com isso, o nosso ranking ficou assim:"
            ),
            createSeparator(),
            createSection({
                content: ranking.map((p, i) => `**${i + 1}.** - **<@${p.id}>** - **${p.points}** pontos`).join("\n"),
                thumbnail: top1User?.displayAvatarURL?.() ?? top1User?.avatarURL?.() ?? channel.client.user.displayAvatarURL(),
            }),
        ],
    });
    return await channel.send({ components: [container], flags: ["IsComponentsV2"] });
}

// Função para lidar com o timeout da pergunta
async function handleQuestionTimeout(
    msg: OmitPartialGroupDMChannel<Message<boolean>>,
    key: string,
    questionMsg: Message,
    freshGame: TryviaGame
) {
    try {
        // Carregar game fresco do Redis
        const rawTimeout = await redis.get(key);
        if (!rawTimeout) {
            timeoutMap.delete(key);
            return;
        }
        const timeoutGame = JSON.parse(rawTimeout) as TryviaGame;

        // Verificar se ainda é a pergunta correta
        if (timeoutGame.currentQuestion !== freshGame.currentQuestion) {
            timeoutMap.delete(key);
            return;
        }

        // Incrementar contador se não houve respostas (atividade zero)
        if (!timeoutGame.hasResponse) {
            timeoutGame.consecutiveNoResponse = (timeoutGame.consecutiveNoResponse || 0) + 1;
        } else {
            timeoutGame.consecutiveNoResponse = 0;
        }

        // Resetar streaks
        timeoutGame.participants.forEach((p) => (p.streak = 0));
        timeoutGame.hasResponse = false;

        // Salvar estado
        await redis.set(key, JSON.stringify(timeoutGame));

        // Enviar mensagem de no response
        const questionMsgSended = await questionMsg.reply(res.warning("Ninguém acertou ou respondeu a pergunta em 20 segundos! Streaks zerados.", {
            embeds: [
                createEmbed({
                    description: `A resposta correta era: **${timeoutGame.questions[timeoutGame.currentQuestion].correctAnswer}**. \n **Explicação:** ${timeoutGame.questions[timeoutGame.currentQuestion].explanation}`,
                    color: settings.colors.fuchsia
                })
            ]
        }));

        // Verificar se deve finalizar por 3 perguntas sem resposta
        if (timeoutGame.consecutiveNoResponse >= 3) {
            await redis.del(key);
            timeoutMap.delete(key);
            const finalTop1User = await msg.client.users
                .fetch(timeoutGame.participants[0]?.id)
                .catch(() => msg.client.user);
            await sendGameOverMessage(msg.channel, timeoutGame, {
                avatarURL: () => finalTop1User?.displayAvatarURL() || null,
                displayAvatarURL: () => finalTop1User?.displayAvatarURL() || null,
            });
            await questionMsg.reply(res.warning("Ninguém respondeu a 3 perguntas consecutivas. Jogo finalizado!"));
            await questionMsgSended.delete().catch(() => { });
            return;
        }

        // Verificar se é fim de jogo
        if (timeoutGame.currentQuestion >= timeoutGame.questions.length - 1) {
            await redis.del(key);
            timeoutMap.delete(key);
            questionMsg.delete().catch(() => { });
            const finalTop1User = await msg.client.users
                .fetch(timeoutGame.participants[0]?.id)
                .catch(() => msg.client.user);
            await sendGameOverMessage(msg.channel, timeoutGame, {
                avatarURL: () => finalTop1User?.displayAvatarURL() || null,
                displayAvatarURL: () => finalTop1User?.displayAvatarURL() || null,
            });
            return;
        }

        // Avançar para próxima pergunta
        questionMsg.delete().catch(() => { });
        timeoutGame.currentQuestion++;
        timeoutGame.hasResponse = false;
        await redis.set(key, JSON.stringify(timeoutGame));

        // Iniciar novo ciclo de intervalo e pergunta
        await handleIntervalAndQuestion(msg, timeoutGame, key, questionMsgSended);
    } catch (error: unknown) {
        console.error("Erro ao lidar com timeout da pergunta:", error);
        msg.channel.send(res.danger(`${icon.error} | Ocorreu um erro ao processar a próxima pergunta`))
    }
}

// Função para enviar intervalo e configurar pergunta
async function handleIntervalAndQuestion(
    msg: OmitPartialGroupDMChannel<Message<boolean>>,
    game: TryviaGame,
    key: string,
    previousMsg: Message // Mensagem anterior (success ou warning)
) {
    // Enviar mensagem de intervalo
    const top1User = await msg.client.users.fetch(game.participants[0]?.id).catch(() => msg.client.user);
    let intervalMsg = await sendIntervalMessage(msg.channel, game, {
        avatarURL: () => top1User?.displayAvatarURL() || null,
        displayAvatarURL: () => top1User?.displayAvatarURL() || null,
    });

    // Após 10 segundos, editar para pergunta
    const intervalTimeout = setTimeout(async () => {

        // Carregar game fresco do Redis
        const rawInterval = await redis.get(key);
        if (!rawInterval) {
            timeoutMap.delete(key);
            return;
        }
        const freshGame = JSON.parse(rawInterval) as TryviaGame;

        // Verificar se ainda é a pergunta correta
        if (freshGame.currentQuestion !== game.currentQuestion) {
            timeoutMap.delete(key);
            return;
        }

        let questionMsg: Message;
        try {
            await intervalMsg.edit(menus.tryviaGame.question(freshGame));
            questionMsg = intervalMsg;
        } catch (error: unknown) {
            if (error instanceof DiscordAPIError && error.code === 10008) {
                questionMsg = await msg.channel.send(menus.tryviaGame.question(freshGame));
            } else {
                timeoutMap.delete(key);
                return;
            }
        }
        await previousMsg.delete().catch(() => { });

        // Reset hasResponse for this new question
        freshGame.hasResponse = false;
        await redis.set(key, JSON.stringify(freshGame));

        // Set timeout for question response
        const questionTimeout = setTimeout(async () => {
            await handleQuestionTimeout(msg, key, questionMsg, freshGame);
        }, 1000 * 20);
        timeoutMap.set(key, questionTimeout);
    }, 1000 * 10);
    timeoutMap.set(key, intervalTimeout);
}

// Função principal para processar respostas do jogo de trivia
export async function onResponseTryviaGame(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (msg.author.bot) return;
    const key = `tryvia:game:${msg.channelId}`;
    
    const raw = await redis.get(key);
    if (!raw) return;
    try {
        const game = JSON.parse(raw) as TryviaGame;
        const item = game.questions[game.currentQuestion];
        if (!item) {
            await redis.del(key);
            await msg.reply(res.danger("Erro: Nenhuma pergunta encontrada para o índice atual."));
            return;
        }

        const userResponse = normalizeText(msg.content);
        const correctAnswer = normalizeText(item.correctAnswer);
        const variations = item.correctAnswersVariation.map(normalizeText);
        const gotIt = userResponse === correctAnswer || variations.includes(userResponse);
        const isThread =
            msg.channel.type === ChannelType.PublicThread || msg.channel.type === ChannelType.PrivateThread;

        let participant = game.participants.find((p) => p.id === msg.author.id);

        // Adicionar usuário em tópico mesmo se errar
        if (!participant && isThread) {
            participant = {
                id: msg.author.id,
                streak: 0,
                points: 0,
                correctAnswers: [],
                incorrectAnswers: [],
            };
            await prisma.guildMember.upsert({
                where: {
                    guildId_id: {
                        id: msg.author.id,
                        guildId: msg.guildId!,
                    },
                },
                update: {
                    tryviaGames: {
                        increment: 1,
                    },
                },
                create: {
                    id: msg.author.id,
                    guildId: msg.guildId!,
                    tryviaGames: 1,
                }
            })
            game.participants.push(participant);
        }

        if (!participant && !gotIt) return;
        // Se não for thread e não for participante, ignorar se errar
        game.hasResponse = true;

        if (!gotIt) {
            participant!.incorrectAnswers.push(item);
            await msg.react("❌");
            await redis.set(key, JSON.stringify(game));
            return;
        }

        // Aqui: resposta correta! Cancelar timeout apenas agora
        const currentTimeout = timeoutMap.get(key);
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            timeoutMap.delete(key);
        }

        // Resposta correta, reset counter
        game.consecutiveNoResponse = 0;

        await msg.react("✅");

        if (!participant) {
            participant = {
                id: msg.author.id,
                streak: 0,
                points: 0,
                correctAnswers: [],
                incorrectAnswers: [],
            };
            await prisma.guildMember.upsert({
                where: {
                    guildId_id: {
                        id: msg.author.id,
                        guildId: msg.guildId!,
                    },
                },
                update: {
                    tryviaGames: {
                        increment: 1,
                    },
                },
                create: {
                    id: msg.author.id,
                    guildId: msg.guildId!,
                    tryviaGames: 1,
                }
            })
            game.participants.push(participant);
        }

        await prisma.guildMember.upsert({
            where: {
                guildId_id: {
                    id: msg.author.id,
                    guildId: msg.guildId!,
                },
            },
            update: {
                tryviaPoints: {
                    increment: 1
                }
            },
            create: {
                tryviaPoints: 1,
                id: msg.author.id,
                guildId: msg.guildId!,
            }
        })

        participant.streak = (participant.streak ?? 0) + 1;
        participant.points += item.difficulty === "HARD" ? 3 : item.difficulty === "MEDIUM" ? 2 : 1;
        participant.correctAnswers.push(item);
        game.participants.forEach((p) => {
            if (p.id === msg.author.id) return;
            p.streak = 0;
        });

        const messagesVariation = [
            ...messagesByDifficulty.GENERAL,
            ...messagesByDifficulty[item.difficulty || "GENERAL"],
            ...(participant.streak >= 10
                ? [
                    `${icon.Eris_enchanted} | 🏆 LENDA VIVA! ${participant.streak} acertos seguidos!`,
                    `${icon.success} | 🌟 MITO! Sequência de ${participant.streak} vitórias!`,
                    `${icon.Eris_happy} | 💎 LENDÁRIO! ${participant.streak} respostas certas!`,
                ]
                : []),
            ...(participant.streak >= 5
                ? [
                    `${icon.Eris_enchanted} | 🔥 EM CHAMAS! ${participant.streak} acertos consecutivos!`,
                    `${icon.success} | 🚀 FOGUETE! Sequência de ${participant.streak} acertos!`,
                    `${icon.Eris_happy} | 💫 INCRÍVEL! ${participant.streak} seguidos!`,
                ]
                : []),
            ...(participant.streak >= 3
                ? [
                    `${icon.Eris_ok} | 📈 Em crescimento! ${participant.streak} seguidos!`,
                    `${icon.success} | 🎯 No alvo! ${participant.streak} acertos consecutivos!`,
                    `${icon.Eris_happy} | ⚡ Em ritmo! ${participant.streak} certas!`,
                ]
                : []),
        ];

        const randomMessage = messagesVariation[Math.floor(Math.random() * messagesVariation.length)];
        const finalMessage =
            participant.streak > 1
                ? `${randomMessage}\n${icon.investment_graph} **Streak:** ${participant.streak} acertos consecutivos!`
                : randomMessage;

        const msgSended = await msg.reply(res.success(finalMessage, {
            embeds: [
                createEmbed({
                    description: `**Explicação:** ${item.explanation}`,
                    color: settings.colors.fuchsia
                })
            ]
        }));

        // Verificar se é fim de jogo
        if (game.currentQuestion >= game.questions.length - 1) {
            await redis.del(key);
            timeoutMap.delete(key);
            const top1User = await msg.client.users.fetch(game.participants[0]?.id).catch(() => msg.client.user);
            if (game.participants.length > 2) {
                await prisma.guildMember.upsert({
                    where: {
                        guildId_id: {
                            id: top1User.id,
                            guildId: msg.guildId!,
                        },
                    },
                    update: {
                        tryviaWins: {
                            increment: 1
                        }
                    },
                    create: {
                        tryviaWins: 1,
                        id: top1User.id,
                        guildId: msg.guildId!,
                    }
                })
            }
            const gameOverMessage = await sendGameOverMessage(msg.channel, game, top1User);
            if (game.participants.length < 3) {
                gameOverMessage.reply(res.danger(`${icon.Eris_cry} | Infelizmente como tivemos menos de **3** participantes o ganhador não ganhou wins.`))
            }
            return;
        }

        // Avançar para próxima pergunta e reset hasResponse
        game.currentQuestion++;
        game.hasResponse = false;
        await redis.set(key, JSON.stringify(game));

        // Iniciar ciclo de intervalo e pergunta
        await handleIntervalAndQuestion(msg, game, key, msgSended);
    } catch (error: unknown) {
        console.error("Erro no sistema de trivia:", error);
        await msg.reply(res.danger("Ocorreu um erro ao processar sua resposta. Tente novamente!"));
    }
}