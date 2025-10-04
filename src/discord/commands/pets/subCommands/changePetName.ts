import { prisma } from "#database";
import { getValidUserPet, icon, res, verifyPetName } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function changePetName(interaction: ChatInputCommandInteraction<"cached">) {
    await interaction.deferReply({ flags });
    const petId = Number(interaction.options.getString("pet", true));
    const name = interaction.options.getString("name", true);

    const errorName = verifyPetName(name);
    if (errorName.length > 0) {
        await interaction.editReply(res.danger(`${icon.error} | ${errorName.join(", ")}`));
        return;
    }

    const pet = await getValidUserPet(petId, interaction.user.id);
    if (!pet) {
        await interaction.editReply(res.danger(`${icon.error} | Pet não encontrado!`));
        return;
    }

    if (pet.name === name) {
        await interaction.editReply(res.danger(`${icon.error} | O nome não pode ser igual ao nome atual!`));
        return;
    }

    await prisma.$transaction([
        prisma.userPet.update({
            where: {
                id: petId
            },
            data: {
                name
            }
        }),
        prisma.log.create({
            data: {
                userId: interaction.user.id,
                message: `Trocou o nome de seu pet de **${pet.name}** para **${name}**!`,
                level: 3,
                tags: ["pet", "name", "change", "change name", pet.id.toString()]
            }
        })
    ])

    await interaction.editReply(res.success(`${icon.success} | Nome do pet alterado de **${pet.name}** para **${name}**!`))
    return;
}