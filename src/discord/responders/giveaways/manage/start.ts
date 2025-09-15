import { createResponder, ResponderType } from "#base";
import { prisma, redis } from "#database";
import { icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { channelMention, Message } from "discord.js";
import crypto from "crypto"

createResponder({
    customId: "giveaway/manage/start/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId }) {
        const { user, message, guild, member } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }

        const key = `giveaway:manage:${message.id}`;

        await interaction.deferUpdate();

        const raw = await redis.get(key);
        if (!raw) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
            return;
        }
        const giveawayData = JSON.parse(raw) as GiveawayManageDataInfo;

        // checar se ainda tem permissão de enviar mensagens no canal selecionado, e se ele ainda existe
        if (!giveawayData.channelId) {
            interaction.followUp(res.danger(`${icon.error} | Você precisa setar o canal onde será enviado a mensagem!`))
            return;
        }
        if (!giveawayData.title) {
            interaction.followUp(res.danger(`${icon.error} | Você precisa setar o título do sorteio!`))
            return;
        }
        if (!giveawayData.expiresAt) {
            interaction.followUp(res.danger(`${icon.error} | Você precisa setar a data de termino do sorteio!`))
            return;
        }

        const channel = await guild.channels.fetch(giveawayData.channelId);

        if (!channel || !channel.isTextBased()) {
            interaction.followUp(res.danger(`${icon.error} | Canal do sorteio não foi encontrado ou não é um canal de texto! por favor selecione outro canal para criar o sorteio`));
            return;
        }

        const errors: string[] = [];
        const erisMember = guild.members.me!;
        const erisPermissions = erisMember.permissionsIn(channel);
        const userPermissions = member.permissionsIn(channel);
        if (!erisPermissions.has("SendMessages")) errors.push(`Não tenho a permissão de enviar mensagens no canal: ${channelMention(channel.id)}`);
        if (!erisPermissions.has("EmbedLinks")) errors.push(`Não tenho a permissão de enviar links no canal: ${channelMention(channel.id)}`);
        if (!erisPermissions.has("ViewChannel")) errors.push(`Não tenho a permissão de ver o canal: ${channelMention(channel.id)}`);
        if (!userPermissions.has("SendMessages")) errors.push(`Você não tem a permissão de enviar mensagens no canal: ${channelMention(channel.id)}`);
        if (!userPermissions.has("ViewChannel")) errors.push(`Vocẽ não tem a permissão de ver o canal: ${channelMention(channel.id)}`);

        if (errors.length > 0) {
            interaction.followUp(res.danger(`${icon.error} | Erro! um total de **${errors.length}** ocorreram!: \n ${errors.map(e => `**\`${e}\`**`).join(", ")}`));
            return;
        }

        const nextId = (await prisma.giveaway.findFirst({
            where: {
                connectedGuilds: {
                    some: {
                        guildId: guild.id
                    }
                }
            },
            orderBy: {
                localId: "desc"
            },
            select: {
                localId: true
            }
        }) || { localId: 0 }).localId + 1;
        
        await prisma.$transaction(async tx => {
            const giveawayCreated = await tx.giveaway.upsert({
                where: { id: giveawayData.id || 0 },
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
                    connectedGuilds: true
                }
            });

            const guildGiveawayCreated = await tx.guildGiveaway.upsert({
                where: {
                    guildId_giveawayId: {
                        guildId: guild.id,
                        giveawayId: giveawayData.id || 0
                    }
                },
                update: {
                    blackListRoles: giveawayData.blackListRoles,
                    xpRequired: giveawayData.xpRequired,
                },
                create: {
                    guildId: guild.id,
                    giveawayId: giveawayCreated.id,
                    channelId: giveawayData.channelId!,
                    messageId: crypto.randomBytes(Math.ceil(18 / 2))
                        .toString('hex')
                        .slice(0, 18), // irá ser trocado depois pelo id da mensagem
                    blackListRoles: giveawayData.blackListRoles,
                    xpRequired: giveawayData.xpRequired,
                }
            });

            if (giveawayData.roleEntries) {
                for (const roleEntry of giveawayData.roleEntries) {
                    await tx.roleMultipleEntry.upsert({
                        where: {
                            giveawayId_roleId: {
                                roleId: roleEntry.roleId,
                                giveawayId: giveawayCreated.id
                            }
                        },
                        update: {
                            extraEntries: roleEntry.entries
                        },
                        create: {
                            roleId: roleEntry.roleId,
                            extraEntries: roleEntry.entries,
                            giveawayId: giveawayCreated.id
                        }
                    });
                }
            }
            

            for (const connectedGuild of giveawayCreated.connectedGuilds) {
                
            }
        });
    },
});