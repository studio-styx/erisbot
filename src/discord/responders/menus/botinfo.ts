import { createResponder, ResponderType } from "#base";
import { resv2 } from "#functions";
import { menus } from "#menus";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

createResponder({
    customId: "botinfo/menu/:page/:userid",
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page, userid }) {
        console.log("Botão acionado", { page, userid });

        if (userid !== interaction.user.id) {
            console.warn("Caiu no if do userid");
            interaction.reply({ content: "Apenas o usuário original pode usar este botão!", ephemeral: true });
            return;
        }

        console.log("Continuou");

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`botinfo/menu/test/${userid}`)
                .setLabel("Teste")
                .setStyle(ButtonStyle.Primary),
        );

        await interaction.reply({
            content: `Página selecionada: ${page}`,
            ephemeral: true,
            components: [row],
        });

        console.log("Resposta enviada");
    },
});