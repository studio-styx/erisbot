import { createResponder, ResponderType } from "#base";
import { getCommandId } from "#functions";
import { menus } from "#menus";

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