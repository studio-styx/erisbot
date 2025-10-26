import { prisma } from "#database";
import { getValidUserPet, icon, res } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function realeasePetCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { user, options } = interaction;
    const petId = Number(options.getString("pet", true));

    await interaction.deferReply();

    const pet = await getValidUserPet(petId, user.id);

    if (!pet) {
        interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar esse pet!`));
        return;
    }

    await prisma.$transaction([
        prisma.adoptionCenter.create({
            data: {
                userPetId: pet.id,
                deleteIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            }
        }),
        prisma.userPet.update({
            where: { id: pet.id },
            data: { isPregnant: false, pregnantEndAt: null}
        }),
        prisma.log.create({
            data: {
                type: "info",
                userId: user.id,
                message: `Usuário ${user.tag} (${user.id}) botou o pet ${pet.name} (ID: ${pet.id}) para adoção.`,
                tags: ["pet", "release", "adoption_center", `USERPETID_${pet.id}`]
            }
        })
    ])

    interaction.editReply(res.success(`${icon.Eris_cry} | Você botou seu bixinho para adoção! que falta de amor no coração 💔`))
    return;
}