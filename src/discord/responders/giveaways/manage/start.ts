import { createResponder, ResponderType } from "#base";
import { redis } from "#database";
import { icon, res, resv2 } from "#functions";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { channelMention } from "discord.js";

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

        const channel = await guild.channels.fetch(giveawayData.channelId);

        if (!channel) {
            interaction.followUp(res.danger(`${icon.error} | Canal do sorteio não foi encontrado! por favor selecione outro canal para criar o sorteio`));
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

        
    },
});