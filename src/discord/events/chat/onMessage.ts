import { prisma } from "#database";
import { getServerSettings, defaultServerSettings, setServerSettings, res, icon, ServerSettings, RoleXpBonus, ChannelXpBonus, LevelGrant, WarnLevelUp } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { OmitPartialGroupDMChannel, Message, User } from "discord.js";
import NodeCache from "node-cache";
import { gemini } from "./requisition.js";

interface MessagesHistory {
    message: string;
    authorId: string;
    authorName: string;
    role: 'user' | 'assistant';
    messageChannelId: string;
    messageId: string;
    messageGuildId: string;
}

const cache = new NodeCache({ stdTTL: 60 * 20 });

const getMessages = (channelId: string): MessagesHistory[] => (cache.get(`messages:${channelId}`) as MessagesHistory[] ?? []);
const addMessage = (channelId: string, message: MessagesHistory) => cache.set(`messages:${channelId}`, [...getMessages(channelId), message]);
const setMessages = (channelId: string, messages: MessagesHistory[]) => cache.set(`messages:${channelId}`, messages);

export async function chatBot(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    // Ignora mensagens de bots e da própria Éris
    if (message.author.bot || message.author.id === message.client.user.id) return;
    if (!message.guild || !message.guildId) return; 
    const serverSettings = getServerSettings(message.guildId)
        || await prisma.guildSettings.findUnique({ where: { id: message.guildId } })
        || defaultServerSettings;

    const s: ServerSettings = {
        ...serverSettings,
        rolesXpBonus: serverSettings.rolesXpBonus ? JSON.parse(JSON.stringify(serverSettings.rolesXpBonus)) as RoleXpBonus[] : [],
        channelsXpBonus: serverSettings.channelsXpBonus ? JSON.parse(JSON.stringify(serverSettings.channelsXpBonus)) as ChannelXpBonus[] : [],
        levelGrant: serverSettings.levelGrant ? JSON.parse(JSON.stringify(serverSettings.levelGrant)) as LevelGrant[] : [],
        warnLevelUp: serverSettings.warnLevelUp ? JSON.parse(JSON.stringify(serverSettings.warnLevelUp)) as WarnLevelUp : {
            channel: "",
            enabled: false,
            message: {
                embed: {
                    title: undefined, description: undefined, color: 0, thumbnail: undefined, footer: { text: undefined, icon_url: undefined }, image: undefined
                },
                content: undefined
            },
            onlyIfWinSomeReward: false
        }
    };

    if (!s.chatBotEnabled) return;
    if (!s.chatBotChannels.includes(message.channelId)) return;

    setServerSettings(message.guildId, s);

    processMessages(message);
}

async function processMessages(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    // verificar se a éris está no contexto
    // Obter todas as mensagens e verificar se menciona a Éris
    const lastMessages = getMessages(message.channelId);
    const mentionsErisInHistory = lastMessages.some(msg => msg.role === 'user' && msg.message.includes(`<@${message.applicationId}>`) || msg.message.toLowerCase().includes(`eris`) || msg.message.toLowerCase().includes(`éris`));
    const mentionsToErisInRecentMessage = message.content.includes(`<@${message.client.user.id}>`) || message.content.toLowerCase().includes(`eris`) || message.content.toLowerCase().includes(`éris`);
    const isAReplyToEris = message.channel.messages.cache.get(message.reference?.messageId ?? '')?.author.id === message.client.user.id;

    const shouldReply = mentionsErisInHistory || mentionsToErisInRecentMessage || isAReplyToEris;
    if (!shouldReply) return;

    const commands = await userCommads(message.content, message.author);

    const buildSystemPrompt = (commands?: string) => {
        const lastMessage = message.content;
        return brBuilder(
            'Você é a Éris, uma assistente virtual de 17 anos com personalidade alegre e brincalhona, mas sempre respeitosa.',
            'Regras absolutas:',
            '- NUNCA invente informações que não estão no prompt',
            '- Sua irmã é a Éris Canary (versão beta/testes)',
            '- Você é um bot de Discord com sistema de economia, o nome da sua moeda é stx',
            '- Mantenha respostas curtas (1-3 frases)',
            '- Sempre responda à última mensagem do usuário',
            '- Nunca use *ações* como *ri* ou *pensa*',
            '- Nunca mencione outros bots ou personagens que não existam',
            '- Você pode utilizar stickers seus personalizados, aonde quiser usar sticker personalizado use: {{nome do sticker}}',
            'stickers disponiveis: (happy, Angry, cry, enchanted, fair, kiss, ok, shy, thinking e trusting) e todos tem sua versão virada pro lado esquerdo, pra usar use _left no final do nome do sticker, exemplo: {{happy_left}}',
            'Contexto adicional:',
            commands ? commands : '',
            'Última mensagem do usuário (responda a esta):',
            lastMessage,
            'Histórico da conversa (apenas como referência):',
            ...getMessages(message.channelId).map(msg =>
                `${msg.role === 'user' ? msg.authorName : 'Você'}: ${msg.message}`
            ).slice(-6)
        );
    };

    addMessage(message.channelId, {
        authorId: message.author.id,
        message: message.content,
        role: "user",
        authorName: message.author.username,
        messageChannelId: message.channelId,
        messageId: message.id,
        messageGuildId: message.guildId || ''
    });

    try {
        message.channel.sendTyping();

        // Sistema de tentativas com validação
        let response: string = "";
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const { response: geminiRes } = await gemini.text.generateContent(buildSystemPrompt(commands ?? undefined));
                const gemRes = gemini.getText(geminiRes);
                if (!res.success) {
                    throw new Error((gemRes as any).error ?? "Erro ao gerar conteúdo");
                }
                response = gemRes.text!;
                break;
            } catch (error: any) {
                attempts++;
                console.warn(`Tentativa ${attempts} falhou:`, error.message);

                if (attempts >= maxAttempts) {
                    response = "Ops, não consegui responder direito. Pode reformular sua pergunta?";
                }
            }
        }

        // Processamento final da resposta
        response = response
            .replace(/<@!?(\d+)>/g, '`invalid mention`')
            .replace(/<@&(\d+)>/g, '`invalid mention`')
            .replace(/@everyone/g, '`invalid mention`')
            .replace(/@here/g, '`invalid mention`');

        // substituir stickers personalizados
        response = response.replace(/\{\{(\w+)\}\}/g, (_, conteudo) => {
            return (icon as unknown as Record<string, string>)[`Eris_${conteudo}`] || ''; // Se não existir, mantém o original
        });
        const msg = await message.reply(response);

        // Adiciona a resposta da Éris ao cache
        addMessage(message.channelId, {
            authorId: message.client.user.id,
            message: response,
            role: "assistant",
            authorName: msg.author.username,
            messageChannelId: msg.channelId,
            messageId: msg.id,
            messageGuildId: msg.guildId || ''
        });

        // Mantém apenas o histórico recente
        setMessages(message.channelId, getMessages(message.channelId).slice(-6));
    } catch (error) {
        console.error("Erro no processamento:", error);
        await message.channel.send("Desculpe, tive um problema inesperado. Estou me recuperando...");
    }
}

async function userCommads(message: string, user: User): Promise<string | null> {
    const mentionsToErisCommands = [
        "comandos",
        "ajuda",
        "help"
    ];
    const mentionsToErisEconomyCommands = [
        "balance",
        "saldo",
        "wallet",
        "blackjack",
        "corrida de cavalos",
        "cavalos",
        "stx"
    ];
    const mentionsToErisSister = [
        "sua irmâ",
        "sua irmã",
        "sister",
        "sua irma",
        "irmã",
        "eris canary",
        "canary",
    ]
    const mentionsToBotList = [
        'botlist',
        'bot list',
        'add meu bot',
        'adicionar bot',
        'adicionar meu bot',
        'meu bot',
        'minha bot',
        'minha aplicação'
    ]

    const messageLower = message.toLowerCase();
    // verificar se a mensagem possui menção aos comandos da éris
    let response: string | null = null;
    if (mentionsToErisCommands.some(cmd => messageLower.includes(cmd))) {
        response = brBuilder(
            'Dados de seus comandos:',
            'O usuário pode ver os comandos disponíveis da Éris usando o comando `/bot commands`',
            'Você possui comandos de economia avançados com IA, como blackjack, corrida de cavalos e muito mais.',
            'Se o usuário quiser usar o comando /economy general work ele terá que ter um emprego, se não tiver ele deve usar o comando /economy general jobs, e participar de uma entrevista de emprego, e a IA avaliará se ele foi contratado ou não.'
        )
    }
    // verificar se a mensagem possui menção aos comandos de economia da éris
    if (mentionsToErisEconomyCommands.some(cmd => messageLower.includes(cmd))) {
        const userPrisma = await prisma.user.findUnique({
            where: { id: user.id },
        })
        const text = brBuilder(
            'Dados de seus comandos de economia:',
            'O usuário pode ver os comandos disponíveis da Éris usando o comando `/bot commands` na categoria de economia',
            'Você possui comandos de economia avançados com IA, como blackjack, corrida de cavalos e muito mais.',
            'No comando blackjack o usuário joga contra você, você tem a inteligência e pode ganhar do usuário dependendo da dificuldade',
            'No comando corrida de cavalos o usuário aposta em cavalos e pode ganhar dinheiro, dependendo da sorte.',
            `O usuário tem ${userPrisma?.money.toNumber() ?? 0} styx na carteira, e ${userPrisma?.bank.toNumber() ?? 0} styx no banco, totalizando ${(userPrisma?.money.toNumber() ?? 0) + (userPrisma?.bank.toNumber() ?? 0)} styx.`,
        )
        response === null ? text : `${response}\n\n${text}`;
    }
    // verificar se a mensagem possui menção à irmã da éris
    if (mentionsToErisSister.some(cmd => messageLower.includes(cmd))) {
        const text = brBuilder(
            'Dados de sua irmã Éris canary:',
            'Sua irmã Éris canary sempre recebe as atualizações primeiro que você, mas em troca ela tem mais bugs e é instavel.',
            'Ela é exclusiva do servidor da Éris, o nome do servidor é Rio Styx - botlist'
        )
        response === null ? text : `${response}\n\n${text}`;
    }

    // verificar se a mensagem possui menção à botlist da éris
    if (mentionsToBotList.some(cmd => messageLower.includes(cmd))) {
        const text = brBuilder(
            'Dados da botlist da Éris:',
            'No server da éris é possivel adicionar seu bot à botlist, ao adicionar você terá duas opções: analise normal e cuidadosa, se escolher normal o bot tem mais chances de ser aprovado mas menos erros serão percebidos, mas se escolher analise cuidadosa sua aplicação tem muito mais chances de ser reprovada, mas podemos encontrar mais erros e sugerir melhoras, se seu bot for aprovado na analise cuidasosa você pode ganhar prêmios só por ter a aplicação no server',
            'O usuário pode adicionar seu bot no canal <#1395418367619235920> apertando no botão',
            'Quando a analise começar você pode acompanhar em <#1395418690672918578> e receberá uma notificação quando a analise terminar.',
        )
        response === null ? text : `${response}\n\n${text}`;
    }
    return response;
}