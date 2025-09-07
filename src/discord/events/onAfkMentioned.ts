import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { settings } from "#settings";
import { createEmbed, EmbedPlusBuilder } from "@magicyan/discord";
import { OmitPartialGroupDMChannel, Message, time, userMention } from "discord.js";

// Interface para dados de AFK
interface AfkData {
    reason: string;
    time: string; // String ISO para compatibilidade com Redis
}

// Obtém status AFK do Redis
const getRedisAfk = async (id: string): Promise<AfkData | null> => {
    const afkRedis = await redis.get(`afk:${id}`);
    if (!afkRedis || afkRedis === "no") {
        await redis.setex(`afk:${id}`, 3600, "no"); // Expira em 1 hora
        return null;
    }
    try {
        return JSON.parse(afkRedis) as AfkData;
    } catch (error) {
        console.error(`Erro ao parsear dados AFK do Redis para o usuário ${id}:`, error);
        await redis.setex(`afk:${id}`, 3600, "no");
        return null;
    }
};

// Define status AFK
export const setAfk = async (userId: string, reason: string): Promise<void> => {
    const afkData: AfkData = {
        reason,
        time: new Date().toISOString(),
    };
    await redis.setex(`afk:${userId}`, 86400, JSON.stringify(afkData)); // Expira em 24 horas
    await prisma.user.update({
        where: { id: userId },
        data: { afkReasson: reason, afkTime: new Date() },
    });
};

// Verifica se o usuário está AFK e remove o status se estiver
const isAfkUser = async (userId: string): Promise<{ afk: boolean; reason?: string; time?: Date }> => {
    const removeAfkUser = async (): Promise<{ afkReasson: string | null; afkTime: Date | null }> => {
        const userBeforeUpdate = await prisma.user.findUnique({
            where: { id: userId },
            select: { afkReasson: true, afkTime: true },
        });

        if (userBeforeUpdate?.afkReasson) {
            await prisma.user.update({
                where: { id: userId },
                data: { afkReasson: null, afkTime: null },
            });
        }

        await redis.setex(`afk:${userId}`, 3600, "no");
        return userBeforeUpdate || { afkReasson: null, afkTime: null };
    };

    const afkRedis = await getRedisAfk(userId);
    if (afkRedis) {
        const result = await removeAfkUser();
        return {
            afk: true,
            reason: result.afkReasson || afkRedis.reason,
            time: result.afkTime || new Date(afkRedis.time),
        };
    }

    const afkPrisma = await prisma.user.findUnique({
        where: { id: userId },
        select: { afkReasson: true, afkTime: true },
    });

    if (afkPrisma?.afkReasson && afkPrisma.afkTime) {
        await redis.setex(`afk:${userId}`, 86400, JSON.stringify({
            reason: afkPrisma.afkReasson,
            time: afkPrisma.afkTime.toISOString(),
        }));
        const result = await removeAfkUser();
        return {
            afk: true,
            reason: result.afkReasson!,
            time: result.afkTime!,
        };
    }

    return { afk: false };
};

// Verifica usuários mencionados com status AFK
const mentionedAfkUsers = async (message: string, msg: OmitPartialGroupDMChannel<Message<boolean>>): Promise<{ userId: string; reason: string; time: Date }[]> => {
    const userMentions = message.match(/<@!?(\d{17,20})>/g) || [];
    const mentionedUserIds: Set<string> = new Set();

    // Extrair IDs das menções existentes
    userMentions.forEach(mention => {
        const userId = mention.replace(/<@!?(\d{17,20})>/, '$1');
        mentionedUserIds.add(userId);
    });

    try {
        const messageReply = msg.reference?.messageId;
        if (messageReply) {
            const repliedMessage = await msg.channel.messages.fetch(messageReply);
            const repliedUserId = repliedMessage.author.id;

            mentionedUserIds.add(repliedUserId);
        }
    } catch (error) {
        console.error("Não foi possível obter a referência da mensagem:", error);
    }

    const afkUsers: { userId: string; reason: string; time: Date }[] = [];
    const uniqueUserIds = Array.from(mentionedUserIds)

    for (const userId of uniqueUserIds) {
        const afkRedis = await getRedisAfk(userId);
        let afk: { userId: string; reason: string; time: Date } | null = null;

        if (afkRedis) {
            afk = {
                userId,
                reason: afkRedis.reason,
                time: new Date(afkRedis.time),
            };
        } else {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { afkReasson: true, afkTime: true },
            });
            if (user?.afkReasson && user.afkTime) {
                afk = {
                    userId,
                    reason: user.afkReasson,
                    time: user.afkTime,
                };
                await redis.setex(`afk:${userId}`, 86400, JSON.stringify({
                    reason: user.afkReasson,
                    time: user.afkTime.toISOString(),
                }));
            }
        }

        if (afk) {
            afkUsers.push(afk);
        }
    }

    return afkUsers;
};

// Lida com menções de usuários AFK em mensagens
export async function onAfkMentioned(interaction: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (interaction.author.bot) return;

    // Verifica se o autor está AFK
    const authorAfk = await isAfkUser(interaction.author.id);
    if (authorAfk.afk) {
        const msg = await interaction.reply(
            res.fuchsia(
                `${icon.Eris_happy} | Que bom que você voltou! Eu retirei seu AFK automaticamente. Você estava AFK desde ${time(authorAfk.time!, "R")}.`
            )
        );
        setTimeout(() => msg.delete().catch(() => { }), 20_000);
    }

    // Verifica usuários mencionados
    const afkUsers = await mentionedAfkUsers(interaction.content, interaction);
    if (afkUsers.length === 0) return;

    const embeds: EmbedPlusBuilder[] = [];
    for (const user of afkUsers) {
        const embed = createEmbed({
            color: settings.colors.fuchsia,
            description: getRandomAfkMessage({
                reason: user.reason,
                time: user.time,
                username: userMention(user.userId),
            }),
        });
        embeds.push(embed);
    }

    const msg = await interaction.reply({ embeds });
    const extraPerEmbed = 15_000;
    const base = 25_000;
    const delay = base + (embeds.length - 1) * extraPerEmbed;

    setTimeout(() => msg.delete().catch(() => { }), delay);
}

// Função auxiliar para gerar mensagens AFK aleatórias
const getRandomAfkMessage = (afk: { reason: string; time: Date; username: string }): string => {
    const messages = [
        `${icon.Eris_cry} | Parece que ${afk.username} não está aqui! Ele saiu e deixou uma carta: **\`${afk.reason}\`**`,
        `${icon.Eris_fair} | ${afk.username} sumiu! Sua última mensagem foi: **\`${afk.reason}\`** há ${time(afk.time, "R")}`,
        `${icon.denied} | O usuário ${afk.username} está AFK! Motivo: **\`${afk.reason}\`** há ${time(afk.time, "R")}`,
        `${icon.Eris_thinking} | ${afk.username} está temporariamente indisponível! Motivo: **\`${afk.reason}\`** (desde ${time(afk.time, "R")})`,
        `${icon.Eris_shy} | Shhh! ${afk.username} está ocupado: **\`${afk.reason}\`** - ausente desde ${time(afk.time, "R")}`,
        `${icon.Eris_ok} | ${afk.username} se afastou do teclado! Razão: **\`${afk.reason}\`** ${time(afk.time, "R")}`,
        `${icon.Eris_thinking} | ${afk.username} está AFK! Deixou este recado: **\`${afk.reason}\`** há ${time(afk.time, "R")}`,
        `${icon.Eris_cry} | ${afk.username} não está disponível no momento! Motivo: **\`${afk.reason}\`** (${time(afk.time, "R")})`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};