import { createResponder, ResponderType } from "#base";
import { icon, res, setFishTimeout } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "fishing/start/:userId/:rodId",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { userId, rodId }) {
        if (interaction.user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Eu sei que é legal pescar, mas essa pesca não é sua!`))
            return;
        }

        await interaction.update(menus.minigames.fishing(userId, Number(rodId)));
        setFishTimeout(interaction, 1, Math.floor(Math.random() * 10000) + 1000)
        return;
    },
});