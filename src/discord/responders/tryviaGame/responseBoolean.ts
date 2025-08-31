import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { TryviaGame } from "#types/tryviaGames.js";
import { createEmbed } from "@magicyan/discord";
import * as g from "../../events/tryvia/response.js";
import { handleIntervalAndQuestion } from "./responseMultiple.js";
import { settings } from "#settings";
import { menus } from "#menus";
import { userMention } from "discord.js";

createResponder({
    customId: "tryvia/game/boolean/:success",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            success: params.success === "correct"
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