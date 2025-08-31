import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { res, icon } from "#functions";
import { menus } from "#menus";
import { Collection, GuildMember } from "discord.js";

createResponder({
    customId: "leaderboard/rank/:page/:area/:type",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            page: parseInt(params.page),
            area: params.area as "guild" | "global",
            type: params.type as "stx" | "xp" | "tryviaGames" | "tryviaWins" | "tryviaPoints"
        }
    },
    async run(interaction, { area, page, type }) {
        const inicial = page * 10;
        const final = inicial + 10;

        if (area === "guild") {
            if (type === "stx") {
                const ranking = await prisma.user.findMany({
                    orderBy: [
                        {
                            money: "desc"
                        },
                        {
                            bank: "desc"
                        }
                    ],
                    select: {
                        id: true,
                        money: true,
                        bank: true
                    },
                    take: final
                });

                if (ranking.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                // Obter IDs dos usuários
                const ids = ranking.map(user => user.id);
                let fetchedMembers: Collection<string, GuildMember>;
                try {
                    // Buscar membros do servidor apenas para os IDs retornados
                    fetchedMembers = await interaction.guild!.members.fetch({ user: ids, withPresences: false });
                } catch (error) {
                    console.error(error);
                    fetchedMembers = new Collection();
                }

                const users = [];

                for (const user of ranking) {
                    const member = fetchedMembers.get(user.id);
                    if (!member) continue; // Pular se o usuário não está no servidor

                    users.push({
                        user: {
                            id: user.id,
                            name: member.displayName || "desconhecido",
                            avatarUrl: member.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: user.money.add(user.bank).toNumber()
                    });
                }

                if (users.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Guild", type, users, interaction.user.id, page));
                return;
            } else {
                const ranking = await prisma.guildMember.findMany({
                    where: {
                        guildId: interaction.guildId!
                    },
                    orderBy: [
                        {
                            [type]: "desc"
                        }
                    ],
                    select: {
                        id: true,
                        [type]: true
                    },
                    take: final
                });

                if (ranking.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                const ids = ranking.map(gm => gm.id);
                let fetchedMembers: Collection<string, any>;
                try {
                    fetchedMembers = await interaction.guild!.members.fetch({ user: ids });
                } catch (error) {
                    console.error(error);
                    fetchedMembers = new Collection();
                }

                const users = [];

                for (const gm of ranking) {
                    const member = fetchedMembers.get(gm.id);
                    if (!member) continue; // Pular se o membro não estiver mais no servidor

                    users.push({
                        user: {
                            id: gm.id,
                            name: member.displayName || "desconhecido",
                            avatarUrl: member.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: gm[type]
                    });
                }

                if (users.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Guild", type, users, interaction.user.id, page));
                return;
            }
        } else {
            if (type === "stx") {
                const ranking = await prisma.user.findMany({
                    orderBy: [
                        {
                            money: "desc"
                        },
                        {
                            bank: "desc"
                        }
                    ],
                    select: {
                        id: true,
                        money: true,
                        bank: true
                    },
                    take: final
                });

                if (ranking.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                const users = [];

                for (const user of ranking) {
                    let discordUser;
                    try {
                        discordUser = interaction.client.users.cache.get(user.id) || await interaction.client.users.fetch(user.id);
                    } catch (error) {
                        console.error(error);
                        continue; // Pular se o usuário não existir mais
                    }

                    users.push({
                        user: {
                            id: user.id,
                            name: discordUser?.displayName || "desconhecido",
                            avatarUrl: discordUser?.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: user.money.add(user.bank).toNumber()
                    });
                }

                if (users.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Global", type, users, interaction.user.id, page));
                return;
            } else {
                const ranking = await prisma.guildMember.findMany({
                    orderBy: [
                        {
                            [type]: "desc"
                        }
                    ],
                    select: {
                        id: true,
                        guildId: true,
                        [type]: true
                    },
                    take: final
                });

                if (ranking.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                const users = [];

                for (const gm of ranking) {
                    let discordUser;
                    try {
                        discordUser = interaction.client.users.cache.get(gm.id) || await interaction.client.users.fetch(gm.id);
                    } catch (error) {
                        console.error(error);
                        continue; // Pular se o usuário não existir mais
                    }

                    users.push({
                        user: {
                            id: gm.id,
                            name: discordUser?.displayName || "desconhecido",
                            avatarUrl: discordUser?.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: gm[type]
                    });
                }

                if (users.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Global", type, users, interaction.user.id, page));
                return;
            }
        }
    },
});