import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { ChatInputCommandInteraction } from "discord.js";

export async function adoptPetCommand(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply({ flags });
    const pets = await prisma.adoptionCenter.findMany({
        where: {
            deletedAt: null
        },
        include: {
            userPet: {
                include: {
                    pet: true,
                    personality: {
                        include: {
                            trait: true
                        }
                    }
                }
            }
        }
    });

    if (pets.length < 1) {
        interaction.editReply(res.danger(`${icon.Eris_cry} | Não tem nenhum pet disponivel para a adoção!`))
        return;
    }

    interaction.editReply(menus.pets.adoptionCenter(pets))
    return;
}