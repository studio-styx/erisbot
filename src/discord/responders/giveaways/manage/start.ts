import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, res, resv2, scheduleGiveaway } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { channelMention, Client, Guild } from "discord.js";
import crypto from "crypto";
import { GuildGiveaway, RoleMultipleEntry } from "#prisma";

createResponder({
    customId: "giveaway/manage/start/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, { userId }) {
        const { user, message, guild, member, client } = interaction;
        if (user.id !== userId) {
            await interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`));
            return;
        }

        const key = `giveaway:manage:${message.id}`;

        await interaction.deferUpdate();

        const raw = await redis.get(key);
        if (!raw) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
            return;
        }
        const giveawayData = JSON.parse(raw, (key, value) => {
            // Converte strings de data de volta para objetos Date
            if (key === 'expiresAt' && typeof value === 'string') {
                return new Date(value);
            }
            return value;
        }) as GiveawayManageDataInfo;

        // Validações iniciais
        if (!giveawayData.channelId) {
            await interaction.followUp(res.danger(`${icon.error} | Você precisa setar o canal onde será enviado a mensagem!`));
            return;
        }
        if (!giveawayData.title) {
            await interaction.followUp(res.danger(`${icon.error} | Você precisa setar o título do sorteio!`));
            return;
        }
        if (!giveawayData.expiresAt) {
            await interaction.followUp(res.danger(`${icon.error} | Você precisa setar a data de termino do sorteio!`));
            return;
        }
        if (giveawayData.expiresAt < new Date()) {
            await interaction.followUp(res.danger(`${icon.error} | A data de expiração tem que ser maior do que agora!`))
            return;
        }

        const channel = await guild.channels.fetch(giveawayData.channelId).catch(() => null);
        if (!channel || !channel.isTextBased()) {
            await interaction.followUp(res.danger(`${icon.error} | Canal do sorteio não foi encontrado ou não é um canal de texto! Por favor, selecione outro canal para criar o sorteio.`));
            return;
        }

        const errors: string[] = [];
        const botMember = guild.members.me!;
        const botPermissions = botMember.permissionsIn(channel);
        const userPermissions = member.permissionsIn(channel);
        if (!botPermissions.has("SendMessages")) errors.push(`Não tenho a permissão de enviar mensagens no canal: ${channelMention(channel.id)}`);
        if (!botPermissions.has("EmbedLinks")) errors.push(`Não tenho a permissão de enviar links no canal: ${channelMention(channel.id)}`);
        if (!botPermissions.has("ViewChannel")) errors.push(`Não tenho a permissão de ver o canal: ${channelMention(channel.id)}`);
        if (!userPermissions.has("SendMessages")) errors.push(`Você não tem a permissão de enviar mensagens no canal: ${channelMention(channel.id)}`);
        if (!userPermissions.has("ViewChannel")) errors.push(`Você não tem a permissão de ver o canal: ${channelMention(channel.id)}`);

        if (errors.length > 0) {
            await interaction.followUp(res.danger(`${icon.error} | Erro! Um total de **${errors.length}** ocorreram: \n${errors.map(e => `**\`${e}\`**`).join("\n")}`));
            return;
        }

        await interaction.editReply(resv2.warning(`${icon.waiting_white} | Processando sorteio...`))

        const nextId = ((await prisma.giveaway.findFirst({
            where: {
                connectedGuilds: {
                    some: {
                        guildId: guild.id,
                    },
                },
            },
            orderBy: {
                localId: "desc",
            },
            select: {
                localId: true,
            },
        }))?.localId ?? 0) + 1;

        async function getRoleNames(roleEntries: RoleMultipleEntry[], guild: Guild): Promise<(RoleMultipleEntry & { roleName: string })[]> {
            return Promise.all(roleEntries.map(async (roleEntry) => {
                const role = guild.roles.cache.get(roleEntry.roleId) ?? (await guild.roles.fetch(roleEntry.roleId).catch(() => null));
                return {
                    ...roleEntry,
                    roleName: role?.name ?? 'Role não encontrado',
                };
            }));
        }

        async function getGuildNames(connectedGuilds: GuildGiveaway[], client: Client): Promise<(GuildGiveaway & { guildName: string })[]> {
            return Promise.all(connectedGuilds.map(async (guildEntry) => {
                const fetchedGuild = client.guilds.cache.get(guildEntry.guildId) ?? (await client.guilds.fetch(guildEntry.guildId).catch(() => null));
                return {
                    ...guildEntry,
                    guildName: fetchedGuild?.name ?? 'Servidor não encontrado',
                };
            }));
        }

        const sincronize: { errors: string[]; success: number } = {
            errors: [],
            success: 0,
        };

        try {
            await prisma.$transaction(async (tx) => {
                const giveawayCreated = await tx.giveaway.upsert({
                    where: { id: giveawayData.id ?? 0 },
                    update: {
                        title: giveawayData.title,
                        description: giveawayData.description,
                        expiresAt: giveawayData.expiresAt,
                        usersWins: giveawayData.winners,
                        serverStayRequired: giveawayData.stayInServerRequire,
                    },
                    create: {
                        title: giveawayData.title!,
                        localId: nextId,
                        description: giveawayData.description,
                        expiresAt: giveawayData.expiresAt!,
                        usersWins: giveawayData.winners,
                        serverStayRequired: giveawayData.stayInServerRequire,
                    },
                    include: {
                        connectedGuilds: true,
                        roleEntries: true,
                        participants: true,
                    },
                });

                await tx.guildGiveaway.upsert({
                    where: {
                        guildId_giveawayId: {
                            guildId: guild.id,
                            giveawayId: giveawayCreated.id,
                        },
                    },
                    update: {
                        blackListRoles: giveawayData.blackListRoles,
                        xpRequired: giveawayData.xpRequired,
                    },
                    create: {
                        guildId: guild.id,
                        giveawayId: giveawayCreated.id,
                        channelId: giveawayData.channelId!,
                        messageId: crypto.randomBytes(Math.ceil(18 / 2)).toString('hex').slice(0, 18), // Placeholder, será atualizado
                        blackListRoles: giveawayData.blackListRoles,
                        xpRequired: giveawayData.xpRequired,
                        isHost: giveawayCreated.connectedGuilds.some(g => g.guildId === interaction.guildId && g.isHost === true)
                    },
                });

                if (giveawayData.roleEntries) {
                    await Promise.all(giveawayData.roleEntries.map((roleEntry) =>
                        tx.roleMultipleEntry.upsert({
                            where: {
                                giveawayId_roleId: {
                                    roleId: roleEntry.roleId,
                                    giveawayId: giveawayCreated.id,
                                },
                            },
                            update: {
                                extraEntries: roleEntry.entries,
                            },
                            create: {
                                roleId: roleEntry.roleId,
                                extraEntries: roleEntry.entries,
                                giveawayId: giveawayCreated.id,
                            },
                        })
                    ));
                }

                // Refetch the giveaway to include the newly added connectedGuilds
                const freshGiveaway = await tx.giveaway.findUnique({
                    where: { id: giveawayCreated.id },
                    include: {
                        connectedGuilds: true,
                        roleEntries: true,
                        participants: true,
                    },
                });

                // solicitar conexão com servers
                const missingGuilds = (giveawayData.connectedGuilds || []).filter(
                    cn => !giveawayCreated.connectedGuilds.some(g => g.guildId === cn.guildId)
                );

                if (missingGuilds.length > 0) {
                    const makeSolicitation = missingGuilds.map(missingGuild => (async () => {
                        await redis.setex(`connectedGiveaway:solicitation:${missingGuild.guildId}:${giveawayCreated.id}`, 60 * 60 * 24, giveawayCreated.id);
                    })());
                    await Promise.all(makeSolicitation)
                }

                if (!freshGiveaway) {
                    throw new Error("Falha ao recarregar os dados do sorteio após atualizações.");
                }

                const connectedGuildsWithNames = await getGuildNames(freshGiveaway.connectedGuilds, client);

                const updatePromises = freshGiveaway.connectedGuilds.map((connectedGuild) => (async () => {
                    const gvGuild = client.guilds.cache.get(connectedGuild.guildId) ?? (await client.guilds.fetch(connectedGuild.guildId).catch(() => null));
                    if (!gvGuild) {
                        sincronize.errors.push(`Servidor ${connectedGuild.guildId} não encontrado.`);
                        await tx.guildGiveaway.delete({
                            where: {
                                guildId_giveawayId: {
                                    giveawayId: freshGiveaway.id,
                                    guildId: connectedGuild.guildId,
                                },
                            },
                        });
                        return;
                    }

                    const giveawayChannel = gvGuild.channels.cache.get(connectedGuild.channelId) ?? (await gvGuild.channels.fetch(connectedGuild.channelId).catch(() => null));
                    if (!giveawayChannel || !giveawayChannel.isTextBased()) {
                        sincronize.errors.push(`Canal de sorteios não encontrado no servidor ${gvGuild.name}.`);
                        return;
                    }

                    try {
                        const message = await giveawayChannel.messages.fetch(connectedGuild.messageId).catch(() => null);

                        const roleEntriesWithNames = await getRoleNames(freshGiveaway.roleEntries, gvGuild);

                        const completeData = {
                            ...freshGiveaway,
                            roleEntries: roleEntriesWithNames,
                            connectedGuilds: connectedGuildsWithNames,
                        };

                        if (!message) {
                            const newMessage = await giveawayChannel.send(menus.giveaway.giveawayInterface(
                                completeData,
                                connectedGuild.guildId
                            ));

                            await tx.guildGiveaway.update({
                                where: {
                                    guildId_giveawayId: {
                                        giveawayId: freshGiveaway.id,
                                        guildId: gvGuild.id,
                                    },
                                },
                                data: {
                                    messageId: newMessage.id,
                                },
                            }).catch(e => console.log("Erro ao redefinir guildGiveaway:", e));
                        } else {
                            await message.edit(menus.giveaway.giveawayInterface(
                                completeData,
                                connectedGuild.guildId
                            ));
                        }
                        sincronize.success++;
                    } catch (e) {
                        console.error(e)
                        sincronize.errors.push(`Falhou em editar ou enviar mensagem para o canal ${giveawayChannel.name} no servidor ${gvGuild.name}.`);
                    }
                })());

                await Promise.all(updatePromises);

                if (freshGiveaway.expiresAt.getTime() <= Date.now() + 1000 * 60 * 12) {
                    console.log("Tentando agendar o sorteio, ele dura menos que 12 minutos")
                    const fullGiveaway = await tx.giveaway.findUnique({
                        where: {
                            id: freshGiveaway.id
                        },
                        include: {
                            connectedGuilds: {
                                include: {
                                    guild: true
                                }
                            },
                            roleEntries: true,
                        }
                    });

                    if (fullGiveaway) {
                        console.log(`Sorteio ${fullGiveaway.id} criado com tempo curto, agendando finalização imediata`);
                        scheduleGiveaway(client, fullGiveaway);
                    } else {
                        console.log("Não foi possivel encontrar o sorteio")
                    }
                } else {
                    console.log("Sorteio não dura menos que 12 minutos")
                }
            }, {
                maxWait: 30000,
                timeout: 30000,
            });

            await interaction.editReply(resv2.success(sincronize.errors.length > 0
                ? `${icon.warning} | Alguns erros ocorreram ao sincronizar o sorteio: ${sincronize.errors.map(e => `**\`${e}\`**`).join("\n")}`
                : `${icon.Eris_ok} | Sucesso ao sincronizar **${sincronize.success}**!`));
        } catch (error) {
            await interaction.editReply(resv2.danger(`${icon.error} | Erro ao processar o sorteio: ${(error as Error).message}`));
        } finally {
            // Limpa o cache do Redis independentemente do resultado
            await redis.del(key);
        }
    },
});