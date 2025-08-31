import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { TryviaGame } from "#types/tryviaGames.js";
import { ButtonInteraction, DiscordAPIError, Message, userMention } from "discord.js";
import * as g from "../../events/tryvia/response.js";
import { menus } from "#menus";
import { createEmbed } from "@magicyan/discord";
import { settings } from "#settings";

createResponder({
    customId: "tryvia/game/multiple/:success/:letter",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            success: params.success === "true"
        }
    },
    async run(interaction, { success }) {
        const key = `tryvia:game:${interaction.channelId}`;
        await interaction.deferUpdate();
        const raw = await redis.get(key);
        if (!raw) {
            interaction.editReply(res.danger(`${icon.denied} | Não existe um jogo nesse canal!`))
            return;
        }
        const game = JSON.parse(raw) as TryviaGame;
        let participant = game.participants.find(p => p.id === interaction.user.id);
        if (!participant) {
            participant = {
                id: interaction.user.id,
                streak: 0,
                points: 0,
                correctAnswers: [],
                incorrectAnswers: []
            }
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
            game.participants.push(participant);
        }
        if (!success) {
            participant.incorrectAnswers.push(game.questions[game.currentQuestion]);
            participant.streak = 0;
            await redis.set(key, JSON.stringify(game));
            interaction.followUp(res.danger(`${icon.denied} | Resposta errada!`))
            return;
        }
        const currentTimeout = g.timeoutMap.get(key);
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            g.timeoutMap.delete(key);
        }

        await interaction.editReply(menus.tryviaGame.question(game, true))

        await prisma.guildMember.upsert({
            where: {
                guildId_id: {
                    id: interaction.user.id,
                    guildId: interaction.guildId!,
                },
            },
            update: {
                tryviaPoints: {
                    increment: 1
                }
            },
            create: {
                tryviaPoints: 1,
                id: interaction.user.id,
                guildId: interaction.guildId!,
            }
        })

        participant.correctAnswers.push(game.questions[game.currentQuestion]);
        participant.streak++;
        participant.points += game.questions[game.currentQuestion].difficulty === "HARD" ? 3 : game.questions[game.currentQuestion].difficulty === "MEDIUM" ? 2 : 1;
        game.participants.forEach(p => {
            if (p.id === interaction.user.id) return;
            p.streak = 0;
        })

        await redis.set(key, JSON.stringify(game));

        const messagesVariation = [
            ...g.messagesByDifficulty.GENERAL,
            ...g.messagesByDifficulty[game.questions[game.currentQuestion].difficulty || "GENERAL"],
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

        const msgSended = await interaction.followUp(res.success(finalMessage, {
            embeds: [
                createEmbed({
                    description: `**Explicação:** ${game.questions[game.currentQuestion].explanation}`,
                    color: settings.colors.fuchsia
                })
            ],
            content: userMention(interaction.user.id),
            flags: []
        }));

        // Verificar se é fim de jogo
        if (game.currentQuestion >= game.questions.length - 1) {
            await redis.del(key);
            g.timeoutMap.delete(key);
            const top1User = await interaction.client.users.fetch(game.participants[0]?.id).catch(() => interaction.client.user);
            if (game.participants.length > 2) {
                await prisma.guildMember.upsert({
                    where: {
                        guildId_id: {
                            id: top1User.id,
                            guildId: interaction.guildId!,
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
                        guildId: interaction.guildId!,
                    }
                })
            }
            const gameOverMessage = await g.sendGameOverMessage(interaction.channel!, game, top1User);
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
        await interaction.deleteReply().catch(() => { })
        await handleIntervalAndQuestion(interaction, game, key, msgSended);
    },
});

async function handleQuestionTimeout(
    msg: ButtonInteraction<"cached">,
    key: string,
    questionMsg: Message,
    freshGame: TryviaGame
) {
    // Carregar game fresco do Redis
    const rawTimeout = await redis.get(key);
    if (!rawTimeout) {
        g.timeoutMap.delete(key);
        return;
    }
    const timeoutGame = JSON.parse(rawTimeout) as TryviaGame;

    // Verificar se ainda é a pergunta correta
    if (timeoutGame.currentQuestion !== freshGame.currentQuestion) {
        g.timeoutMap.delete(key);
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
    const questionMsgSended = await questionMsg.reply(res.warning("Ninguém respondeu a pergunta em 20 segundos! Streaks zerados.", {
        embeds: [
            createEmbed({
                description: `Resposta correta: **${timeoutGame.questions[timeoutGame.currentQuestion].correctAnswer}**. \n **Explicação:** ${timeoutGame.questions[timeoutGame.currentQuestion].explanation}`,
                color: settings.colors.fuchsia
            })
        ]
    }));

    // Verificar se deve finalizar por 3 perguntas sem resposta
    if (timeoutGame.consecutiveNoResponse >= 3) {
        await redis.del(key);
        g.timeoutMap.delete(key);
        const finalTop1User = await msg.client.users
            .fetch(timeoutGame.participants[0]?.id)
            .catch(() => msg.client.user);
        await g.sendGameOverMessage(msg.channel!, timeoutGame, {
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
        g.timeoutMap.delete(key);
        questionMsg.delete().catch(() => { });
        const finalTop1User = await msg.client.users
            .fetch(timeoutGame.participants[0]?.id)
            .catch(() => msg.client.user);
        await g.sendGameOverMessage(msg.channel!, timeoutGame, {
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
}

// Função para enviar intervalo e configurar pergunta
export async function handleIntervalAndQuestion(
    msg: ButtonInteraction<"cached">,
    game: TryviaGame,
    key: string,
    previousMsg: Message // Mensagem anterior (success ou warning)
) {
    if (!msg.channel) return;
    // Enviar mensagem de intervalo
    const top1User = await msg.client.users.fetch(game.participants[0]?.id).catch(() => msg.client.user);
    let intervalMsg = await g.sendIntervalMessage(msg.channel!, game, {
        avatarURL: () => top1User?.displayAvatarURL() || null,
        displayAvatarURL: () => top1User?.displayAvatarURL() || null,
    });

    // Após 10 segundos, editar para pergunta
    const intervalTimeout = setTimeout(async () => {
        // Carregar game fresco do Redis
        const rawInterval = await redis.get(key);
        if (!rawInterval) {
            g.timeoutMap.delete(key);
            return;
        }
        const freshGame = JSON.parse(rawInterval) as TryviaGame;

        // Verificar se ainda é a pergunta correta
        if (freshGame.currentQuestion !== game.currentQuestion) {
            g.timeoutMap.delete(key);
            return;
        }

        let questionMsg: Message;
        try {
            await intervalMsg.edit(menus.tryviaGame.question(freshGame));
            questionMsg = intervalMsg;
        } catch (error: unknown) {
            if (error instanceof DiscordAPIError && error.code === 10008) {
                questionMsg = await msg.channel!.send(menus.tryviaGame.question(freshGame));
            } else {
                console.error("Erro ao editar mensagem de intervalo:", error);
                g.timeoutMap.delete(key);
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
        g.timeoutMap.set(key, questionTimeout);
    }, 1000 * 10);
    g.timeoutMap.set(key, intervalTimeout);
}