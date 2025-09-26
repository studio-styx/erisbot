import { menus } from "#menus";
import { ButtonInteraction, ContainerComponent, TextDisplayComponent } from "discord.js";

export function setFishTimeout(interaction: ButtonInteraction<"cached">, round: number, timeToEnd: number) {
    setTimeout(async () => {
        const messageContainer = interaction.message.components[0] as ContainerComponent
        const rodId = messageContainer.components[0].id!;
        const messageRound = Number((messageContainer.components[0] as TextDisplayComponent).content.split("|")[1]);

        if (round !== messageRound) return;
        const randomButton = Math.floor(Math.random() * 5) + 1;
        await interaction.editReply(menus.minigames.fishing(interaction.user.id, rodId, round, randomButton));
    }, timeToEnd)
}