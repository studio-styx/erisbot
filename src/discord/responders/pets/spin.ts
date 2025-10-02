import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res, resv2, verifyPetName } from "#functions";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";

createResponder({
    customId: "pet/spin/:action/:userId/:petId",
    parse(params) {
        return {
            action: params.action as "name" | "del",
            userId: params.userId as string,
            petId: parseInt(params.petId)
        }
    },
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, { action, userId, petId }) {
        const { user } = interaction;
        if (user.id !== userId) {
            interaction.reply(res.danger(`${icon.denied} | Não foi você que executou esse comando! não venha roubar pet dos outros!`))
            return;
        }

        if (interaction.isModalSubmit()) {
            const { fields } = interaction;
            const name = fields.getTextInputValue("name");
            // verificar se o nome possui algo de errado
            const errors = verifyPetName(name);
            if (errors.length > 0) {
                interaction.reply(res.danger(`${icon.denied} | ${errors.map(e => `**\`${e}\`**`).join(", ")}**`))
            } else {
                await interaction.deferUpdate();
                try {
                    await prisma.userPet.update({
                        where: { id: petId },
                        data: { name }
                    });

                    interaction.editReply(resv2.success(`${icon.success} | Você trocou o nome de seu pet para **${name}**!`))
                } catch (e) {
                    console.error(e)
                    interaction.editReply(resv2.danger(`${icon.error} | Um erro misterioso ocorreu! certifique-se que seu pet ainda existe!`));
                }
            }
            return;
        }

        switch (action) {
            case "name": {
                interaction.showModal({
                    customId: `pet/spin/name/${userId}/${petId}`,
                    title: "Nome do pet",
                    components: createModalFields({
                        response: {
                            label: "Coloque o nome de seu pet",
                            placeholder: "Bella..",
                            style: TextInputStyle.Paragraph,
                            required: true,
                        },
                    }),
                });
                return;
            }
            case "del": {
                await interaction.deferUpdate();

                const pet = await prisma.userPet.findUnique({ where: { id: petId } });
                if (!pet) {
                    interaction.editReply(resv2.danger(`${icon.error} | Esse pet não existe!`))
                    return;
                }
                // colocar o pet na adoção
                await prisma.$transaction([
                    prisma.adoptionCenter.create({
                        data: {
                            userPetId: pet.id,
                            deleteIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                        }
                    }),
                    prisma.userPet.update({
                        where: { id: pet.id },
                        data: { isPregnant: false, pregnantEndAt: null }
                    })
                ])

                interaction.editReply(resv2.success(`${icon.Eris_cry} | Você botou seu bixinho para adoção! que falta de amor no coração 💔`))
                return;
            }
        }
    },
});