import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { icon, res, selectWinner } from "#functions";
import { menus } from "#menus";
import { GuildGiveaway, RoleMultipleEntry } from "#prisma";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { createRow, limitText } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, AutocompleteInteraction, ButtonBuilder, ButtonStyle, channelMention, ChannelType, Client, Guild, TextChannel, userMention } from "discord.js";
import { getSolicitationsByGuildScan } from "functions/giveaway/getSolicitationsByGuild.js";
import crypto from "crypto"

async function handleGiveawayToRerollAutocomplete(interaction: AutocompleteInteraction<"cached">, focused: string) {
    const giveaways = await prisma.giveaway.findMany({
        where: {
            title: {
                contains: focused,
                mode: "insensitive"
            },
            expiresAt: {
                lt: new Date() // Já expirou
            },
            connectedGuilds: {
                some: {
                    guildId: interaction.guildId
                }
            }
        },
        select: {
            title: true,
            id: true,
            localId: true,
            connectedGuilds: true
        },
        take: 25
    });

    if (giveaways.length < 1) {
        return await interaction.respond([{
            name: "Nenhum sorteio finalizado encontrado",
            value: "no_ended_giveaways"
        }]);
    }

    return await interaction.respond(giveaways.map(g => ({
        name: limitText(`ID: ${g.id} | Local: ${g.localId} | ${g.connectedGuilds.some(cg => cg.guildId === interaction.guildId) ? "Conectado" : "Não conectado"} | Título: ${g.title}`, 97, "..."),
        value: g.id.toString()
    })));
}

async function handleUserAutocomplete(interaction: AutocompleteInteraction<"cached">, focused: string) {
    // Primeiro, precisamos do ID do sorteio para buscar os vencedores
    const giveawayId = interaction.options.getString("giveawaytoreroll");

    if (!giveawayId) {
        return await interaction.respond([{
            name: "Selecione um sorteio primeiro",
            value: "select_giveaway_first"
        }]);
    }

    const giveaway = await prisma.giveaway.findUnique({
        where: { id: Number(giveawayId) },
        include: {
            participants: true
        }
    });

    if (!giveaway) {
        return await interaction.respond([{
            name: "Sorteio não encontrado",
            value: "giveaway_not_found"
        }]);
    }

    if (giveaway.expiresAt > new Date()) {
        return await interaction.respond([{
            name: "Esse sorteio ainda não acabou!",
            value: "giveaway_not_ended"
        }]);
    }

    const winners = giveaway.participants.filter(p => p.isWinner === true);

    if (winners.length < 1) {
        return await interaction.respond([{
            name: "Nenhum usuário ganhou esse sorteio",
            value: "no_winners"
        }]);
    }

    const values = [];
    for (const winner of winners) {
        let user;
        try {
            user = interaction.client.users.cache.get(winner.userId) ||
                await interaction.client.users.fetch(winner.userId, { cache: true });
        } catch (error) {
            user = null;
        }

        if (!user) {
            values.push({ name: `Não encontrado (ID: ${winner.userId})`, value: winner.userId });
        } else {
            values.push({
                name: `${user.username} (${user.id})`,
                value: user.id
            });
        }
    }

    // Filtrar por texto digitado, se houver
    const filteredValues = focused ?
        values.filter(v => v.name.toLowerCase().includes(focused.toLowerCase())) :
        values;

    return await interaction.respond(filteredValues.slice(0, 25));
}

async function handleGiveawayAutocomplete(interaction: AutocompleteInteraction<"cached">, focused: string) {
    const solicitations = await getSolicitationsByGuildScan(interaction.guildId);
    if (solicitations.length < 1) {
        return await interaction.respond([{
            name: "Nenhum convite de sorteio conectado encontrado",
            value: "null"
        }])
    }

    const giveaways = await prisma.giveaway.findMany({
        where: {
            id: {
                in: solicitations.map(s => Number(s.giveawayId))
            },
            title: {
                contains: focused
            },
        },
        select: {
            title: true,
            id: true,
            localId: true,
            connectedGuilds: true
        },
        take: 25
    });

    if (giveaways.length < 1) {
        return await interaction.respond([{
            name: "Nenhum sorteio encontrado nos convites recebidos",
            value: "null"
        }])
    }

    return await interaction.respond(giveaways.map(g => ({
        name: limitText(`Id: ${g.id} | LocalId: ${g.localId} | Sorteio conectado?: ${g.connectedGuilds.length > 1 ? "Sim" : "Não"} | Titulo: ${g.title}`, 97, "..."),
        value: g.id.toString()
    })))
}

async function handleIdAutocomplete(interaction: AutocompleteInteraction<"cached">, focused: string) {
    const giveaways = await prisma.giveaway.findMany({
        where: {
            title: {
                contains: focused,
                mode: "insensitive"
            },
            expiresAt: {
                gt: new Date()
            },
            connectedGuilds: { some: { guildId: interaction.guildId } }
        },
        select: {
            title: true,
            id: true,
            localId: true,
            connectedGuilds: true
        },
        take: 25
    });

    if (giveaways.length < 1) return await interaction.respond([{
        name: "Nenhum sorteio encontrado",
        value: "null"
    }])

    return await interaction.respond(giveaways.map(g => ({
        name: limitText(`Id: ${g.id} | LocalId: ${g.localId} | Sorteio conectado?: ${g.connectedGuilds.length > 1 ? "Sim" : "Não"} | Titulo: ${g.title}`, 97, "..."),
        value: g.id.toString()
    })))
}

createCommand({
    name: "giveaway",
    description: "giveaway commands",
    type: ApplicationCommandType.ChatInput,
    nameLocalizations: {
        "pt-BR": "sorteio",
        "en-US": "giveaway",
        'es-ES': 'sorteo'
    },
    descriptionLocalizations: {
        "pt-BR": "comandos de sorteio",
        "en-US": "giveaway commands",
        'es-ES': 'comandos de sorteo'
    },
    options: [
        {
            name: "create",
            description: "create a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "criar",
                "en-US": "create",
                'es-ES': 'crear'
            },
            descriptionLocalizations: {
                "pt-BR": "cria um sorteio",
                "en-US": "create a giveaway",
                'es-ES': 'crea un sorteo'
            }
        },
        {
            name: "end",
            description: "end a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "encerrar",
                "en-US": "end",
                'es-ES': 'cerrar'
            },
            descriptionLocalizations: {
                "pt-BR": "encerra um sorteio",
                "en-US": "end a giveaway",
                'es-ES': 'cerrar un sorteo'
            },
            options: [
                {
                    name: "id",
                    description: "giveaway id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id",
                        "en-US": "id",
                        'es-ES': 'id'
                    },
                    descriptionLocalizations: {
                        "pt-BR": "id do sorteio",
                        "en-US": "giveaway id",
                        'es-ES': 'id del sorteo'
                    }
                }
            ]
        },
        {
            name: "reroll",
            description: "reroll a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "refazer",
                "en-US": "reroll",
                'es-ES': "reroll"
            },
            descriptionLocalizations: {
                "pt-BR": "refazer um sorteio",
                "en-US": "reroll a giveaway",
                'es-ES': "reroll a giveaway"
            },
            options: [
                {
                    name: "giveawaytoreroll",
                    description: "giveaway id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id",
                        "en-US": "id",
                        'es-ES': 'id'
                    },
                    descriptionLocalizations: {
                        "pt-BR": "id do sorteio",
                        "en-US": "giveaway id",
                        'es-ES': 'id del sorteo'
                    }
                },
                {
                    name: "user",
                    description: "user to reroll",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "usuario",
                        "en-US": "user",
                        "es-ES": "user"
                    },
                    descriptionLocalizations: {
                        "pt-BR": "usuario para substituir no sorteio",
                        "en-US": "user to reroll",
                        "es-ES": "usuario para sustituir en el sorteo"
                    },
                    required: true
                }
            ]
        },
        {
            name: "cancel",
            description: "cancel a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "cancelar",
                "en-US": "cancel",
                'es-ES': 'cancelar'
            },
            descriptionLocalizations: {
                "pt-BR": "cancela um sorteio",
                "en-US": "cancel a giveaway",
                'es-ES': 'cancela un sorteo'
            },
            options: [
                {
                    name: "id",
                    description: "giveaway id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id",
                        "en-US": "id",
                        'es-ES': 'id'
                    },
                    descriptionLocalizations: {
                        "pt-BR": "id do sorteio",
                        "en-US": "giveaway id",
                        'es-ES': 'id del sorteo'
                    }
                }
            ]
        },
        {
            name: "edit",
            description: "edit a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "editar",
                "en-US": "edit",
                'es-ES': 'editar'
            },
            descriptionLocalizations: {
                "pt-BR": "edita um sorteio",
                "en-US": "edit a giveaway",
                'es-ES': 'edita un sorteo'
            },
            options: [
                {
                    name: "id",
                    description: "giveaway id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id",
                        "en-US": "id",
                        'es-ES': 'id'
                    },
                    descriptionLocalizations: {
                        "pt-BR": "id do sorteio",
                        "en-US": "giveaway id",
                        'es-ES': 'id del sorteo'
                    }
                }
            ]
        },
        {
            name: "entry",
            description: "entry in a connected giveaway using a invite",
            type: ApplicationCommandOptionType.Subcommand,
            nameLocalizations: {
                "pt-BR": "entrar",
                "en-US": "entry",
                'es-ES': 'entrar'
            },
            descriptionLocalizations: {
                "pt-BR": "entrar em um sorteio conectado usando um convite",
                "en-US": "entry in a connected giveaway using a invite",
                'es-ES': 'entrar en un sorteo conectado usando un convite'
            },
            options: [
                {
                    name: "giveaway",
                    description: "giveaway id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                    nameLocalizations: {
                        "pt-BR": "id",
                        "en-US": "id",
                        'es-ES': 'id'
                    },
                    descriptionLocalizations: {
                        "pt-BR": "id do sorteio",
                        "en-US": "giveaway id",
                        'es-ES': 'id del sorteo'
                    }
                },
                {
                    name: "channel",
                    description: "channel where the giveaway will be sent",
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                    channelTypes: [ChannelType.GuildText],
                    nameLocalizations: {
                        "pt-BR": "canal",
                        "en-US": "channel",
                        'es-ES': 'canal'
                    },
                    descriptionLocalizations: {
                        "pt-BR": "canal onde o sorteio será enviado",
                        "en-US": "channel where the giveaway will be sent",
                        'es-ES': 'canal donde el sorteo será enviado'
                    }
                }
            ],
        },
    ],
    async autocomplete(interaction) {
        const hasPerms = interaction.memberPermissions.has("ManageEvents");
        if (!hasPerms) return interaction.respond([{
            name: "Você não tem permissão para usar esse comando!",
            value: "no_permission"
        }]);

        const focused = interaction.options.getFocused();
        const focusedOption = interaction.options.getFocused(true);
        const optionName = focusedOption.name;

        // Use switch para maior clareza
        switch (optionName) {
            case 'id': // Para subcomandos end, cancel, edit
                await handleIdAutocomplete(interaction, focused);
                break;

            case 'giveaway': // Para subcomando entry
                await handleGiveawayAutocomplete(interaction, focused);
                break;

            case 'giveawaytoreroll': // Para subcomando reroll
                await handleGiveawayToRerollAutocomplete(interaction, focused);
                break;

            case 'user': // Para subcomando reroll (usuário)
                await handleUserAutocomplete(interaction, focused);
                break;

            default:
                // Fallback para outros casos
                await handleIdAutocomplete(interaction, focused);
        }
    },
    dmPermission: false,
    defaultMemberPermissions: ["ManageEvents"],
    async run(interaction) {
        const { user, options, member, guild, client } = interaction;
        
        const avaibleGuilds = ["1395383469210865694", "1338980027529957396"];

        if (!avaibleGuilds.includes(guild.id)) {
            interaction.reply(res.danger(`${icon.denied} | Esse é um recurso alpha exclusivo apenas para servidores selecionados! algum dia esse recurso será disponibilizado para todos os servers poderem usar livremente.`))
            return;
        }

        const hasPerms = member.permissions.has("ManageEvents");

        if (!hasPerms) {
            interaction.reply(res.danger(`${icon.denied} | Você precisa da permissão de **gerenciar eventos** para poder gerenciar sorteios!`));
            return;
        }

        await interaction.deferReply();

        switch (options.getSubcommand()) {
            case "cancel": {
                const giveawayId = Number(options.getString("id", true));

                const giveaway = await prisma.giveaway.findUnique({
                    where: {
                        id: giveawayId,
                        expiresAt: {
                            gt: new Date()
                        },
                    },
                    include: {
                        connectedGuilds: true
                    }
                });

                if (!giveaway) {
                    interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar esse sorteio!`))
                    return;
                }

                const guildConnected = giveaway.connectedGuilds.find(g => g.guildId === guild.id);

                if (!guildConnected) {
                    interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
                    return;
                }

                const guildIsHost = guildConnected.isHost;

                // pedir confirmação antes
                interaction.editReply(
                    res.danger(`${icon.Eris_cry} | Você está prestes a excluir o sorteio de id **${giveaway.localId}** 
                        ${guildIsHost && giveaway.connectedGuilds.length > 1
                            ? `como esse é um servidor host do sorteio, ao excluir ele todos os outros sorteio(s) de outro(s) **${giveaway.connectedGuilds.length}** server(s) também será apagado`
                            : !guildIsHost && giveaway.connectedGuilds.length > 1
                                ? `como esse é um sorteio conectado a outro(s) server(s) e ele não é host, apenas esse server sairá do sorteio, enquanto os outros contiuarão funcionando normalmente`
                                : ""}. Você tem certeza que deseja apagar esse sorteio?`,
                        {
                            components: [
                                createRow(
                                    new ButtonBuilder({
                                        customId: `giveaway/delete/confirm/${giveawayId}/${user.id}`,
                                        label: "Deletar",
                                        style: ButtonStyle.Danger,
                                        emoji: "🗑️"
                                    }),
                                    new ButtonBuilder({
                                        customId: `giveaway/delete/cancel/${giveawayId}/${user.id}`,
                                        label: "Cancelar",
                                        style: ButtonStyle.Success,
                                        emoji: "❌"
                                    }),
                                )
                            ]
                        }
                    )
                )
                return;
            }
            case "reroll": {
                const giveawayId = Number(options.getString("giveawaytoreroll", true));
                const userId = options.getString("user", true);

                const giveaway = await prisma.giveaway.findUnique({
                    where: {
                        id: giveawayId,
                        expiresAt: {
                            lt: new Date()
                        },
                        connectedGuilds: { some: { guildId: interaction.guildId } }
                    },
                    include: {
                        connectedGuilds: {
                            include: {
                                guild: true
                            }
                        },
                        roleEntries: true,
                        participants: true
                    }
                });

                if (!giveaway) {
                    interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar esse sorteio!`))
                    return;
                }

                const participant = giveaway.participants.find(p => p.userId === userId);

                if (!participant) {
                    interaction.editReply(res.danger(`${icon.error} | Esse usuário não existe ou não faz parte desse sorteio!`))
                    return;
                }

                const giveawayGuildInfo = giveaway.connectedGuilds.find(g => g.guildId === interaction.guildId);

                if (!giveawayGuildInfo) {
                    interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
                    return;
                }

                const newWinner = await selectWinner(client, giveaway, giveaway.participants, giveaway.connectedGuilds, 1)
                if (!newWinner) {
                    interaction.editReply(res.danger(`${icon.error} | Não existe outros usuários que se adequem aos requisitos para possuir o lugar desse usuário!`))
                    return;
                }

                const winner = newWinner[0];

                const [_a, _b, newWinners] = await prisma.$transaction([
                    prisma.userGiveaway.update({
                        where: {
                            userId_giveawayId: {
                                giveawayId,
                                userId
                            }
                        },
                        data: {
                            isWinner: false
                        }
                    }),
                    prisma.userGiveaway.update({
                        where: {
                            userId_giveawayId: {
                                giveawayId,
                                userId: winner.userId
                            }
                        },
                        data: {
                            isWinner: true
                        }
                    }),
                    prisma.userGiveaway.findMany({
                        where: {
                            giveawayId,
                            isWinner: true
                        }
                    })
                ]);

                // editar a mensagem
                for (const connectedGuild of giveaway.connectedGuilds) {
                    try {
                        const guild = client.guilds.cache.get(connectedGuild.guildId);
                        if (!guild) continue;
                        let channel = guild.channels.cache.get(connectedGuild.channelId) || null;
                        if (!channel) channel = await guild.channels.fetch(connectedGuild.channelId);
                        if (!channel || !channel.isTextBased()) continue;
                        const message = await channel.messages.fetch(connectedGuild.messageId).catch(_ => null);
                        if (!message) continue

                        await message.edit(menus.giveaway.giveawayEnd(newWinners.map(w => w.userId), giveaway))
                    } catch (_) { }
                }

                interaction.editReply(res.success(`${icon.success} | Sucesso ao trocar o ganhador: **${userMention(userId)}** pelo: **${userMention(winner.userId)}**`))
                return;
            }
            case "end": {
                const giveawayId = Number(options.getString("id", true));

                const giveaway = await prisma.giveaway.findUnique({
                    where: {
                        id: giveawayId,
                        expiresAt: {
                            gt: new Date()
                        },
                        connectedGuilds: { some: { guildId: interaction.guildId } }
                    },
                    include: {
                        connectedGuilds: {
                            include: {
                                guild: true
                            }
                        },
                        roleEntries: true,
                        participants: true
                    }
                });

                if (!giveaway) {
                    interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar esse sorteio!`))
                    return;
                }

                const giveawayGuildInfo = giveaway.connectedGuilds.find(g => g.guildId === interaction.guildId);

                if (!giveawayGuildInfo) {
                    interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
                    return;
                }

                const winners = await selectWinner(client, giveaway, giveaway.participants, giveaway.connectedGuilds, giveaway.usersWins);

                if (!winners || winners.length < 1) {
                    interaction.editReply(res.danger(`${icon.error} | Não há participantes elegiveis para ganhar o sorteio!`));
                    return;
                }

                try {
                    const errors: { guildName: string; error: string }[] = []
                    for (const connectedGuild of giveaway.connectedGuilds) {
                        const discordGuild = client.guilds.cache.get(connectedGuild.guildId);
                        if (!discordGuild) {
                            errors.push({
                                guildName: connectedGuild.guildId,
                                error: "O server não foi encontrado! provavelmente eu fui retirada dele antes do sorteio acabar"
                            })
                            continue;
                        }

                        let channel = discordGuild.channels.cache.get(connectedGuild.channelId) || null;
                        if (!channel) channel = await discordGuild.channels.fetch(connectedGuild.channelId);
                        if (!channel || !channel.isTextBased()) {
                            errors.push({
                                guildName: discordGuild.name,
                                error: `Não consegui encontrar o canal de id: ${connectedGuild.channelId} ${channelMention(connectedGuild.channelId)}`
                            })
                            continue;
                        }

                        const message = await channel.messages.fetch(connectedGuild.messageId).catch(_ => null);

                        if (!message) {
                            errors.push({
                                guildName: discordGuild.name,
                                error: `Não foi possivel encontrar a mensagem do sorteio em ${channelMention(connectedGuild.channelId)}`
                            })
                            continue;
                        }

                        try {
                            const msg = await message.edit(menus.giveaway.giveawayEnd(winners.map(w => w.userId), giveaway));
                            await msg.reply(`O moderador: ${userMention(user.id)} finalizou o sorteio mais cedo, os ganhadores são: **${winners.map(w => userMention(w.userId)).join(", ")}**`)
                        } catch (error) {
                            errors.push({
                                guildName: discordGuild.name,
                                error: "Não foi possivel editar a mensagem do sorteio"
                            })
                            continue;
                        }
                    }
                } catch (error) {
                    console.error(error)
                    interaction.editReply(res.danger(`${icon.Eris_cry} | Um erro inesperado ocorreu! me perdoe por tamanha nigligência ${icon.Eris_shy_left}`));
                    return;
                } finally {
                    await prisma.$transaction([
                        prisma.userGiveaway.updateMany({
                            where: {
                                userId: {
                                    in: winners.map(w => w.userId)
                                }
                            },
                            data: {
                                isWinner: true
                            }
                        }),
                        prisma.giveaway.update({
                            where: {
                                id: giveawayId,
                            },
                            data: {
                                expiresAt: new Date(),
                                ended: true
                            }
                        })
                    ])
                }
                interaction.editReply(res.success(`${icon.success} | Você finalizou o sorteio mais cedo!`))
                return;
            }
            case "create": {
                const data: GiveawayManageDataInfo = {
                    channelId: interaction.channelId,
                }

                const msg = await interaction.editReply(menus.giveaway.giveawayManage(user.id, data, "main"));
                await redis.setex(`giveaway:manage:${msg.id}`, 60 * 300, JSON.stringify(data))
                return;
            }
            case "entry": {
                const giveawayId = Number(options.getString("giveaway", true));

                // verificar se o servidor é convidado
                const key = `connectedGiveaway:solicitation:${guild.id}:${giveawayId}`;
                const solicitation = await redis.get(key);
                if (!solicitation) {
                    interaction.editReply(res.danger(`${icon.error} | Esse convite não existe!`))
                    return;
                }

                let success = true;
                try {
                    const giveaway = await prisma.giveaway.findUnique({
                        where: {
                            id: giveawayId
                        },
                        select: {
                            connectedGuilds: true
                        }
                    });

                    if (!giveaway) {
                        interaction.editReply(res.danger(`${icon.error} | Esse convite leva para um sorteio que foi deletado!`));
                        return;
                    }

                    if (giveaway.connectedGuilds.some(cn => cn.guildId === guild.id)) {
                        interaction.editReply(res.danger(`${icon.error} | Esse server já faz parte desse sorteio!`))
                        return;
                    }

                    const channel = options.getChannel("channel", true) as TextChannel;
                    const errors: string[] = [];
                    // verificar ambas as permissões
                    const erisMember = guild.members.me!;
                    const erisPermissions = erisMember.permissionsIn(channel);
                    if (!erisPermissions.has("SendMessages")) errors.push("Eu não tenho a permissão de enviar mensagens nesse canal!");
                    if (!erisPermissions.has("EmbedLinks")) errors.push("Eu não tenho a permissão de enviar links nesse canal!");
                    const userPermissions = member.permissionsIn(channel);
                    if (!userPermissions.has("SendMessages")) errors.push("Você não tem a permissão de enviar mensagens nesse canal!");

                    if (errors.length > 0) {
                        interaction.editReply(res.danger(`${icon.error} | Um total de **${errors.length}** ocorreram!\n ${errors.join("\n")}`));
                        return;
                    }

                    async function getRoleNames(
                        roleEntries: RoleMultipleEntry[],
                        connectedGuilds: GuildGiveaway[],
                        client: Client
                    ): Promise<(RoleMultipleEntry & { roleName: string })[]> {
                        return Promise.all(roleEntries.map(async (roleEntry) => {
                            // Tentar encontrar em qual guild essa role pertence
                            let roleGuild: Guild | null = null;
                            let role: any = null;

                            // Procurar a guild que tem essa role
                            for (const conn of connectedGuilds) {
                                const guild = client.guilds.cache.get(conn.guildId);
                                if (!guild) continue;

                                // Primeiro tenta no cache
                                role = guild.roles.cache.get(roleEntry.roleId);
                                if (role) {
                                    roleGuild = guild;
                                    break;
                                }

                                // Se não achou no cache, tenta fetch
                                try {
                                    role = await guild.roles.fetch(roleEntry.roleId);
                                    if (role) {
                                        roleGuild = guild;
                                        break;
                                    }
                                } catch (error) {
                                    // Role não existe nessa guild, continua procurando
                                    continue;
                                }
                            }

                            // Se não achou em nenhuma guild, usa o nome genérico
                            const roleName = role?.name ?? 'Role não encontrada';

                            return {
                                ...roleEntry,
                                roleName
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

                    // No seu código da transação:
                    await prisma.$transaction(async (tx) => {
                        await tx.guildGiveaway.create({
                            data: {
                                channelId: channel.id,
                                isHost: false,
                                messageId: crypto.randomBytes(Math.ceil(18 / 2)).toString('hex').slice(0, 18),
                                giveawayId,
                                guildId: guild.id,
                            }
                        });

                        const freshGiveaway = await tx.giveaway.findUnique({
                            where: { id: giveawayId },
                            include: {
                                connectedGuilds: true,
                                roleEntries: true,
                                participants: true,
                            },
                        });

                        if (!freshGiveaway) {
                            throw new Error("Falha ao recarregar os dados do sorteio após atualizações.");
                        }

                        const connectedGuildsWithNames = await getGuildNames(freshGiveaway.connectedGuilds, client);
                        const roleEntriesWithNames = await getRoleNames(freshGiveaway.roleEntries, freshGiveaway.connectedGuilds, client);

                        const completeData = {
                            ...freshGiveaway,
                            roleEntries: roleEntriesWithNames,
                            connectedGuilds: connectedGuildsWithNames,
                        };

                        const message = await channel.send(menus.giveaway.giveawayInterface(
                            completeData,
                            guild.id
                        ));

                        await tx.guildGiveaway.update({
                            where: {
                                guildId_giveawayId: {
                                    giveawayId,
                                    guildId: guild.id
                                }
                            },
                            data: {
                                messageId: message.id
                            }
                        });
                    });

                    await interaction.editReply(res.success(`${icon.warning} | Você aceitou o convite! e o sorteio já foi iniciado aqui!`))
                } catch (error) {
                    console.error("Erro ocorreu ao tentar entrar no sorteio conectado:", error);
                    success = false
                    interaction.editReply(res.danger(`${icon.error} | Um erro inesperado aconteceu!`))
                } finally {
                    if (success) await redis.del(key)
                }
                return;
            }
            case "edit": {
                try {
                    const giveawayId = Number(options.getString("id", true));

                    const giveaway = await prisma.giveaway.findUnique({
                        where: {
                            id: giveawayId,
                            expiresAt: {
                                gt: new Date()
                            },
                        },
                        include: {
                            connectedGuilds: true,
                            roleEntries: true
                        }
                    });

                    if (!giveaway) {
                        interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar esse sorteio!`))
                        return;
                    }

                    const guildConnected = giveaway.connectedGuilds.find(g => g.guildId === guild.id);

                    if (!guildConnected) {
                        interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
                        return;
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

                    // Mapear roleEntries para o formato correto
                    const roleEntriesMapped = await getRoleNames(giveaway.roleEntries, guild);
                    const roleEntriesFormatted = roleEntriesMapped.map(role => ({
                        roleName: role.roleName,
                        roleId: role.roleId,
                        entries: role.extraEntries
                    }));

                    // Mapear connectedGuilds para o formato correto
                    const connectedGuildsMapped = await getGuildNames(giveaway.connectedGuilds, client);
                    const connectedGuildsFormatted = connectedGuildsMapped.map(guild => ({
                        guildName: guild.guildName,
                        guildId: guild.guildId,
                        accepted: true
                    }));

                    // Preparar os dados para a função
                    const giveawayData: GiveawayManageDataInfo = {
                        id: giveaway.id,
                        title: giveaway.title,
                        description: giveaway.description || undefined,
                        expiresAt: giveaway.expiresAt,
                        roleEntries: roleEntriesFormatted,
                        channelId: guildConnected.channelId,
                        blackListRoles: guildConnected.blackListRoles,
                        xpRequired: guildConnected.xpRequired || undefined,
                        connectedGuilds: connectedGuildsFormatted,
                        winners: giveaway.usersWins,
                        stayInServerRequire: giveaway.serverStayRequired
                    };

                    const msg = await interaction.editReply(menus.giveaway.giveawayManage(user.id, giveawayData, "main"));
                    await redis.setex(`giveaway:manage:${msg.id}`, 60 * 300, JSON.stringify(giveawayData))
                } catch (error) {
                    console.error("Erro ao mandar o menu de edição do sorteio:", error)
                    interaction.editReply(res.danger(`${icon.error} | Um erro inesperado ocorreu ao usar esse comando!`))
                }
                return;
            }
        }
    }
});
