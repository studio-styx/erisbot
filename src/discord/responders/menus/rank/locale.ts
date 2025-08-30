import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { menus } from "#menus";

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
                    const ranking = await prisma.user.findMany({
                        where: {
                            guilds: {
                                some: {
                                    guildId: interaction.guildId!
                                }
                            }
                        },
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
                        }
                    })

                    const users = [];

                    for (const user of ranking) {
                        let discordUser = interaction.guild?.members.cache.get(user.id);
                        if (!discordUser) discordUser = await interaction.guild?.members.fetch(user.id);
                        users.push({
                            user: {
                                id: user.id,
                                name: discordUser?.displayName || "desconhecido",
                                avatarUrl: discordUser?.displayAvatarURL() || discordUser.avatarURL() || interaction.client.user.displayAvatarURL()
                            },
                            amount: user.money.add(user.bank).toNumber()
                        })
                    }
                    interaction.editReply(menus.leaderboard.ranking("Guild", type, users, interaction.user.id));
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
                        }
                    })

                    const users = [];

                    for (const user of ranking) {
                        let discordUser = interaction.guild?.members.cache.get(user.id);
                        if (!discordUser) discordUser = await interaction.guild?.members.fetch(user.id);
                        users.push({
                            user: {
                                id: user.id,
                                name: discordUser?.displayName || "desconhecido",
                                avatarUrl: discordUser?.displayAvatarURL() || discordUser.avatarURL() || interaction.client.user.displayAvatarURL()
                            },
                            amount: user[type]
                        })
                    }

                    interaction.editReply(menus.leaderboard.ranking("Guild", type, users, interaction.user.id));
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
                        }
                    })

                    const users = [];

                    for (const user of ranking) {
                        let discordUser = interaction.client.users.cache.get(user.id);
                        if (!discordUser) discordUser = await interaction.client.users.fetch(user.id);
                        users.push({
                            user: {
                                id: user.id,
                                name: discordUser?.displayName || "desconhecido",
                                avatarUrl: discordUser?.displayAvatarURL() || discordUser.avatarURL() || interaction.client.user.displayAvatarURL(),
                            },
                            amount: user.money.add(user.bank).toNumber()
                        });
                    }
                    interaction.editReply(menus.leaderboard.ranking("Global", type, users, interaction.user.id));
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
                        }
                    })

                    const users = [];

                    for (const user of ranking) {
                        let discordUser = interaction.client.users.cache.get(user.id);
                        if (!discordUser) discordUser = await interaction.client.users.fetch(user.id);
                        users.push({
                            user: {
                                id: user.id,
                                name: discordUser?.displayName || "desconhecido",
                                avatarUrl: discordUser?.displayAvatarURL() || discordUser.avatarURL() || interaction.client.user.displayAvatarURL(),
                            },
                            amount: user[type]
                        })
                    }

                    interaction.editReply(menus.leaderboard.ranking("Global", type, users, interaction.user.id))
                    return;
                }
            }
        }
    },
});