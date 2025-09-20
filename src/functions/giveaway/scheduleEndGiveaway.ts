import { prisma } from "#database";
import { menus } from "#menus";
import { Giveaway, GuildGiveaway, GuildSettings, RoleMultipleEntry, UserGiveaway } from "#prisma";
import { Client, userMention, TextChannel } from "discord.js";
import { selectWinner } from "./selectWinner.js";
import { resv2 } from "functions/utils/embed.js";
import { icon } from "functions/utils/emojis.js";

type GiveawayPayload = Giveaway & { 
    connectedGuilds: (GuildGiveaway & { guild: GuildSettings })[], 
    roleEntries: RoleMultipleEntry[], 
    participants: UserGiveaway[]
}

// Cache para evitar execuções duplicadas
const processingGiveaways = new Set<number>();
const scheduledTimeouts = new Map<number, NodeJS.Timeout>();

export async function scheduleAllEndGiveaways(client: Client) {
    try {
        const now = new Date();
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        
        const giveawaysToEnd = await prisma.giveaway.findMany({
            where: {
                ended: false,
                OR: [
                    { expiresAt: { lt: now } },
                    { 
                        expiresAt: {
                            lt: oneHourFromNow,
                            gt: now
                        }
                    }
                ]
            },
            include: {
                connectedGuilds: {
                    include: {
                        guild: true
                    }
                }
            }
        });

        if (giveawaysToEnd.length === 0) {
            return;
        }

        for (const giveaway of giveawaysToEnd) {
            if (processingGiveaways.has(giveaway.id)) {
                continue;
            }
            await scheduleGiveaway(client, giveaway);
        }
    } catch (error) {
        console.error("Erro ao agendar finalização de sorteios:", error);
    }
}

export async function scheduleGiveaway(client: Client, giveaway: Giveaway & { connectedGuilds: (GuildGiveaway & { guild: GuildSettings })[] }) {
    const timeUntilEnd = giveaway.expiresAt.getTime() - Date.now();
   
    if (timeUntilEnd <= 0) {
        await processGiveawayEnd(client, giveaway);
        return;
    }

    if (processingGiveaways.has(giveaway.id)) {
        return;
    }

    if (scheduledTimeouts.has(giveaway.id)) {
        clearTimeout(scheduledTimeouts.get(giveaway.id)!);
        scheduledTimeouts.delete(giveaway.id);
    }

    const timeout = setTimeout(async () => {
        scheduledTimeouts.delete(giveaway.id);
        await processGiveawayEnd(client, giveaway);
    }, timeUntilEnd);

    scheduledTimeouts.set(giveaway.id, timeout);
}

async function processGiveawayEnd(client: Client, giveaway: Giveaway & { connectedGuilds: (GuildGiveaway & { guild: GuildSettings })[] }) {
    const giveawayId = giveaway.id;
    
    if (processingGiveaways.has(giveawayId)) {
        return;
    }

    processingGiveaways.add(giveawayId);
    
    try {
        
        await prisma.giveaway.update({
            where: { id: giveawayId },
            data: { 
                ended: true,
                updatedAt: new Date()
            }
        });

        const fullGiveaway = await prisma.giveaway.findUnique({
            where: { id: giveawayId },
            include: {
                connectedGuilds: {
                    where: { guildId: { in: giveaway.connectedGuilds.map(g => g.guildId) } },
                    include: { guild: true }
                },
                roleEntries: true,
                participants: true
            }
        });

        if (!fullGiveaway) {
            console.error(`Sorteio ${giveawayId} não encontrado após marcar como processando`);
            return;
        }

        const participantCount = fullGiveaway.participants.length;
        if (participantCount === 0) {
            await handleNoParticipants(client, fullGiveaway);
            return;
        }

        const winners = await selectWinner(
            client, 
            fullGiveaway, 
            fullGiveaway.participants, 
            fullGiveaway.connectedGuilds
        );

        if (!winners || winners.length === 0) {
            await handleNoEligibleWinners(client, fullGiveaway);
            return;
        }

        await prisma.userGiveaway.updateMany({
            where: {
                userId: { in: winners.map(w => w.userId) },
                giveawayId: giveawayId
            },
            data: { isWinner: true }
        });

        await updateAllGuildMessages(client, fullGiveaway, winners);
    } catch (error) {
        try {
            await prisma.giveaway.update({
                where: { id: giveawayId },
                data: { ended: false }
            });
        } catch (revertError) {
            console.error(`Erro ao reverter estado do sorteio ${giveawayId}:`, revertError);
        }
    } finally {
        processingGiveaways.delete(giveawayId);
    }
}

async function handleNoParticipants(client: Client, giveaway: GiveawayPayload) {
    const updatePromises = giveaway.connectedGuilds.map(async (cnGuild) => {
        try {
            const result = await updateGuildMessage(client, cnGuild, giveaway, async (_channel) => {
                return resv2.danger(
                    `${icon.Eris_cry_left} | Infelizmente nenhum usuário entrou no sorteio **${giveaway.title}**`
                );
            });
            
            if (!result.success && result.channel) {
                await result.channel.send(resv2.danger(
                    `${icon.Eris_cry_left} | Infelizmente nenhum usuário entrou no sorteio **${giveaway.title}**`
                ));
            }
        } catch (error) {
            console.error(`Erro ao lidar com sorteio sem participantes na guild ${cnGuild.guildId}:`, error);
        }
    });

    await Promise.allSettled(updatePromises);
}

async function handleNoEligibleWinners(client: Client, giveaway: GiveawayPayload) {
    const updatePromises = giveaway.connectedGuilds.map(async (cnGuild) => {
        try {
            const result = await updateGuildMessage(client, cnGuild, giveaway, async (_channel) => {
                return resv2.danger(
                    `${icon.Eris_cry} | Nenhum usuário é elegível a esse sorteio, nenhum usuário presente cumpre os requisitos pro sorteio **${giveaway.title}**`
                );
            });
            
            if (!result.success && result.channel) {
                await result.channel.send(resv2.danger(
                    `${icon.Eris_cry} | Nenhum usuário é elegível a esse sorteio, nenhum usuário presente cumpre os requisitos pro sorteio **${giveaway.title}**`
                ));
            }
        } catch (error) {
            console.error(`Erro ao lidar com sorteio sem vencedores elegíveis na guild ${cnGuild.guildId}:`, error);
        }
    });

    await Promise.allSettled(updatePromises);
}

async function updateAllGuildMessages(client: Client, giveaway: GiveawayPayload, winners: UserGiveaway[]) {
    const winnerIds = winners.map(w => w.userId);
    const updatePromises = giveaway.connectedGuilds.map(async (cnGuild) => {
        try {
            // PASSO 1: Buscar/atualizar mensagem SEM notificações ainda
            const updateResult = await updateGuildMessage(client, cnGuild, giveaway, async (_channel) => {
                // Apenas retornar a mensagem de finalização
                return menus.giveaway.giveawayEnd(winnerIds, giveaway);
            });

            // PASSO 2: Enviar notificação dos vencedores
            const winnerNotification = resv2.success(
                `${icon.Eris_happy} | O sorteio **${giveaway.title}** acabou! os ganhadores são: ${winners.map(w => `**${userMention(w.userId)}**`).join(", ")}`
            );

            if (updateResult.success && updateResult.message) {
                // Se conseguiu editar a mensagem, responder a ela
                await updateResult.message.reply(winnerNotification);
            } else if (updateResult.channel) {
                // Se não conseguiu editar, enviar nova mensagem + notificação
                const newMessage = await updateResult.channel.send(menus.giveaway.giveawayEnd(winnerIds, giveaway));
                
                // Atualizar messageId no banco
                await prisma.guildGiveaway.update({
                    where: {
                        guildId_giveawayId: {
                            giveawayId: giveaway.id,
                            guildId: cnGuild.guildId
                        }
                    },
                    data: { messageId: newMessage.id }
                }).catch(e => console.error(`Erro ao atualizar messageId na guild ${cnGuild.guildId}:`, e));
                
                // Enviar notificação separada
                await newMessage.reply(winnerNotification as any);
            }
        } catch (error) {
            console.error(`Erro ao atualizar mensagens da guild ${cnGuild.guildId}:`, error);
        }
    });

    await Promise.allSettled(updatePromises);
}

interface UpdateResult {
    success: boolean;
    message?: any;
    channel?: TextChannel;
}

async function updateGuildMessage(
    client: Client, 
    cnGuild: GuildGiveaway & { guild: GuildSettings }, 
    giveaway: GiveawayPayload, 
    messageBuilder: (channel: TextChannel) => Promise<any>
): Promise<UpdateResult> {
    try {
        const guild = client.guilds.cache.get(cnGuild.guildId);
        if (!guild) {
            await prisma.guildGiveaway.delete({
                where: {
                    guildId_giveawayId: {
                        giveawayId: giveaway.id,
                        guildId: cnGuild.guildId
                    }
                }
            }).catch(() => {});
            return { success: false };
        }

        let channel = guild.channels.cache.get(cnGuild.channelId) as TextChannel | undefined;
        if (!channel) {
            channel = await guild.channels.fetch(cnGuild.channelId)
                .then(ch => ch as TextChannel)
                .catch(() => undefined);
        }

        if (!channel || !channel.isTextBased()) {
            await prisma.guildGiveaway.delete({
                where: {
                    guildId_giveawayId: {
                        giveawayId: giveaway.id,
                        guildId: cnGuild.guildId
                    }
                }
            }).catch(() => {});
            return { success: false, channel };
        }

        let message = await channel.messages.fetch(cnGuild.messageId).catch(() => null);
        const newContent = await messageBuilder(channel);

        if (message) {
            await message.edit(newContent);
            return { success: true, message, channel };
        } else {
            return { success: false, channel };
        }
    } catch (error) {
        console.error(`Erro ao atualizar mensagem da guild ${cnGuild.guildId}:`, error);
        return { success: false };
    }
}

export function cancelGiveawaySchedule(giveawayId: number) {
    if (scheduledTimeouts.has(giveawayId)) {
        clearTimeout(scheduledTimeouts.get(giveawayId)!);
        scheduledTimeouts.delete(giveawayId);
    }
    processingGiveaways.delete(giveawayId);
}

export async function forceEndGiveaway(client: Client, giveawayId: number) {
    const giveaway = await prisma.giveaway.findFirst({
        where: { id: giveawayId, ended: false },
        include: {
            connectedGuilds: {
                include: { guild: true }
            }
        }
    });

    if (giveaway) {
        cancelGiveawaySchedule(giveawayId);
        await processGiveawayEnd(client, giveaway);
    }
}