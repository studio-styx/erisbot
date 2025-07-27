import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";

createResponder({
    customId: "botinfo/menu/:page/:userid",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, userid }) {
        if (userid !== interaction.user.id) {
            interaction.reply(await menus.botinfo(page as 'main' | 'hardware' | 'software' | 'curiosities', interaction.client.user, interaction.user))
            return;
        }
        interaction.update(await menus.botinfo(page as 'main' | 'hardware' | 'software' | 'curiosities', interaction.client.user, interaction.user))
        return;
    },
});