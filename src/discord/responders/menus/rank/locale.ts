import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { Collection, GuildMember } from "discord.js";

createResponder({
    customId: "leaderboard/:locale",
    parse(params) {
        return {
            locale: params.locale as "server" | "global" | "choice"
        }
    },
    types: [ResponderType.Button, ResponderType.StringSelect], cache: "cached",
    async run(interaction, { locale }) {
        if (interaction.isButton()) {
            if (locale === "choice") return;
            interaction.update(menus.leaderboard.startRanking(locale === "server" ? "Guild" : "Global", null));
            return;
        } else {
            await interaction.deferUpdate();
            const params = interaction.values[0].split("/");
            const type = params[0] as "stx" | "xp" | "tryviaGames" | "tryviaWins" | "tryviaPoints";
            const area = params[1] as "guild" | "global";
            if (area === "guild") {
                if (type === "stx") {
                    // Definir interface para o resultado da consulta crua
                    interface RankingResult {
                        id: string;
                        total: bigint;
                    }

                    // Consulta crua: Top 100 no servidor por STX total (money + bank)
                    const ranking = await prisma.$queryRaw<RankingResult[]>`
                        SELECT u.id, (u.money + u.bank) as total
                        FROM "User" u
                        INNER JOIN "GuildMember" gm ON gm.id = u.id AND gm."guildId" = ${interaction.guildId}
                        ORDER BY total DESC
                        LIMIT 100
                    `;

                    if (ranking.length === 0) {
                        interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                        return;
                    }

                    // Obter IDs dos usuários
                    const ids = ranking.map(user => user.id);
                    let fetchedMembers: Collection<string, GuildMember>;
                    try {
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
                            amount: Number(user.total) // Converter BigInt para número
                        });
                    }

                    const filteredUsers = users.filter(u => u.amount > 0);

                    if (filteredUsers.length === 0) {
                        interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                        return;
                    }

                    interaction.editReply(menus.leaderboard.ranking("Guild", type, filteredUsers, interaction.user.id));
                    return;
                } else {
                    // Sua lógica existente para outros tipos no ranking local (sem alterações)
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
                        take: 30
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
                        if (!member) continue;

                        users.push({
                            user: {
                                id: gm.id,
                                name: member.displayName || "desconhecido",
                                avatarUrl: member.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                            },
                            amount: gm[type]
                        });
                    }

                    const filteredUsers = users.filter(u => u.amount > 0);

                    if (filteredUsers.length === 0) {
                        interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                        return;
                    }

                    interaction.editReply(menus.leaderboard.ranking("Guild", type, filteredUsers, interaction.user.id));
                    return;
                }
            } else {
                if (type === "stx") {
                    // Definir interface para o resultado da consulta crua
                    interface RankingResult {
                        id: string;
                        total: bigint;
                    }

                    // Consulta crua: Top 100 global por STX total (money + bank)
                    const ranking = await prisma.$queryRaw<RankingResult[]>`
                        SELECT id, (money + bank) as total
                        FROM "User"
                        ORDER BY total DESC
                        LIMIT 100
                    `;

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
                            amount: Number(user.total) // Converter BigInt para número
                        });
                    }

                    const filteredUsers = users.filter(u => u.amount > 0);

                    if (filteredUsers.length === 0) {
                        interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                        return;
                    }

                    interaction.editReply(menus.leaderboard.ranking("Global", type, filteredUsers, interaction.user.id));
                    return;
                } else {
                    // Sua lógica existente para outros tipos no ranking global (sem alterações)
                    const ranking = await prisma.guildMember.groupBy({
                        by: ['id'],
                        _sum: {
                            [type]: true
                        },
                        orderBy: {
                            _sum: {
                                [type]: 'desc'
                            }
                        },
                        take: 100
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
                            continue;
                        }

                        const totalAmount = gm._sum[type] || 0;

                        users.push({
                            user: {
                                id: gm.id,
                                name: discordUser?.displayName || "desconhecido",
                                avatarUrl: discordUser?.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                            },
                            amount: totalAmount
                        });
                    }

                    const filteredUsers = users.filter(u => u.amount > 0);

                    if (filteredUsers.length === 0) {
                        interaction.followUp(res.danger(`${icon.error} | Não existe usuário com mais de 1 ${type}`));
                        return;
                    }

                    interaction.editReply(menus.leaderboard.ranking("Global", type, filteredUsers, interaction.user.id));
                    return;
                }
            }
        }
    },
});