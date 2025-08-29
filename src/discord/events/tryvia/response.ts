import { redis } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { TryviaGame } from "#types/tryviaGames.js";
import { brBuilder, createContainer, createSection, createSeparator } from "@magicyan/discord";
import { ChannelType, DiscordAPIError, Message, OmitPartialGroupDMChannel, time } from "discord.js";

// Função para normalizar texto, removendo acentos e caracteres especiais
function normalizeText(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[çÇ]/g, "c")
        .replace(/[ãÃõÕôÔáÁàÀâÂäÄéÉèÈêÊëËíÍìÌîÎïÏóÓòÒöÖúÚùÙûÛüÜ]/g, (match) =>
            ({ a: "a", e: "e", i: "i", o: "o", u: "u" }[match[0].toLowerCase()] || match)
        )
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

// Mensagens organizadas por dificuldade e streak
const messagesByDifficulty: Record<string, string[]> = {
    GENERAL: [
        `${icon.Eris_happy} | Parabéns, você acertou a pergunta!`,
        `${icon.Eris_happy} | Incrível! Você acertou a pergunta!`,
        `${icon.Eris_ok} | Certa resposta!`,
        `${icon.success_pink} | Resposta correta! ${icon.Eris_ok_left}`,
        `${icon.Eris_enchanted} | Que legal! Você acertou a resposta!`,
        `${icon.Eris_happy} | 🎯 Acertou em cheio!`,
        `${icon.Eris_ok} | Boa! Resposta certa!`,
        `${icon.Eris_enchanted} | Você mandou bem!`,
        `${icon.success_pink} | 🎉 Acerto preciso!`,
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
    return channel.send({ components: [container] });
}

// Função auxiliar para enviar mensagem de fim de jogo
async function sendGameOverMessage(
    channel: OmitPartialGroupDMChannel<Message<boolean>>["channel"],
    game: TryviaGame,
    top1User: { displayAvatarURL?: () => string | null; avatarURL?: () => string | null }
): Promise<void> {
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
    await channel.send({ components: [container] });
}

// Função principal para processar respostas do jogo de trivia
export async function onResponseTryviaGame(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
    const key = `tryvia:game:${msg.channelId}`;

    try {
        const raw = await redis.get(key);
        if (!raw) return;

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
            msg.channel.type === ChannelType.GuildPublicThread || msg.channel.type === ChannelType.GuildPrivateThread;

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
            game.participants.push(participant);
        }

        // Se não for thread e não for participante, ignorar se errar
        if (!participant && !gotIt) return;

        // Cancelar timeout anterior se alguém respondeu
        if (game.timeoutId) {
            clearTimeout(game.timeoutId);
            game.timeoutId = null;
        }

        if (!gotIt) {
            participant!.incorrectAnswers.push(item);
            await msg.react("❌");
            await redis.set(key, JSON.stringify(game));
            return;
        }

        // Resposta correta
        await msg.react("✅");

        if (!participant) {
            participant = {
                id: msg.author.id,
                streak: 0,
                points: 0,
                correctAnswers: [],
                incorrectAnswers: [],
            };
            game.participants.push(participant);
        }

        participant.streak = (participant.streak ?? 0) + 1;
        participant.points += item.difficulty === "HARD" ? 3 : item.difficulty === "MEDIUM" ? 2 : 1;
        participant.correctAnswers.push(item);

        const messagesVariation = [
            ...messagesByDifficulty.GENERAL,
            ...messagesByDifficulty[item.difficulty || "GENERAL"],
            ...(participant.streak >= 10
                ? [
                    `${icon.Eris_enchanted} | 🏆 LENDA VIVA! ${participant.streak} acertos seguidos!`,
                    `${icon.success_pink} | 🌟 MITO! Sequência de ${participant.streak} vitórias!`,
                    `${icon.Eris_happy} | 💎 LENDÁRIO! ${participant.streak} respostas certas!`,
                ]
                : []),
            ...(participant.streak >= 5
                ? [
                    `${icon.Eris_enchanted} | 🔥 EM CHAMAS! ${participant.streak} acertos consecutivos!`,
                    `${icon.success_pink} | 🚀 FOGUETE! Sequência de ${participant.streak} acertos!`,
                    `${icon.Eris_happy} | 💫 INCRÍVEL! ${participant.streak} seguidos!`,
                ]
                : []),
            ...(participant.streak >= 3
                ? [
                    `${icon.Eris_ok} | 📈 Em crescimento! ${participant.streak} seguidos!`,
                    `${icon.success_pink} | 🎯 No alvo! ${participant.streak} acertos consecutivos!`,
                    `${icon.Eris_happy} | ⚡ Em ritmo! ${participant.streak} certas!`,
                ]
                : []),
        ];

        const randomMessage = messagesVariation[Math.floor(Math.random() * messagesVariation.length)];
        const finalMessage =
            participant.streak > 1
                ? `${randomMessage}\n📊 **Streak:** ${participant.streak} acertos consecutivos!`
                : randomMessage;

        const msgSended = await msg.reply(res.success(finalMessage));

        // Verificar se é fim de jogo
        if (game.currentQuestion >= game.questions.length - 1) {
            await redis.del(key);
            const top1User = await msg.client.users.fetch(game.participants[0]?.id).catch(() => msg.client.user);
            await sendGameOverMessage(msg.channel, game, top1User);
            return;
        }

        // Avançar para próxima pergunta
        game.currentQuestion++;
        await redis.set(key, JSON.stringify(game));

        // Enviar mensagem de intervalo
        const top1User = await msg.client.users.fetch(game.participants[0]?.id).catch(() => msg.client.user);
        let intervalMsg = await sendIntervalMessage(msg.channel, game, top1User);

        // Após 10 segundos, enviar próxima pergunta
        game.timeoutId = setTimeout(async () => {
            let questionMsg: Message;
            try {
                await intervalMsg.edit(menus.tryviaGame.question(game));
                questionMsg = intervalMsg;
            } catch (error: unknown) {
                if (error instanceof DiscordAPIError && error.code === 10008) {
                    questionMsg = await msg.channel.send(menus.tryviaGame.question(game));
                } else {
                    throw error;
                }
            }
            await msgSended.delete().catch(() => {});

            // Iniciar timeout de 20 segundos para respostas
            game.timeoutId = setTimeout(async () => {
                game.participants.forEach((p) => (p.streak = 0));
                await redis.set(key, JSON.stringify(game));
                await questionMsg.reply(res.warning("Ninguém acertou a pergunta em 20 segundos! Streaks zerados."));

                if (game.currentQuestion >= game.questions.length - 1) {
                    await redis.del(key);
                    const finalTop1User = await msg.client.users
                        .fetch(game.participants[0]?.id)
                        .catch(() => msg.client.user);
                    await sendGameOverMessage(msg.channel, game, finalTop1User);
                    return;
                }

                game.currentQuestion++;
                await redis.set(key, JSON.stringify(game));

                const finalTop1User = msg.client.users.cache.get(game.participants[0]?.id)

                let newIntervalMsg = await sendIntervalMessage(msg.channel, game, {
                    avatarURL: () => finalTop1User?.displayAvatarURL() || null,
                    displayAvatarURL: () => finalTop1User?.displayAvatarURL() || null,
                });
                game.timeoutId = setTimeout(async () => {
                    try {
                        await newIntervalMsg.edit(menus.tryviaGame.question(game));
                    } catch (error: unknown) {
                        if (error instanceof DiscordAPIError && error.code === 10008) {
                            await msg.channel.send(menus.tryviaGame.question(game));
                        } else {
                            throw error;
                        }
                    }
                }, 1000 * 10);
                await redis.set(key, JSON.stringify(game));
            }, 1000 * 20);
            await redis.set(key, JSON.stringify(game));
        }, 1000 * 10);

        await redis.set(key, JSON.stringify(game));
    } catch (error: unknown) {
        console.error("Erro no sistema de trivia:", error);
        await msg.reply(res.danger("Ocorreu um erro ao processar sua resposta. Tente novamente!"));
    }
}