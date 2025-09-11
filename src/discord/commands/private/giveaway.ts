import { createCommand } from "#base";
import { prisma, redis } from "#database";
import { icon, res, selectWinner } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { createRow, limitText } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, channelMention, userMention } from "discord.js";

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
                    }
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
        }
    ],
    async autocomplete(interaction) {
        const hasPerms = interaction.memberPermissions.has("ManageEvents");
        if (!hasPerms) return interaction.respond([{
            name: "Você não tem permissão para usar esse comando!",
            value: "null"
        }])

        const focused = interaction.options.getFocused();
        const giveawayID = interaction.options.getString("id");

        if (giveawayID) {
            const giveaway = await prisma.giveaway.findUnique({
                where: { id: Number(giveawayID) },
                include: {
                    participants: true
                }
            });

            if (!giveaway) return await interaction.respond([{
                name: "Sorteio não encontrado",
                value: "null"
            }]);

            if (giveaway.expiresAt > new Date()) return await interaction.respond([{
                name: "Esse sorteio ainda não acabou!",
                value: "null"
            }]);

            const winners = giveaway.participants.filter(p => p.isWinner === true)

            if (winners.length < 1) return await interaction.respond([{
                name: "Nenhum usuário ganhou esse sorteio",
                value: "null"
            }]);

            const values: { name: string; value: string }[] = []
            for (const winner of winners) {
                let user = interaction.client.users.cache.get(winner.userId) || null;
                if (!user) user = await interaction.client.users.fetch(winner.userId, { cache: true });
                if (!user) {
                    values.push({ name: "Não encontrado", value: winner.userId });
                    continue;
                }
                values.push({ name: user.displayName, value: user.id })
            }

            return await interaction.respond(values)
        }

        const giveaways = await prisma.giveaway.findMany({
            where: {
                title: {
                    contains: focused
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
    },
    dmPermission: false,
    defaultMemberPermissions: ["ManageEvents"],
    async run(interaction) {
        const { user, options, member, guild, client } = interaction;

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
                const giveawayId = Number(options.getString("id", true));
                const userId = options.getString("user", true);

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
                    } catch (_) {}
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
                            }
                        })
                    ])
                }
            }
            case "create": {
                const data: GiveawayManageDataInfo = {
                    channelId: interaction.channelId,
                }

                const msg = await interaction.editReply(menus.giveaway.giveawayManage(user.id, data, "main"));
                await redis.setex(`giveaway:manage:${msg.id}`, 60 * 300, JSON.stringify(data))
                return;
            }
        }
    }
});
