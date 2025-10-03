import { getValidUserPet, icon } from "#functions";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function petCareCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { user, options } = interaction;
    const petId = Number(options.getString("pet", true));

    await interaction.deferReply();

    const pet = await getValidUserPet(petId, user.id, {
        include: {
            personality: {
                include: {
                    trait: true
                }
            },
            pet: true
        }
    });

    if (!pet) {
        interaction.editReply(`${icon.error} | Eu não consegui encontrar esse pet!`);
        return;
    }

    interaction.editReply(menus.pets.care(user.id, pet))
    return;
}