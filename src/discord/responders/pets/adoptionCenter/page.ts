import { createResponder, ResponderType } from "#base";
import { prisma } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";

createResponder({
    customId: "pet/adoptionCenter/page/:page",
    parse(params) {
        return {
            page: parseInt(params.page)
        }
    },
    types: [ResponderType.Button], cache: "cached",
    async run(interaction, { page }) {
        await interaction.deferUpdate();
        const allPets = await prisma.adoptionCenter.findMany({
            where: {
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

        const petsPerPage = 6;
        const startIndex = page * petsPerPage;
        const endIndex = startIndex + petsPerPage;
        const pets = allPets.slice(startIndex, endIndex);

        if (pets.length < 1) {
            interaction.followUp(res.danger(`${icon.Eris_cry} | Não tem nenhum pet disponivel para a adoção nessa página!`))
            return;
        }

        interaction.editReply(menus.pets.adoptionCenter(pets, page))
        return;
    },
});