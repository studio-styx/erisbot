import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
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
        const { user, guild } = interaction

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

        const guildIsConnected = giveaway.connectedGuilds.some(g => g.guildId === guild.id);
        const guildIsHost = giveaway.guildId === guild.id;

        if (!guildIsConnected && !guildIsHost) {
            interaction.editReply(res.danger(`${icon.error} | Esse server não faz parte desse sorteio!`))
            return;
        }

        if (guildIsConnected) {
            await prisma.guildGiveaway.delete({
                where: {
                    guildId_giveawayId: {
                        giveawayId,
                        guildId: guild.id
                    }
                }
            });

            const connectInfo = giveaway.connectedGuilds.find(g => g.guildId === guild.id);

            if (!connectInfo) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel achar as informações desse server no sorteio!`))
                return;
            };

            let channel = interaction.guild.channels.cache.get(connectInfo.channelId) || null;
            if (!channel) channel = await interaction.guild.channels.fetch(connectInfo.channelId);

            if (!channel || !channel.isTextBased()) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel achar o canal desse server no sorteio!, porém o servidor foi removido do sorteio com sucesso!`))
                return;
            }

            const message = await channel.messages.fetch(connectInfo.messageId).catch((_) => null);

            if (!message) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel achar a mensagem do sorteio no canal ${channelMention(channel.id)} mas o servidor foi removido do server com sucesso!`))
                return;
            }

            await message.edit(res.danger(
                `${icon.Eris_cry} | O moderador ${userMention(userId)} decidiu tirar o servidor desse sorteio!`,
                {
                    components: []
                }
            )).catch((_) => null);

            interaction.editReply(res.success(`${icon.success} | Você retirou o server do sorteio!`, { components: [] }))
            return;
        }
        if (guildIsHost && giveaway.connectedGuilds.length < 1) {
            // sorteio exclusivo do server
            await prisma.giveaway.delete({
                where: {
                    id: giveawayId
                }
            })
            let channel = interaction.guild.channels.cache.get(giveaway.channelId) || null;
            if (!channel) channel = await interaction.guild.channels.fetch(giveaway.channelId);

            if (!channel || !channel.isTextBased()) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel achar o canal desse server no sorteio!, porém o servidor foi removido do sorteio com sucesso!`))
                return;
            }

            const message = await channel.messages.fetch(giveaway.messageId).catch((_) => null);

            if (!message) {
                interaction.editReply(res.danger(`${icon.error} | Não foi possivel achar a mensagem do sorteio no canal ${channelMention(channel.id)} mas o servidor foi removido do server com sucesso!`))
                return;
            }

            await message.edit(res.danger(
                `${icon.Eris_cry} | O moderador ${userMention(userId)} decidiu tirar o servidor desse sorteio!`,
                {
                    components: []
                }
            )).catch((_) => null);

            interaction.editReply(res.success(`${icon.success} | Você excluiu o sorteio com sucesso!`, { components: [] }))
            return;
        }
        // se não for server conectado, nem for sorteio exclusivo do server, então o server é host
        await prisma.giveaway.delete({
            where: {
                id: giveawayId
            }
        });

        giveaway.connectedGuilds.push({
            channelId: giveaway.channelId,
            giveawayId: giveaway.id,
            guildId: guild.id,
            messageId: giveaway.messageId,
            createdAt: new Date(),
            id: 999
        });

        const errors: string[] = []

        for (const connectedGuild of giveaway.connectedGuilds) {
            const connectedGuildInfo = interaction.client.guilds.cache.get(connectedGuild.guildId);
            if (!connectedGuildInfo) {
                errors.push(`Servidor de id: ${connectedGuild.guildId} não encontrado!`);
                continue
            }

            let channel = connectedGuildInfo.channels.cache.get(giveaway.channelId) || null;
            if (!channel) channel = await interaction.guild.channels.fetch(giveaway.channelId);

            if (!channel || !channel.isTextBased()) {
                errors.push(`Não foi possivel encontrar o canal de id ${connectedGuild.channelId} no server **\`${connectedGuildInfo.name}\`**`)
                continue;
            }

            const message = await channel.messages.fetch(giveaway.messageId).catch((_) => null);

            if (!message) {
                errors.push(`Não foi possivel encontrar a mensagem de sorteio do servidor: **${connectedGuildInfo.name}** no canal: **${channel.name}**`)
                continue;
            }
            
            await message.edit(res.danger(
                `${icon.Eris_cry} | O moderador ${userMention(userId)} (${user.displayName}) decidiu excluir o sorteio! como ele é do servidor host então todos os servers que faziam parte desse sorteio também foram removidos dele!`,
                {
                    components: []
                }
            )).catch((_) => (
                errors.push(`Não foi possivel editar a mensagem de sorteio do servidor: **${connectedGuildInfo.name}** no canal: **${channel.name}**`)
            ));
        }

        interaction.editReply(res.success(`${icon.success} | Todos os servers foram retirados do sorteio!`, {
            fields: errors.length > 0 ? [
                {
                    name: "Erros:",
                    value: errors.join("\n")
                }
            ] : [],
            components: []
        }))
    },
});