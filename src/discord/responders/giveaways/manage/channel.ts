import { createResponder, ResponderType } from "#base";
import { redis } from "#database";
import { icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";

createResponder({
    customId: "giveaway/manage/channelSelect/channel/:userId",
    types: [ResponderType.ChannelSelect], cache: "cached",
    async run(interaction, { userId }) {
        const { user, message, guild, member } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }

        const key = `giveaway:manage:${message.id}`;

        const channelId = interaction.values[0];
        await interaction.deferUpdate();
        const channel = await guild.channels.fetch(channelId);

        if (!channel) {
            interaction.followUp(res.danger(`${icon.error} | Eu não consegui encontrar esse canal no servidor!`))
            return;
        }

        const errors: string[] = [];
        // verificar ambas as permissões
        const erisMember = guild.members.me!;
        const erisPermissions = erisMember.permissionsIn(channel);
        if (!erisPermissions.has("SendMessages")) errors.push("Eu não tenho a permissão de enviar mensagens nesse canal!");
        if (!erisPermissions.has("EmbedLinks")) errors.push("Eu não tenho a permissão de enviar links nesse canal!");
        const userPermissions = member.permissionsIn(channel);
        if (!userPermissions.has("SendMessages")) errors.push("Você não tem a permissão de enviar mensagens nesse canal!");

        if (errors.length > 0) {
            interaction.followUp(res.danger(`${icon.error} | Um total de **${errors.length}** ocorreram!\n ${errors.join("\n")}`));
            return;
        }

        const raw = await redis.get(key);
        if (!raw) {
            interaction.editReply(resv2.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
            return;
        }
        const giveawayData = JSON.parse(raw, (key, value) => {
            // Converte strings de data de volta para objetos Date
            if (key === 'expiresAt' && typeof value === 'string') {
                return new Date(value);
            }
            return value;
        }) as GiveawayManageDataInfo;

        giveawayData.channelId = channel.id;

        await redis.setex(key, 3600, JSON.stringify({
            ...giveawayData,
            expiresAt: giveawayData.expiresAt?.toISOString() // Converte Date para string
        }));

        interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main"))
        return;
    },
});