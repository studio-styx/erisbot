import { createResponder, ResponderType } from "#base";
import { res, icon, resv2 } from "#functions";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";
import { redis } from "#database";
import { menus } from "#menus";

createResponder({
    customId: "giveaway/manage/back/:userId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId }) {
        const { user, message } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }
        await interaction.deferUpdate();
        const key = `giveaway:manage:${message.id}`
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

        interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main"))
        return;
    },
});