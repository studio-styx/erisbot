import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res, resv2 } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { channelMention, userMention } from "discord.js";

createResponder({
    customId: "giveaway/delete/:delete/:giveawayId/:userId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            delete: params.delete === "confirm",
            giveawayId: Number(params.giveawayId),
            userId: params.userId
        }
    },
    async run(interaction, { delete: isDelete, userId, giveawayId }) {
        const { user, guild, client } = interaction

        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Você não tem permissão pra interagir com esse botão! você precisa ser ${userMention(userId)} para isso!`));
            return;
        }

        if (!isDelete) {
            interaction.reply(res.success(`${icon.Eris_happy} | Que bom que você repensou! o sorteio não será deletado!`));
            return;
        }

        await interaction.deferUpdate();
        await interaction.editReply(res.warning(`${icon.waiting_white} | Aguarde... processando`));

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
            interaction.editReply(res.danger(`${icon.error} | Esse sorteio não existe mais!`))
            return;
        }

        const guildConnected = giveaway.connectedGuilds.find(g => g.guildId === guild.id);

        if (!guildConnected) {
            interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`));
            return;
        }

        const guildIsHost = guildConnected.isHost;

        if (!guildIsHost) {
            await prisma.guildGiveaway.delete({
                where: {
                    guildId_giveawayId: {
                        giveawayId,
                        guildId: guild.id
                    }
                }
            })

            let channel = guild.channels.cache.get(guildConnected.channelId) || null;
            if (!channel) channel = await guild.channels.fetch(guildConnected.channelId);
            if (!channel || !channel.isTextBased()) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar o canal do sorteio! mas o server foi removido do sorteio com sucesso.`))
                return;
            }

            const message = await channel.messages.fetch(guildConnected.messageId).catch(_ => null);
            if (!message) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel encontrar a mensagem do sorteio! mas o server foi removido do sorteio com sucesso.`))
                return;
            }

            await message.edit(resv2.danger(
                `O moderador: ${userMention(user.id)} removeu esse server do sorteio!`
            )).catch(_ => null)

            interaction.editReply(res.success(`${icon.success} | Sucesso ao remover o server do sorteio!`))
        } else {
            const errors: { guildId: string; error: string; guildName: string }[] = []
            
            await prisma.giveaway.delete({
                where: {
                    id: giveawayId
                }
            })

            for (const connectedGuild of giveaway.connectedGuilds) {
                const cnnGuild = client.guilds.cache.get(connectedGuild.guildId);
                if (!cnnGuild) {
                    errors.push({
                        guildId: connectedGuild.guildId,
                        error: "Server não encontrado",
                        guildName: connectedGuild.guildId
                    });
                    continue;
                };

                let channel = cnnGuild.channels.cache.get(connectedGuild.channelId) || null;
                if (!channel) channel = await cnnGuild.channels.fetch(connectedGuild.channelId);
                if (!channel || !channel.isTextBased()) {
                    errors.push({
                        guildId: cnnGuild.id,
                        error: `Canal ${channelMention(connectedGuild.channelId)} id: \`${connectedGuild.channelId}\` não encontrado`,
                        guildName: cnnGuild.name
                    });
                    continue
                }

                const message = await channel.messages.fetch(connectedGuild.messageId).catch(_ => null);
                if (!message) {
                    errors.push({
                        guildId: cnnGuild.id,
                        guildName: cnnGuild.name,
                        error: `Não foi possivel encontrar a mensagem do sorteio`
                    })
                    continue;
                }

                try {
                    await message.edit(resv2.danger(
                        `Esse sorteio foi deletado pelo moderador: **${user.displayName.replace(/([\\_*~`|>])/g, '\\$1')}**`,
                        !guildIsHost && `Pelo moderador do server host: **\`${guild.name}\`**`
                    ))
                } catch (_) {
                    errors.push({
                        guildId: cnnGuild.id,
                        guildName: cnnGuild.name,
                        error: `Não foi possivel editar a mensagem do sorteio!`
                    })
                    continue;
                }
            }

            interaction.editReply(res.success(
                brBuilder(
                    `${icon.success} | Sucesso ao deletar o sorteio!`,
                    errors.length > 0 ? brBuilder(
                        `No entando ocorreu **${errors.length}** erros!`,
                        errors.map(e => `**\`${e.guildName}\`**: ${e.error}`)
                    ) : null
                )
            ))
        }
        return;
    },
});