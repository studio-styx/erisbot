import { createCommand } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { createRow, limitText } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

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
                where: { id: Number(giveawayID) }
            });

            if (!giveaway) return await interaction.respond([{
                name: "Sorteio não encontrado",
                value: "null"
            }]);

            if (giveaway.expiresAt > new Date()) return await interaction.respond([{
                name: "Esse sorteio ainda não acabou!",
                value: "null"
            }]);

            if (giveaway.winnersIds.length < 1) return await interaction.respond([{
                name: "Nenhum usuário ganhou esse sorteio",
                value: "null"
            }]);

            const values: { name: string; value: string }[] = []
            for (const userId of giveaway.winnersIds) {
                let user = interaction.client.users.cache.get(userId) || null;
                if (!user) user = await interaction.client.users.fetch(userId, { cache: true });
                if (!user) {
                    values.push({ name: "Não encontrado", value: userId });
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
                OR: [
                    { guildId: interaction.guildId },
                    { connectedGuilds: { some: { guildId: interaction.guildId } } }
                ]
            },
            select: {
                title: true,
                id: true,
                localId: true,
                guildId: true,
                connectedGuilds: true
            },
            take: 25
        });

        if (giveaways.length < 1) return await interaction.respond([{
            name: "Nenhum sorteio encontrado",
            value: "null"
        }])

        return await interaction.respond(giveaways.map(g => ({
            name: limitText(`Id: ${g.id} | LocalId: ${g.localId} | Sorteio conectado?: ${g.connectedGuilds.length > 0 ? "Sim" : "Não"} | Titulo: ${g.title}`, 97, "..."),
            value: g.id.toString()
        })))
    },
    dmPermission: false,
    defaultMemberPermissions: ["ManageEvents"],
    async run(interaction) {
        const { user, options, member, guild } = interaction;

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

                const guildIsConnected = giveaway.connectedGuilds.some(g => g.guildId === guild.id);
                const guildIsHost = giveaway.guildId === guild.id;

                if (!guildIsConnected && !guildIsHost) {
                    interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
                    return;
                }

                // pedir confirmação antes
                interaction.editReply(
                    res.danger(`${icon.Eris_cry} | Você está prestes a excluir o sorteio de id **${giveaway.localId}** 
                        ${guildIsHost && giveaway.connectedGuilds.length > 0
                            ? `como esse é um servidor host do sorteio, ao excluir ele todos os outros sorteio(s) de outro(s) **${giveaway.connectedGuilds.length}** server(s) também será apagado`
                            : guildIsConnected
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
                const giveawayID = Number(options.getString("id", true));
                const userId = options.getString("user", true);

                const giveaway = await prisma.giveaway.findUnique({
                    where: { id: giveawayID },
                    include: {
                        connectedGuilds: true,
                        participants: true
                    }
                });

                if (!giveaway) {
                    interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar esse sorteio!`))
                    return;
                }

                const guildIsConnected = giveaway.connectedGuilds.some(g => g.guildId === guild.id);
                const guildIsHost = giveaway.guildId === guild.id;

                if (!guildIsConnected && !guildIsHost) {
                    interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
                    return;
                }

                if (!giveaway.winnersIds.includes(userId)) {
                    interaction.editReply(res.danger(`${icon.error} | Esse usuário não ganhou o sorteio para ser regerado!`))
                    return;
                }

                // regenerar o ganhador

                const newWinners = giveaway.winnersIds.filter(w => w !== userId);

                const selectNewWinner = () => {
                    // Filtrar participantes válidos (excluindo o usuário removido e vencedores restantes)
                    const eligibleParticipants = giveaway.participants.filter(participant =>
                        participant.userId !== userId && !newWinners.includes(participant.userId)
                    );

                    if (eligibleParticipants.length === 0) {
                        return null;
                    }

                    // Selecionar aleatoriamente um novo vencedor
                    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
                    return eligibleParticipants[randomIndex].userId;
                };

                const newWinnerId = selectNewWinner();

                if (!newWinnerId) {
                    interaction.editReply(res.danger(`${icon.error} | Não há participantes elegíveis para selecionar um novo vencedor!`))
                    return;
                }

                // Adicionar o novo vencedor à lista
                newWinners.push(newWinnerId);

                try {
                    const channel = guildIsHost 
                        ? await guild.channels.fetch(giveaway.channelId)
                        : await guild.channels.fetch(giveaway.connectedGuilds.find(g => g.guildId === guild.id)!.channelId);

                    if (!channel || !channel.isTextBased()) {
                        interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar o canal de sorteios`));
                        return;
                    }
                    const messageId = guildIsHost ? giveaway.messageId : giveaway.connectedGuilds.find(g => g.guildId === guild.id)!.messageId;

                    const message = await channel.messages.fetch(messageId).catch((_) => null);

                    if (!message) {
                        interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar a mensagem do sorteio no canal de sorteios`));
                        return;
                    }

                    
                } catch (error) {
                    console.error(error);
                    interaction.editReply(res.danger(`${icon.error} | Um erro desconhecido ocorreu! por favor tente novamente`));
                    return;
                }
            }
        }
    }
});