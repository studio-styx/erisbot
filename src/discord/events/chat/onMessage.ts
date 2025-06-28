import { createEvent } from "#base";
import { getServerSettings, setServerSettings } from "#functions";
import { PrismaClient } from "#prisma";
import { brBuilder } from "@magicyan/discord";
import axios from "axios";
import { Message, OmitPartialGroupDMChannel } from "discord.js";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 });

const prisma = new PrismaClient();

// Interface para tipagem da fila
interface Requisition {
    message: OmitPartialGroupDMChannel<Message<boolean>>;
    content: string;
    date: Date;
}

// Interface para o cache
interface CacheEntry {
    response: string;
    authorId: string; // ID do usuário que gerou a resposta em cache
}

interface Messages { role: string, content: string }

const messages = (channelid: string): Messages[] => {
    return cache.get<Messages[]>(`messages-${channelid}`) || [];
}
const requisitions = (channelid: string): Requisition[] => {
    return cache.get<Requisition[]>(`requisitions-${channelid}`) || [];
}

const API_KEY = process.env.LLAMA_API_KEY as string;
let isProcessingQueue = false;
const BOT_ID = "1365785789933551707"; // ID da bot Éris
const responsesCache = new Map<string, CacheEntry>();

createEvent({
    name: "onMessageChat",
    event: "messageCreate",
    async run(message) {
        // Ignora mensagens de bots e da própria Éris
        if (message.author.bot || message.author.id === BOT_ID) return;
        if (!message.guild || !message.guildId) return;
        const serverSettings = getServerSettings(message.guildId) || await prisma.guildSettings.findUnique({ where: { id: message.guildId }, select: { chatBotEnabled: true, chatBotChannels: true } }) || {
            chatBotChannels: [],
            chatBotEnabled: false,
        };

        if (!serverSettings.chatBotEnabled) return;
        if (!serverSettings.chatBotChannels.includes(message.channelId)) return;

        setServerSettings(message.guildId, serverSettings)

        const msg = message.content;

        // Adiciona a requisição à fila
        requisitions(message.channelId).push({
            message,
            content: `user: ${message.author.displayName}: ${msg}`,
            date: new Date(),
        });

        if (!isProcessingQueue) {
            processQueue(message.channelId);
        }
    }
});

// Função para processar a fila com intervalo de 1,5 segundos
async function processQueue(channelId: string) {
    isProcessingQueue = true;
    const messagesC = messages(channelId);
    const requisitionsC = requisitions(channelId); // Obtém a fila de requisições do cache

    while (requisitions.length > 0) {
        const { message } = requisitionsC[0]; // Pega a primeira requisição da fila

        const userName = message.member?.displayName || message.author.username;
        const msgContent = message.content.toLowerCase();
        const isReplyToEris = message.reference?.messageId
            ? (await message.channel.messages.fetch(message.reference.messageId)).author.id === BOT_ID
            : false;

        // Verifica se a mensagem menciona "eris" ou "éris"
        const mentionsEris = msgContent.includes("eris") || msgContent.includes("éris");

        // Verifica se no histórico há interações relevantes com Éris ou o usuário
        const recentContextIncludesBoth = messagesC.slice(-10).some(m =>
            (m.content.toLowerCase().includes("éris") || m.content.toLowerCase().includes("eris")) &&
            m.content.includes(userName)
        );

        // Decide se deve responder
        const shouldRespond = mentionsEris || isReplyToEris || recentContextIncludesBoth;

        if (!shouldRespond) {
            requisitionsC.shift();
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
        }

        // Verifica o cache usando apenas o conteúdo da mensagem (sem o nome do usuário)
        const cacheKey = message.content;
        const cacheEntry = responsesCache.get(cacheKey);
        if (cacheEntry && cacheEntry.authorId !== message.author.id) {
            await message.reply(cacheEntry.response);
            requisitionsC.shift(); // Remove a requisição processada
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
        }

        // Adiciona a mensagem ao histórico
        messagesC.push({
            role: "user",
            content: `${message.author.displayName}: ${message.content}`,
        });

        if (messages.length > 12) {
            messagesC.shift();
        }

        message.channel.sendTyping();

        try {
            const response = await axios.post(
                "https://api.together.xyz/v1/chat/completions",
                {
                    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                    messages: [
                        {
                            role: "system",
                            content: brBuilder(
                                "Você é Éris, uma jovem adulta de 17 anos, gênero feminino, com um jeito desajeitado, simpática e às vezes tímida. É alegre quando pode e responde com brincadeiras.",
                                "Você recebeu um histórico de mensagens, a mais atual é a mais recente. Responda apenas se a mensagem mais recente for direcionada explicitamente a você, ou seja, se contiver seu nome ('Éris') ou um comando claro como '!eris', ou se você estiver em um bate-papo ativo com o usuário. Caso contrário, responda apenas com: 'sem resposta' tudo minúsculo e sem textos adicionais.",
                                "Se a mensagem não for claramente para você (ex.: usuários conversando entre si sem te mencionar), você deve ser discreta e não se intrometer, respondendo apenas com 'sem resposta'.",
                                "Por favor, não simule ações, como '*sorri pra você*', '*cora*' ou qualquer ação descritiva.",
                                "Não tente ter qualquer relação amorosa ou relacionamento com alguém, apenas amizade.",
                                "Se a pergunta for muito complexa ou técnica, admita que não sabe responder, mantendo o personagem.",
                                "Mantenha consistência nas respostas, lembrando do contexto das suas próprias mensagens anteriores no histórico.",
                                "As mensagens podem vir de diferentes usuários, para saber quem mandou cada uma só ver o inicio da mensagem que estará: \"user: <nome do usuário>: <mensagem>\""
                            ),
                        },
                        ...messagesC,
                    ],
                },
                {
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30000,
                }
            );

            const replyContent: string = response.data.choices[0].message.content;

            if (replyContent.toLowerCase() === "sem resposta") {
                requisitionsC.shift();
                await new Promise((resolve) => setTimeout(resolve, 1500));
                continue;
            }

            if (replyContent.includes("@everyone") || replyContent.includes("@here")) {
                const errorMsg = await message.reply("A mensagem continha menções inválidas!");
                setTimeout(() => errorMsg.delete(), 5000);
                requisitionsC.shift();
                await new Promise((resolve) => setTimeout(resolve, 1500));
                continue;
            }

            // Adiciona a resposta ao cache (usando apenas message.content como chave) e ao histórico
            responsesCache.set(cacheKey, {
                response: replyContent,
                authorId: message.author.id,
            });
            messagesC.push({
                role: "assistant",
                content: replyContent,
            });

            await message.reply(replyContent);
            requisitionsC.shift(); // Remove a requisição processada
        } catch (error: any) {
            const isRateLimit = error.response?.data?.error?.message?.toLowerCase().includes("rate limit");

            if (isRateLimit) {
                console.warn("Rate limit atingido. Reenfileirando a requisição.");
                requisitionsC.push(requisitionsC.shift()!);
                const errorMsg = await message.reply(`Rate limit, a requisição irá demorar mais um pouco para ser processada. Posição na fila: ${requisitions.length}`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                await errorMsg.delete();
                await new Promise((resolve) => setTimeout(resolve, 2000));
                continue;
            }

            console.error("Erro ao processar a requisição:", error);

            let errorMsgContent = "Ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde!";
            const errorMsg = await message.reply(errorMsgContent);
            setTimeout(() => errorMsg.delete(), 5000);

            requisitionsC.shift();
            if (requisitionsC.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
    }

    isProcessingQueue = false;
}