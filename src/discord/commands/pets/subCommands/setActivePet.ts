import { prisma } from "#database";
import { getValidUserPet, icon, res } from "#functions";
import { ChatInputCommandInteraction } from "discord.js";

export async function setActivePet(interaction: ChatInputCommandInteraction<"cached">) {
    const { user, options } = interaction;
    const petId = Number(options.getString("pet", true));

    await interaction.deferReply();

    const pet = await getValidUserPet(petId, user.id);

    if (!pet) {
        interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar esse pet!`));
        return;
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { activePetId: pet.id }
        }),
        prisma.log.create({
            data: {
                message: `Definiu seu pet ativo como o pet: **${pet.name}**`,
                userId: user.id,
                level: 5,
                tags: ["pet", "active", "set", pet.id.toString()]
            }
        })
    ])

    interaction.editReply(res.success(`${icon.success} | Você definiu esse pet como seu pet ativo! caso vc use algum comando com a habilidade ativa dele, vc ganha um bônus no comando!`));
    return;
}