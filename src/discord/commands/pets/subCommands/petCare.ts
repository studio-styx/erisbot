import { getValidUserPet, icon } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function petCareCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { user, options } = interaction;
    const petId = Number(options.getString("pet", true));

    await interaction.deferReply();

    const pet = await getValidUserPet(petId, user.id);

    if (!pet) {
        interaction.editReply(`${icon.error} | Eu não consegui encontrar esse pet!`);
        return;
    }
}