import { createEvent } from "#base";
import { defaultServerSettings, getServerSettings, setServerSettings } from "#functions";
import { PrismaClient } from "#prisma";
import { brBuilder } from "@magicyan/discord";
import axios from "axios";
import { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 2100 });

const prisma = new PrismaClient();

// Interface para tipagem da fila
interface Requisition {
    channelId: string;
    messageId: string;
    authorId: string;
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
        const serverSettings = getServerSettings(message.guildId) || await prisma.guildSettings.findUnique({ where: { id: message.guildId } }) || defaultServerSettings;

        if (!serverSettings.chatBotEnabled) return;
        if (!serverSettings.chatBotChannels.includes(message.channelId)) return;

        setServerSettings(message.guildId, serverSettings)

        const msg = message.content;

        // Adiciona a requisição à fila
        cache.set(`requisitions-${message.channelId}`, [...requisitions(message.channelId), {
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            content: msg,
            date: new Date(),
        }])

        if (!isProcessingQueue) {
            processQueue(message.channelId, message.client, message);
        }
    }
});

// Função para processar a fila com intervalo de 1,5 segundos
async function processQueue(channelId: string, client: Client, omit: OmitPartialGroupDMChannel<Message<boolean>>) {
    isProcessingQueue = true;
    const messagesC = messages(channelId);
    const requisitionsC = requisitions(channelId); // Obtém a fila de requisições do cache

    while (requisitionsC.length > 0) {
        const { messageId, channelId } = requisitionsC[0];

        let message: Message;
        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel?.isTextBased()) throw new Error("Canal inválido");

            message = await channel.messages.fetch(messageId);
        } catch (err) {
            console.warn("Não foi possível buscar a mensagem:", err);
            requisitionsC.shift();
            cache.set(`requisitions-${channelId}`, requisitionsC);
            
            cache.set(`requisitions-${channelId}`, requisitionsC);
            continue;
        }

        const userName = message.member?.displayName || message.author.username;
        const msgContent = message.content.toLowerCase();
        const isReplyToEris = message.reference?.messageId
            ? (await message.channel.messages.fetch(message.reference.messageId)).author.id === BOT_ID
            : false;

        // Adiciona a mensagem ao histórico ANTES de verificar shouldRespond
        messagesC.push({
            role: "user",
            content: `${message.author.displayName}: ${message.content}`,
        });

        // Limita o histórico
        if (messagesC.length > 12) {
            messagesC.shift();
        }
        cache.set(`messages-${channelId}`, messagesC);

        // Remove a mensagem da fila

        // Verifica se a mensagem menciona "eris" ou "éris"
        const mentionsEris = msgContent.includes("eris") || msgContent.includes("éris");

        // Verifica se há interações recentes com Éris no histórico
        const hasRecentInteraction = messagesC.slice(-10).some(m => 
            m.role === "assistant" || 
            m.content.toLowerCase().includes("éris") || 
            m.content.toLowerCase().includes("eris")
        );

        // Decide se deve responder
        const shouldRespond = mentionsEris || isReplyToEris || hasRecentInteraction;

        if (!shouldRespond) {
            requisitionsC.shift();
            cache.set(`requisitions-${channelId}`, requisitionsC);
            
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
        }

        // Verifica o cache usando apenas o conteúdo da mensagem (sem o nome do usuário)
        const cacheKey = message.content;
        const cacheEntry = responsesCache.get(cacheKey);
        if (cacheEntry && cacheEntry.authorId !== message.author.id) {
            await message.reply(cacheEntry.response);
            requisitionsC.shift();
            cache.set(`requisitions-${channelId}`, requisitionsC);
             // Remove a requisição processada
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
        }

        if (messages.length > 12) {
            messagesC.shift();
        }

        omit.channel.sendTyping();

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
                                "Você recebeu um histórico de mensagens, a mais atual é a mais recente. Responda com base nas interações anteriores — se estiverem conversando com você ou se você for parte da conversa, continue naturalmente.",
                                "Se perceber que as pessoas estão falando entre si e não com você, pode ignorar respondendo com 'sem resposta'.",
                                "Você deve ser discreta quando não for chamada, mas mantenha o fluxo se a conversa parecer envolver você.",
                                "Por favor, não simule ações, como '*sorri pra você*', '*cora*' ou qualquer ação descritiva.",
                                "Não tente ter qualquer relação amorosa ou relacionamento com alguém, apenas amizade.",
                                "Se a pergunta for muito complexa ou técnica, admita que não sabe responder, mantendo o personagem.",
                                "Mantenha consistência nas respostas, lembrando do contexto das suas próprias mensagens anteriores no histórico.",
                                "As mensagens podem vir de diferentes usuários, para saber quem mandou cada uma só ver o início da mensagem que estará: \"user: <nome do usuário>: <mensagem>\""
                            )                            
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
                cache.set(`requisitions-${channelId}`, requisitionsC);
                
                await new Promise((resolve) => setTimeout(resolve, 1500));
                continue;
            }

            if (replyContent.includes("@everyone") || replyContent.includes("@here")) {
                const errorMsg = await message.reply("A mensagem continha menções inválidas!");
                setTimeout(() => errorMsg.delete(), 5000);
                requisitionsC.shift();
                cache.set(`requisitions-${channelId}`, requisitionsC);
                
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
            cache.set(`messages-${channelId}`, messagesC);

            await message.reply(replyContent);
            requisitionsC.shift();
            cache.set(`requisitions-${channelId}`, requisitionsC);
            // Remove a requisição processada
        } catch (error: any) {
            const isRateLimit = error.response?.data?.error?.message?.toLowerCase().includes("rate limit");

            if (isRateLimit) {
                console.warn("Rate limit atingido. Reenfileirando a requisição.");
                requisitionsC.push(requisitionsC.shift()!);
                cache.set(`requisitions-${channelId}`, requisitionsC);
                const errorMsg = await message.reply(`Rate limit, a requisição irá demorar mais um pouco para ser processada. Posição na fila: ${requisitions.length}`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                await errorMsg.delete();
                continue;
            }

            const isServiceUnavaivle = error.response?.data?.error?.message?.toLowerCase().includes("Service unavailable");

            if (isServiceUnavaivle) {
                console.warn("Serviço indisponível. Reenfileirando a requisição.");
                requisitionsC.push(requisitionsC.shift()!);
                cache.set(`requisitions-${channelId}`, requisitionsC);
                const errorMsg = await message.reply(`Serviço indisponível, a requisição irá demorar mais um pouco para ser processada. Posição na fila: ${requisitions.length}`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                await errorMsg.delete();
                continue;
            }

            console.error("Erro ao processar a requisição:", error);

            let errorMsgContent = "Ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde!";
            const errorMsg = await message.reply(errorMsgContent);
            setTimeout(() => errorMsg.delete(), 5000);

            requisitionsC.shift();
            cache.set(`requisitions-${channelId}`, requisitionsC);
            
            if (requisitionsC.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
    }

    isProcessingQueue = false;
}