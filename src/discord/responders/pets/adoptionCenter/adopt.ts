import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, resv2 } from "#functions";

createResponder({
    customId: "pet/adoptionCenter/adopt/:petId",
    types: [ResponderType.Button], cache: "cached",
    parse(params) {
        return {
            petId: parseInt(params.petId)
        }
    },
    async run(interaction, { petId }) {
        const { user } = interaction;
        await interaction.deferUpdate();
        await interaction.editReply(resv2.warning(`${icon.waiting_white} | Aguarde... processando papeladas...`));

        const pet = await prisma.adoptionCenter.findUnique({
            where: {
                id: petId,
                deletedAt: null
            },
            include: {
                userPet: {
                    include: {
                        pet: true
                    }
                }
            }
        });

        if (!pet) {
            interaction.editReply(resv2.danger(`${icon.error} | Esse pet não existe mais!`))
            return;
        }

        if (pet.userPet.userId === user.id) {
            await prisma.adoptionCenter.delete({ where: { id: pet.id } });
            interaction.editReply(resv2.success(`${icon.Eris_happy} | Que bom que você decidiu pegar seu pet de volta! ele agora faz parte de sua família novamente. (por favor não o abandone novamente)`))
            return;
        }

        await prisma.$transaction([
            prisma.adoptionCenter.delete({ where: { id: pet.id } }),
            prisma.user.upsert({ where: { id: user.id }, create: { id: user.id }, update: {} }),
            prisma.userPet.update({
                where: {
                    id: pet.userPet.id
                },
                data: {
                    userId: user.id,
                }
            })
        ]);

        interaction.editReply(resv2.success(`${icon.Eris_happy} | Você adotou o pet **${pet.userPet.name}** com sucesso! agora ele faz parte de sua família.`))
        return;
    },
});