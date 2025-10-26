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
        await interaction.deferUpdate();

        if (area === "guild") {
            if (type === "stx") {
                // Define interface for raw query result
                interface RankingResult {
                    id: string;
                    total: bigint;
                }

                // Raw query: Top 100 in this guild by total STX (money only)
                const ranking = await prisma.$queryRaw<RankingResult[]>`
                    SELECT u.id, u.money as total
                    FROM "User" u
                    INNER JOIN "GuildMember" gm ON gm.id = u.id AND gm."guildId" = ${interaction.guildId}
                    ORDER BY total DESC
                    LIMIT 100
                `;

                if (ranking.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                // Fetch members
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
                    if (!member) continue;

                    users.push({
                        user: {
                            id: user.id,
                            name: member.displayName || "desconhecido",
                            avatarUrl: member.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: Number(user.total)  // Convert BigInt to number
                    });
                }

                const filteredUsers = users.filter(u => u.amount > 0);

                if (filteredUsers.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Guild", type, filteredUsers, interaction.user.id, page));
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
                    take: 100
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

                interaction.editReply(menus.leaderboard.ranking("Guild", type, filteredUsers, interaction.user.id, page));
                return;
            }
        } else {
            if (type === "stx") {
                // Define interface for raw query result
                interface RankingResult {
                    id: string;
                    total: bigint;
                }

                // Raw query: Top 100 global by STX (money only)
                const ranking = await prisma.$queryRaw<RankingResult[]>`
                    SELECT id, money as total
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
                        continue;
                    }

                    users.push({
                        user: {
                            id: user.id,
                            name: discordUser?.username || "desconhecido", // Use username para usuários globais
                            avatarUrl: discordUser?.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: Number(user.total)
                    });
                }

                const filteredUsers = users.filter(u => u.amount > 0);

                if (filteredUsers.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não foi possível obter usuários para mostrar o ranking`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Global", type, filteredUsers, interaction.user.id, page));
                return;
            } else {
                // Define interface para o resultado da query
                interface RankingResult {
                    id: string;
                    total: number;
                }

                // Para tipos que não são "stx" no global
                const ranking = await prisma.$queryRaw<RankingResult[]>`
                    SELECT id, SUM(${type}) as total
                    FROM "GuildMember"
                    GROUP BY id
                    ORDER BY total DESC
                    LIMIT 100
                `;

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

                    users.push({
                        user: {
                            id: gm.id,
                            name: discordUser?.username || "desconhecido", // Use username para usuários globais
                            avatarUrl: discordUser?.displayAvatarURL() || interaction.client.user.displayAvatarURL()
                        },
                        amount: gm.total
                    });
                }

                const filteredUsers = users.filter(u => u.amount > 0);

                if (filteredUsers.length === 0) {
                    interaction.followUp(res.danger(`${icon.error} | Não existe usuário com mais de 1 ${type}`));
                    return;
                }

                interaction.editReply(menus.leaderboard.ranking("Global", type, filteredUsers, interaction.user.id, page));
                return;
            }
        }
    },
});