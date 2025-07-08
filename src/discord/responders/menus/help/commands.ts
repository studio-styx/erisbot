import { createResponder, ResponderType } from "#base";
import { menus } from "#menus";
import { getCommandId } from "#utils";

createResponder({
    customId: "menu/help/commands",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction) {
        const choice = interaction.values[0];

        const commandid = await getCommandId(interaction, choice);

        interaction.update(await menus.commands(commandid, choice as "economy" | "bot" | "user" | "moderation", interaction));
        return;
    },
});