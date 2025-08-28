import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";

createResponder({
    customId: "devMenu/back/:page",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page }: { page: "dashboard" }) {
        interaction.update(menus.dev[page]());
        return;
    },
});