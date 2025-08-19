import { prisma, redis } from "#database";
import { icon, res } from "#functions";
import { settings } from "#settings";
import { createEmbed, EmbedPlusBuilder } from "@magicyan/discord";
import { OmitPartialGroupDMChannel, Message, time, userMention } from "discord.js";

const isAAfkUser = async (userId: string) => {
    const afkRedis = await redis.get(`afk:${userId}`);
    const removeAfkUser = async () => {
        const userBeforeUpdate = await prisma.user.findUnique({
            where: { id: userId },
            select: { afkReasson: true, afkTime: true }
        });

        if (userBeforeUpdate) await prisma.user.update({
            where: { id: userId },
            data: { afkReasson: null, afkTime: null }
        });

        await redis.del(`afk:${userId}`);

        return userBeforeUpdate as {
            afkReasson: string;
            afkTime: Date;
        };
    }

    if (afkRedis) {
        const result = await removeAfkUser();
        return {
            afk: true,
            reason: result.afkReasson,
            time: result.afkTime
        };
    }

    const afkPrisma = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            afkReasson: true,
            afkTime: true
        }
    });

    if (afkPrisma && afkPrisma.afkReasson && afkPrisma.afkTime) {
        const result = await removeAfkUser();
        return {
            afk: true,
            reason: result.afkReasson,
            time: result.afkTime
        };
    }

    return {
        afk: false
    }
}

const mentionedAAfkUser = async (message: string) => {
    const userMentioned = message.match(/<@!?(\d{17,20})>/g);
    if (!userMentioned) return [];
    const afkUsers: { userId: string, reason: string, time: Date }[] = [];
    for (const mention of userMentioned) {
        const userId = mention.replace(/<@!?/, '').replace('>', '');
        const redisAfk = await redis.get(`afk:${userId}`);
        let afk: { userId: string, reason: string, time: Date } | null = null;
        if (redisAfk) afk = {
            userId,
            reason: JSON.parse(redisAfk).reason,
            time: new Date(JSON.parse(redisAfk).time)
        }
        if (!afk) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { afkReasson: true, afkTime: true }
            });
            if (user && user.afkReasson && user.afkTime) {
                afk = {
                    userId,
                    reason: user.afkReasson,
                    time: user.afkTime
                };
                await redis.set(`afk:${userId}`, JSON.stringify({
                    reason: user.afkReasson,
                    time: user.afkTime
                }));
            }
        }
        if (afk) {
            if (afkUsers.some(a => a.userId === userId)) continue;
            afkUsers.push({
                userId,
                reason: afk.reason!,
                time: afk.time!
            })
        }
    };

    return afkUsers;
}

export async function onAfkMentioned(interaction: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (interaction.author.bot) return;

    isAAfkUser(interaction.author.id).then(async result => {
        if (result.afk) {
            const msg = await interaction.reply(res.fuchsia(`${icon.Eris_happy} | Que bom que você voltou! eu retirei seu afk automaticamente para você! sabia que você estava afk dês de ${time(result.time!, "R")}?`));

            setTimeout(() => msg.delete(), 20_000);
            return;
        }
    })
    const afkUsers = await mentionedAAfkUser(interaction.content);

    if (afkUsers.length === 0) return;

    const embeds: EmbedPlusBuilder[] = [];
    
    const message = (afk: { reason: string, time: Date, username: string }) => {
        const messages = [
            `${icon.Eris_cry} | Parece que ${afk.username} não está aqui! ele saiu e deixou comigo uma carta: **\`${afk.reason}\`**`,
            `${icon.Eris_fair} | ${afk.username} sumiu! e sua ultima mensagem foi: **\`${afk.reason}\`** há ${time(afk.time, "R")}`,
            `${icon.denied} | O usuário ${afk.username} está afk! pelo motivo: **\`${afk.reason}\`** há ${time(afk.time, "R")}`,
            `${icon.Eris_thinking} | ${afk.username} está temporariamente indisponível! Motivo: **\`${afk.reason}\`** (desde ${time(afk.time, "R")})`,
            `${icon.Eris_shy} | Shhh! ${afk.username} está ocupado: **\`${afk.reason}\`** - ausente desde ${time(afk.time, "R")}`,
            `${icon.Eris_ok} | ${afk.username} se afastou do teclado! Razão: **\`${afk.reason}\`** ${time(afk.time, "R")}`,
            `${icon.Eris_thinking} | ${afk.username} está AFK! Deixou este recado: **\`${afk.reason}\`** há ${time(afk.time, "R")}`,
            `${icon.Eris_cry} | ${afk.username} não está disponível no momento! Motivo: **\`${afk.reason}\`** (${time(afk.time, "R")})`
        ];
        
        // Retorna uma mensagem aleatória do array
        return messages[Math.floor(Math.random() * messages.length)];
    }

    for (const user of afkUsers) {
        const embed = createEmbed({
            color: settings.colors.fuchsia,
            description: message({
                reason: user.reason,
                time: user.time,
                username: userMention(user.userId)
            })
        })

        embeds.push(embed);
    }

    const msg = await interaction.reply({ embeds });

    const extraPerEmbed = 15_000;
    const base = 25_000;
    const delay = base + (embeds.length - 1) * extraPerEmbed;

    setTimeout(() => msg.delete(), delay);
    return;
}
