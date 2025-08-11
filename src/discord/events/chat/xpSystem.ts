import { Store } from "#base";
import { prisma } from "#database";
import { ChannelXpBonus, defaultServerSettings, getServerSettings, icon, LevelGrant, RoleXpBonus, ServerSettings, WarnLevelUp } from "#functions";
import { OmitPartialGroupDMChannel, Message, userMention } from "discord.js";

// Cache de cooldown em memória
const xpCooldownCache = new Store<number>()

export async function xpSystem(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot || message.author.id === message.client.user.id) return;
    if (!message.guild || !message.guildId) return;
    if (!message.channel || !message.channelId || !message.channel.isTextBased()) return;

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
                    title: undefined,
                    description: undefined,
                    color: 0,
                    thumbnail: undefined,
                    footer: { text: undefined, icon_url: undefined },
                    image: undefined
                },
                content: undefined
            },
            onlyIfWinSomeReward: false
        }
    };

    if (!s.xpSystemEnabled) return;
    if (s.channelsNotWinXp.includes(message.channelId)) return;
    if (s.rolesNotWinXp.some(r => message.member?.roles.cache.has(r))) return;

    // Cooldown de 6 segundos no cache
    const key = `${message.guildId}:${message.author.id}`;
    const now = Date.now();
    const last = xpCooldownCache.get(key) || 0;
    if (now - last < 6000) return; // menos de 6s → sem XP
    xpCooldownCache.set(key, now, {
        time: 6000
    });

    // Multiplicadores
    const channelBonus = s.channelsXpBonus.find(c => c.id === message.channelId)?.bonus ?? 1;
    const roleBonus = (() => {
        const bonuses = s.rolesXpBonus.filter(r => message.member?.roles.cache.has(r.id)).map(r => r.bonus);
        return bonuses.length ? Math.max(...bonuses) : 1;
    })();

    const lengthBonus = (() => {
        const len = message.content.trim().length;
        if (len < 5) return 0; // sem XP para mensagens curtas
        if (len > 20) return 1.1;
        return 1.0;
    })();

    const jitter = 0.95 + Math.random() * 0.1;

    const baseXP = 10;
    const XP = Math.floor(
        Math.max(0, baseXP * channelBonus * roleBonus * s.difficulty * lengthBonus * jitter)
    );

    if (XP <= 0) return;

    const user = await prisma.guildMember.upsert({
        where: { guildId_id: { id: message.author.id, guildId: message.guildId } },
        create: { id: message.author.id, guildId: message.guildId, xp: XP },
        update: { xp: { increment: XP } }
    });

    const oldXP = user.xp - XP;

    const newXP = user.xp;
    const oldLevel = Math.floor(oldXP / 1000);
    const newLevel = Math.floor(newXP / 1000);

    let gotReward = false;

    // Grants de cargo/canal
    for (const grant of s.levelGrant) {
        if (newXP >= grant.xp) {
            if (grant.grant === "role" && grant.id) {
                if (!message.member?.roles.cache.has(grant.id)) {
                    try {
                        await message.member?.roles.add(grant.id).catch(() => null);
                        gotReward = true;
                    } catch (error) {
                        console.error(error);
                        await message.channel.send(`${icon.Eris_cry} ${userMention(message.author.id)} eu não consegui dar para você o cargo **${message.guild.roles.cache.get(grant.id)?.name}** `).catch(() => null);
                    }
                }
            }
            else if (grant.grant === "channel" && grant.id) {
                const channel = message.guild.channels.cache.get(grant.id);
                if (channel && "permissionOverwrites" in channel) {
                    if (channel.isTextBased()) {
                        try {
                            await channel.permissionOverwrites.edit(message.author.id, {
                                ViewChannel: true
                            }).catch(() => null);
                            gotReward = true;
                        } catch (error) {
                            console.error(error);
                            await message.channel.send(`${icon.Eris_cry} ${userMention(message.author.id)} eu não consegui dar para você a permissão de ver o canal **${channel.name}** `).catch(() => null);
                        }
                    }
                }
            }
        }
    }

    // Aviso de level up
    if (s.warnLevelUp.enabled && newLevel > oldLevel) {
        if (!s.warnLevelUp.onlyIfWinSomeReward || gotReward) {
            const targetChannel = 
                s.warnLevelUp.channel === "current"
                    ? message.channel
                    : message.guild.channels.cache.get(s.warnLevelUp.channel || "") ?? message.channel;

            const msgData = s.warnLevelUp.message;
            if (targetChannel && "send" in targetChannel) {
                try {
                    await targetChannel.send({
                        content: msgData.content?.replace(/{user}/g, `<@${message.author.id}>`).replace(/{level}/g, String(newLevel)) || undefined,
                        embeds: msgData.embed?.title || msgData.embed?.description ? [{
                            title: msgData.embed.title?.replace(/{user}/g, message.author.username).replace(/{level}/g, String(newLevel)),
                            description: msgData.embed.description?.replace(/{user}/g, message.author.username).replace(/{level}/g, String(newLevel)),
                            color: msgData.embed.color ?? 0,
                            thumbnail: msgData.embed.thumbnail ? { url: msgData.embed.thumbnail } : undefined,
                            footer: msgData.embed.footer?.text ? { text: msgData.embed.footer.text, icon_url: msgData.embed.footer.icon_url } : undefined,
                            image: msgData.embed.image ? { url: msgData.embed.image } : undefined
                        }] : []
                    }).catch(() => null);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
}
