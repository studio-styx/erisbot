import { createCommand } from "#base";
import { prisma } from "#database";
import { ChannelXpBonus, defaultServerSettings, getServerSettings, icon, LevelGrant, res, RoleXpBonus, ServerSettings, WarnLevelUp } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

createCommand({
    name: "xp",
    description: "xp commands",
    dmPermission: false,
    nameLocalizations: {
        "pt-BR": "xp",
        "en-US": "xp",
        "es-ES": "xp"
    },
    descriptionLocalizations: {
        "pt-BR": "comandos de xp",
        "en-US": "xp commands",
        "es-ES": "comandos de xp"
    },
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "see the xp from a user",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "user",
                "en-US": "user",
                "es-ES": "user"
            },
            descriptionLocalizations: {
                "en-US": "see the xp from a user",
                "pt-BR": "ver o xp de um usuário",
                "es-ES": "ver el xp de un usuario"
            },
            options: [
                {
                    name: "user",
                    description: "user to see the xp",
                    nameLocalizations: {
                        "pt-BR": "user",
                        "en-US": "user",
                        "es-ES": "user"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para ver o xp",
                        "en-US": "user to see the xp",
                        "es-ES": "usuario para ver el xp"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "add",
            description: "add xp to a user",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "add",
                "en-US": "add",
                "es-ES": "add"
            },
            descriptionLocalizations: {
                "pt-BR": "adicionar xp a um usuário",
                "en-US": "add xp to a user",
                "es-ES": "añadir xp a un usuario"
            },
            options: [
                {
                    name: "user",
                    description: "user to add xp",
                    nameLocalizations: {
                        "pt-BR": "user",
                        "en-US": "user",
                        "es-ES": "user"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para adicionar xp",
                        "en-US": "user to add xp",
                        "es-ES": "usuario para añadir xp"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "amount",
                    description: "amount of xp to add",
                    nameLocalizations: {
                        "pt-BR": "quantia",
                        "en-US": "amount",
                        "es-ES": "amount"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantidade de xp para adicionar",
                        "en-US": "amount of xp to add",
                        "es-ES": "cantidad de xp para añadir"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1
                }
            ]
        },
        {
            name: "remove",
            description: "remove xp from a user",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "remover",
                "en-US": "remove",
                "es-ES": "remove"
            },
            descriptionLocalizations: {
                "pt-BR": "remover xp de um usuário",
                "en-US": "remove xp from a user",
                "es-ES": "remover xp de un usuario"
            },
            options: [
                {
                    name: "user",
                    description: "user to remove xp",
                    nameLocalizations: {
                        "pt-BR": "user",
                        "en-US": "user",
                        "es-ES": "user"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuário para remover xp",
                        "en-US": "user to remove xp",
                        "es-ES": "usuario para remover xp"
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "amount",
                    description: "amount of xp to remove",
                    nameLocalizations: {
                        "pt-BR": "quantia",
                        "en-US": "amount",
                        "es-ES": "amount"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "quantidade de xp para remover",
                        "en-US": "amount of xp to remove",
                        "es-ES": "cantidad de xp para remover"
                    },
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    minValue: 1
                }
            ]
        },
        {
            name: "reset",
            description: "reset xp from a user",
            type: ApplicationCommandOptionType.SubcommandGroup,
            nameLocalizations: {
                "pt-BR": "resetar",
                "en-US": "reset",
                "es-ES": "reset"
            },
            descriptionLocalizations: {
                "pt-BR": "resetar xp de um usuário",
                "en-US": "reset xp from a user",
                "es-ES": "resetar xp de un usuario"
            },
            options: [
                {
                    name: "user",
                    description: "reset the xp from a user",
                    nameLocalizations: {
                        "pt-BR": "user",
                        "en-US": "user",
                        "es-ES": "user"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "resetar xp de um usuário",
                        "en-US": "reset the xp from a user",
                        "es-ES": "resetar xp de un usuario"
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user",
                            description: "user to reset the xp",
                            nameLocalizations: {
                                "pt-BR": "user",
                                "en-US": "user",
                                "es-ES": "user"
                            },
                            descriptionLocalizations: {
                                "pt-BR": "usuário para resetar o xp",
                                "en-US": "user to reset the xp",
                                "es-ES": "usuario para resetar el xp"
                            },
                            type: ApplicationCommandOptionType.User,
                            required: true
                        }
                    ]
                },
                {
                    name: "server",
                    description: "reset the xp from the server",
                    nameLocalizations: {
                        "pt-BR": "server",
                        "en-US": "server",
                        "es-ES": "server"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "resetar xp do server",
                        "en-US": "reset the xp from the server",
                        "es-ES": "resetar xp del server"
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
        {
            name: "rank",
            description: "see the rank xp from the server",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "rank",
                "en-US": "rank",
                "es-ES": "rank"
            },
            descriptionLocalizations: {
                "pt-BR": "ver o rank xp do servidor",
                "en-US": "see the rank xp from the server",
                "es-ES": "ver el rank xp del servidor"
            }
        }
    ],
    async run(interaction) {
        const { guildId, options } = interaction;

        await interaction.deferReply();

        const serverSettings = getServerSettings(guildId) || await prisma.guildSettings.findUnique({
            where: { id: guildId }
        }) || defaultServerSettings;

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

        const hasPermission = interaction.member.permissions.has("ManageGuild");

        if (!s.xpSystemEnabled) {
            if (hasPermission) {
                interaction.editReply(res.danger(`${icon.Eris_cry} | esse server está com o sistema de xp desabilitado! mas você pode ligar-lo através de meu website`, {
                    components: [
                        createRow(
                            new ButtonBuilder({
                                style: ButtonStyle.Link,
                                label: "Dashboard",
                                url: `${process.env.FRONT_BASE_URL}/guilds/${interaction.guild.id}`
                            })
                        )
                    ]
                }))
            } else {
                interaction.editReply(res.danger(`${icon.Eris_cry} | esse server está com o sistema de xp desabilitado! peça pra algum staff com permissão de **Gerenciar servidor** para ligar esse sistema no server.`))
            }
            return;
        }

        switch (options.getSubcommand()) {
            case "user": {
                const user = options.getUser("user") || interaction.user;

                if (options.getSubcommandGroup() === "reset") {
                    if (!hasPermission) {
                        interaction.editReply(res.danger(`${icon.Eris_cry} | você não tem permissão para usar esse comando!`));
                        return;
                    }

                    await prisma.guildMember.upsert({
                        where: { guildId_id: { id: user.id, guildId: guildId } },
                        create: { id: user.id, guildId: guildId, xp: 0 },
                        update: { xp: 0 }
                    });

                    interaction.editReply(res.success(`Sucesso ao resetar o xp do usuário **${user.displayName}**, agora ele possui **0** xp!`))
                    return;
                }

                const userMember = await prisma.guildMember.upsert({
                    where: { guildId_id: { id: user.id, guildId: guildId } },
                    create: { id: user.id, guildId: guildId, xp: 0 },
                    update: {}
                });

                const ranking = await prisma.guildMember.findMany({
                    where: { guildId: guildId },
                    orderBy: { xp: "desc" },
                    select: { id: true }
                });

                const position = ranking.findIndex(m => m.id === user.id) + 1;

                const embed = createEmbed({
                    title: user.id === interaction.user.id ? "Sua quantia de xp" : `Quantia de xp de: ${user.displayName}`,
                    description: `${user.id === interaction.user.id ? "Você tem" : "Este usuário tem"} **${userMember.xp}** xp e está na posição **${position}** do ranking!`,
                    color: settings.colors.fuchsia,
                    thumbnail: user.avatarURL(),
                    timestamp: new Date()
                })

                interaction.editReply({ embeds: [ embed ] });
                return;
            }
            case "rank": {
                const ranking = await prisma.guildMember.findMany({
                    where: { guildId },
                    orderBy: { xp: "desc" },
                    select: { id: true, xp: true }
                });

                const guildMembers = await interaction.guild.members.fetch();

                interaction.editReply(menus.xpSystem.rank(ranking, interaction.user.id, guildMembers.map(m => ({
                    displayName: m.displayName,
                    id: m.id,
                    avatarUrl: m.displayAvatarURL() || undefined
                })), 0));
                return;
            }
            case "add": {
                if (!hasPermission) {
                    interaction.editReply(res.danger(`${icon.Eris_cry} | você não tem permissão para usar esse comando!`));
                    return;
                }

                const user = options.getUser("user", true);
                const amount = options.getNumber("amount", true);

                const userMember = await prisma.guildMember.upsert({
                    where: { guildId_id: { id: user.id, guildId } },
                    create: { id: user.id, guildId, xp: amount },
                    update: { xp: { increment: amount } }
                });

                const ranking = await prisma.guildMember.findMany({
                    where: { guildId: guildId },
                    orderBy: { xp: "desc" },
                    select: { id: true }
                });

                const position = ranking.findIndex(m => m.id === user.id) + 1;

                interaction.editReply(res.success(`${icon.success} | Sucesso ao adicionar **${amount}** xp para o usuário **${user.displayName}**, agora ele possui: **${userMember.xp}** xp e está na posição: **${position}** no ranking!`))
                return;
            }
            case "remove": {
                if (!hasPermission) {
                    interaction.editReply(res.danger(`${icon.Eris_cry} | você não tem permissão para usar esse comando!`));
                    return;
                }

                const user = options.getUser("user", true);
                const amount = options.getNumber("amount", true);

                const userMember = await prisma.guildMember.upsert({
                    where: { guildId_id: { id: user.id, guildId } },
                    create: { id: user.id, guildId, xp: 0 },
                    update: { xp: { decrement: amount } }
                });

                if (userMember.xp < 0) await prisma.guildMember.update({
                    where: { guildId_id: { id: user.id, guildId } },
                    data: { xp: 0 }
                })

                const ranking = await prisma.guildMember.findMany({
                    where: { guildId: guildId },
                    orderBy: { xp: "desc" },
                    select: { id: true }
                });

                const position = ranking.findIndex(m => m.id === user.id) + 1;

                interaction.editReply(res.success(`${icon.success} | Sucesso ao remover **${amount}** xp do usuário **${user.displayName}**, agora ele possui: **${userMember.xp < 0 ? 0 : userMember.xp}** xp e está na posição: **${position}** no ranking!`))
                return;
            }
            case "server": {
                if (!hasPermission) {
                    interaction.editReply(res.danger(`${icon.Eris_cry} | você não tem permissão para usar esse comando!`));
                    return;
                }

                await prisma.guildMember.updateMany({
                    where: { guildId },
                    data: { xp: 0 }
                });

                interaction.editReply(res.danger(`${icon.success} | Sucesso ao resetar xp de todos os usuários do server!`))
                return;
            }
        }
    }
});