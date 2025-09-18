import { createResponder, ResponderType, Store } from "#base";
import { prisma } from "#database";
import { icon, res, verifyUserRequirements } from "#functions";
import { menus } from "#menus";
import { GuildGiveaway, RoleMultipleEntry } from "#prisma";
import { brBuilder } from "@magicyan/discord";
import { Client, Guild } from "discord.js";

const cooldown = new Store();

createResponder({
    customId: "giveaway/entry/:giveawayId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            giveawayId: Number(params.giveawayId)
        }
    },
    async run(interaction, { giveawayId }) {
        if (cooldown.has(interaction.user.id)) {
            interaction.reply(res.danger(`${icon.denied} | Aguarde um pouco! você está sendo muito rápido!`))
            return;
        }
        cooldown.set(interaction.user.id, new Date(), { time: 1000 * 5 })
        const { guildId, client } = interaction;
        await interaction.deferReply({ flags: ["Ephemeral"] });
        const giveaway = await prisma.giveaway.findUnique({
            where: {
                id: giveawayId
            },
            include: {
                roleEntries: true,
                connectedGuilds: {
                    include: {
                        guild: true
                    }
                }
            }
        });

        if (!giveaway) {
            interaction.editReply(res.danger(`${icon.Eris_cry} | Eu não consegui encontrar esse sorteio! eu sei que você estava ancioso para tentar conseguir algum prêmio, isso realmente foi erro meu! ${icon.Eris_embarrassed_left}`))
            return;
        }
        const connectedGuild = giveaway.connectedGuilds.find(g => g.guildId === guildId)
        if (!connectedGuild) {
            interaction.editReply(res.danger(`${icon.Eris_cry} | Infelizmente esse server não faz parte desse sorteio! eu nem sei como essa mensagem veio parar aqui!`));
            return;
        }

        if (giveaway.expiresAt <= new Date()) {
            interaction.editReply(res.danger(`${icon.Eris_cry} | Esse sorteio já acabou! Você não pode entrar ou sair mais.`));
            return;
        }

        const user = await prisma.userGiveaway.findUnique({
            where: {
                userId_giveawayId: {
                    giveawayId,
                    userId: interaction.user.id
                }
            }
        });

        const updateGiveawayMessage = async () => {
            try {
                const newGiveaway = await prisma.giveaway.findUniqueOrThrow({
                    where: {
                        id: giveawayId
                    },
                    include: {
                        roleEntries: true,
                        connectedGuilds: true,
                        participants: false
                    }
                });

                const participantCount = await prisma.userGiveaway.count({
                    where: { giveawayId: newGiveaway.id }
                });

                let participants;
                if (newGiveaway.expiresAt <= new Date()) {
                    participants = await prisma.userGiveaway.findMany({
                        where: { giveawayId: newGiveaway.id }
                    });
                } else {
                    // Fake array apenas para .length quando não expirado
                    participants = Array.from({ length: participantCount }, (_, i) => ({
                        userId: `dummy${i}`,
                        createdAt: new Date(),
                        id: i,
                        giveawayId: newGiveaway.id,
                        isWinner: false
                    }));
                }

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

                const connectedGuildsWithNames = await getGuildNames(newGiveaway.connectedGuilds, client);

                const updatePromises = newGiveaway.connectedGuilds.map((connectedGuild) => (async () => {
                    const gvGuild = client.guilds.cache.get(connectedGuild.guildId) ?? (await client.guilds.fetch(connectedGuild.guildId).catch(() => null));
                    if (!gvGuild) {
                        await prisma.guildGiveaway.delete({
                            where: {
                                guildId_giveawayId: {
                                    giveawayId: newGiveaway.id,
                                    guildId: connectedGuild.guildId,
                                },
                            },
                        }).catch(() => {});
                        return;
                    }

                    const giveawayChannel = gvGuild.channels.cache.get(connectedGuild.channelId) ?? (await gvGuild.channels.fetch(connectedGuild.channelId).catch(() => null));
                    if (!giveawayChannel || !giveawayChannel.isTextBased()) return;

                    try {
                        const message = await giveawayChannel.messages.fetch(connectedGuild.messageId).catch(() => null);

                        const roleEntriesWithNames = await getRoleNames(newGiveaway.roleEntries, gvGuild);

                        const completeData = {
                            ...newGiveaway,
                            roleEntries: roleEntriesWithNames,
                            connectedGuilds: connectedGuildsWithNames,
                            participants
                        };

                        if (!message) {
                            const newMessage = await giveawayChannel.send(menus.giveaway.giveawayInterface(
                                completeData,
                                connectedGuild.guildId
                            ));

                            await prisma.guildGiveaway.update({
                                where: {
                                    guildId_giveawayId: {
                                        giveawayId: newGiveaway.id,
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
                    } catch (e) {
                        console.error(e);
                    }
                })());

                await Promise.all(updatePromises);
            } catch (e) {
                console.error("Erro na atualização das mensagens do sorteio:", e);
            }
        }

        if (user) {
            await prisma.userGiveaway.delete({
                where: {
                    userId_giveawayId: {
                        giveawayId,
                        userId: interaction.user.id
                    }
                }
            });
            await prisma.log.create({
                data: {
                    message: `Saiu do sorteio de id: ${giveawayId}`,
                    level: 5,
                    tags: ["giveaway", "leave"],
                    userId: interaction.user.id,
                    type: "info"
                }
            });
            await interaction.editReply(res.success(`${icon.Eris_cry} | Você saiu do sorteio!`));
            updateGiveawayMessage().catch(e => console.error(e));
            return;
        }

        const { missing } = await verifyUserRequirements(client, giveaway, interaction.user.id, giveaway.connectedGuilds, true);

        if (missing.length > 0) {
            interaction.editReply(res.danger(brBuilder(
                `${icon.Eris_cry} | Infelizmente você não cumpri alguns requisitos! sendo eles:`,
                missing.map(r => `- ${r}`).join("\n")
            )))
            return;
        }

        await prisma.$transaction([
            prisma.user.upsert({
                where: {
                    id: interaction.user.id
                },
                create: {
                    id: interaction.user.id
                },
                update: {}
            }),
            prisma.userGiveaway.create({
                data: {
                    giveawayId,
                    userId: interaction.user.id
                }
            }),
            prisma.log.create({
                data: {
                    message: `Entrou no sorteio de id: ${giveawayId}`,
                    level: 5,
                    tags: ["giveaway", "entry"],
                    userId: interaction.user.id,
                    type: "info"
                }
            })
        ]);
        await interaction.editReply(res.success(`${icon.Eris_happy} | Você entrou pro sorteio com sucesso!`));
        updateGiveawayMessage().catch(e => console.error(e));
    },
});