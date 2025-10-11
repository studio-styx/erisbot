import { createResponder, ResponderType } from "#base";
import { icon } from "#functions";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { StringSelectMenuBuilder } from "discord.js";

createResponder({
    customId: "menu/help/commands",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction) {
        const choice = interaction.values[0];

        await interaction.deferUpdate()

        if (choice === "economy") interaction.editReply({ components: [
            createRow(
                new StringSelectMenuBuilder({
                    customId: "menu/help/commands",
                    placeholder: "Economy",
                    options: [
                        { label: "Economia", value: "economy", emoji: icon.money_bag },
                        { label: "Bot", value: "bot", emoji: icon.bot },
                        { label: "Usuário", value: "user", emoji: icon.investment_graph },
                        { label: "Moderação", value: "moderation", emoji: icon.security },
                        { label: "Utilidades", value: "utility", emoji: icon.key },
                        { label: "Diversão", value: "fun", emoji: icon.Eris_happy },
                        { label: "Pet", value: "pet", emoji: "🐶" }
                    ],
                    disabled: true
                })
            )
        ] })

        interaction.editReply(await menus.commands(choice as "economy" | "bot" | "user" | "moderation", interaction));
        return;
    },
});