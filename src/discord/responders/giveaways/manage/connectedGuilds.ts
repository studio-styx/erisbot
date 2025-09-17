import { createResponder, ResponderType } from "#base";
import { redis } from "#database";
import { getMutualGuilds, icon, res, resv2 } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";

createResponder({
    customId: "giveaway/manage/:type/connectedGuilds/:userId/:page",
    types: [ResponderType.StringSelect, ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            type: params.type as "stringSelect" | "button" | "clearCache",
            userId: params.userId,
            page: Number(params.page)
        }
    },
    async run(interaction, { page, type, userId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }

        const { client, guildId, message } = interaction;


        const key = `giveaway:manage:${message.id}`;

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

        if (interaction.isButton()) {
            await interaction.deferUpdate();
            if (type === "clearCache") {
                await redis.del(`mutualGuilds:${userId}`);
            }

            const mutualGuilds = (await getMutualGuilds(client, userId)).filter(g => g.id !== guildId);

            const inicial = page * 25;
            const final = inicial + 25;

            const hasSize = mutualGuilds.slice(inicial, final).length > 0;

            if (!hasSize) {
                interaction.followUp(res.danger(`${icon.error} | ${page === 0 ? "Não tem nenhum server onde eu compartilho com você além desse!" : "Não existem servers nessa página!"}`))
                return;
            }
            interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "connectedGuilds", page, mutualGuilds));
            return;
        } else {
            await interaction.deferReply({ flags: ["Ephemeral"] })
            const choice = interaction.values[0];
            if (giveawayData.connectedGuilds?.some(g => g.guildId === choice)) {
                interaction.editReply(res.danger(`${icon.denied} | Esse server já está na lista de servidores conectados! e será solicitado conexão quando o sorteio for iniciado!`))
                return;
            }
            const guild = client.guilds.cache.get(choice);

            if (!guild) {
                interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar esse server, certifique-se de que eu esteja no servidor!`))
                return;
            }

            const member = await guild.members.fetch(userId);

            if (!member) {
                interaction.editReply(res.danger(`${icon.error} | Você precisa estar nesse servidor para que possa solicitar uma conexão com sorteio!`));
                return;
            }

            await redis.setex(key, 3600, JSON.stringify({
                ...giveawayData,
                expiresAt: giveawayData.expiresAt?.toISOString(),
                connectedGuilds: giveawayData.connectedGuilds 
                    ? giveawayData.connectedGuilds.push({ accepted: false, guildName: guild.name, guildId: guild.id })
                    : [{ accepted: false, guildName: guild.name, guildId: guild.id }]
            }));

            interaction.editReply(res.success(`${icon.success} | Sucesso ao solicitar sorteio conectado com **\`${guild.name}\`**! A solicitação será enviada quando o sorteio for iniciado.`))
            return;
        }
    },
});