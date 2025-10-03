import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { getRandomValue, icon, res, resv2, verifyPetName } from "#functions";
import { Gender } from "#prisma";
import { createModalFields } from "@magicyan/discord";
import { TextInputStyle } from "discord.js";

const randomNames: Record<Gender, string[]> = {
    MALE: [
        "Rex", "Bolt", "Max", "Thor", "Simba", "Leo", "Rocky", "Spike", "Odin", "Zeus",
        "Milo", "Apollo", "Charlie", "Finn", "Hunter", "Shadow", "Toby", "Rusty", "Buster", "Ace",
        "Duke", "Sammy", "Tiger", "Jack", "Lucky", "Bear", "Scout", "King", "Gizmo", "Cosmo",
        "Ranger", "Blaze", "Samson", "Jasper", "Chico", "Bandit", "Oscar", "Hercules", "Finnick", "Arlo"
    ],
    FEMALE: [
        "Luna", "Bella", "Mia", "Nala", "Athena", "Daisy", "Cleo", "Ruby", "Sophie", "Chloe",
        "Lily", "Zoe", "Molly", "Rosie", "Willow", "Harper", "Stella", "Ivy", "Ella", "Jasmine",
        "Sadie", "Penny", "Lucy", "Maya", "Roxy", "Nina", "Aurora", "Ginger", "Hazel", "Olivia",
        "Fiona", "Flora", "Maisie", "Trixie", "Violet", "Mimi", "Coco", "Pepper", "Lacey", "Dottie"
    ]
};

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
                interaction.reply(res.danger(`${icon.denied} | ${errors.map(e => `**\`${e}\`**`).join(", ")}`))
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
                        name: {
                            label: "Coloque o nome de seu pet",
                            placeholder: `${getRandomValue(randomNames[getRandomValue(["MALE", "FEMALE"]) as Gender])}...`,
                            style: TextInputStyle.Short,
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