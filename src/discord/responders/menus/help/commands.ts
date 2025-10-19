import { createResponder, ResponderType } from "#base";
import { commandsManager } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "menu/help/commands/:type/:category/:page",
    types: [ResponderType.StringSelect, ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            type: params.type as "select" | "page",
            category: params.category,
            page: +params.page
        }
    },
    async run(interaction, { type, category, page }) {
        
        await interaction.deferUpdate()
        
        if (type === "select") {
            if (!interaction.isStringSelectMenu()) return;
            const choice = interaction.values[0];
            const commands = commandsManager.fetch();
            await interaction.editReply(await menus.commands(choice, commands, page, interaction));
        } else {
            const commands = commandsManager.fetch();
            await interaction.editReply(await menus.commands(category, commands, page, interaction));
        }

        return;
    },
});