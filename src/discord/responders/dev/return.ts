import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";

createResponder({
    customId: "devMenu/back/:page",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction) {
        interaction.update(menus.dev.dashboard());
        return;
    },
});