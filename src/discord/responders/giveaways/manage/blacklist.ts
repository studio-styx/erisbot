import { createResponder, ResponderType } from "#base";
import { redis } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { GiveawayManageDataInfo } from "#types/giveawayManageDataType.js";

createResponder({
    customId: "giveaway/manage/roleSelect/blacklist/:userId/:giveawayId",
    types: [ResponderType.RoleSelect], cache: "cached",
    async run(interaction, { userId, giveawayId }) {
        const { user, message } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando!`))
            return;
        }
        await interaction.deferUpdate();
        const key = `giveaway:manage:${message.id}`
        const raw = await redis.get(key);
        if (!raw) {
            interaction.editReply(res.danger(`${icon.Eris_cry} | Parece que você demorou demais para setar as configurações do sorteio! as informações sobre o sorteio sumiram!`));
            return;
        }

        const roles = interaction.values;

        const giveawayData = JSON.parse(raw) as GiveawayManageDataInfo;

        giveawayData.blackListRoles = roles;

        await redis.setex(key, 60 * 300, JSON.stringify(giveawayData));
        interaction.editReply(menus.giveaway.giveawayManage(userId, giveawayData, "main", giveawayId ? Number(giveawayId) : undefined));
        return;
    },
});