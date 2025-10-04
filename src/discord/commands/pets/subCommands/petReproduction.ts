import { prisma } from "#database";
import { getValidUserPet, icon, res } from "#functions";
import { Animal } from "#prisma";
import { ChatInputCommandInteraction, time } from "discord.js";

export async function petReproductionCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const { user, options } = interaction;
    const pet1Id = Number(options.getString("pet1", true));
    const pet2Id = Number(options.getString("pet2", true));

    await interaction.deferReply();

    const [pet1, pet2] = await Promise.all([
        await getValidUserPet(pet1Id, user.id, {
            include: {
                pet: true,
                childsAsParent1: true,
                childsAsParent2: true,
                parent1: true,
                parent2: true
            }
        }),
        await getValidUserPet(pet2Id, user.id, {
            include: {
                pet: true,
                childsAsParent1: true,
                childsAsParent2: true,
                parent1: true,
                parent2: true
            }
        })
    ]);

    // verificar se existem
    if (!pet1 || !pet2) {
        if (!pet1 && !pet2) {
            interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar nenhum desses dois pets!`));
        } else if (!pet1) {
            interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar o primeiro pet!`));
        } else if (!pet2) {
            interaction.editReply(res.danger(`${icon.error} | Eu não consegui encontrar o segundo pet!`));
        }
        return;
    }

    // verificar se são o MESMO pet
    if (pet1.id === pet2.id) {
        interaction.editReply(res.danger(`${icon.error} | Um pet não pode se reproduzir com ele mesmo!`));
        return;
    }

    // verificar se são compativeis
    if (pet1.pet.animal !== pet2.pet.animal) {
        interaction.editReply(res.danger(`${icon.error} | Os pets são animais diferentes!`))
        return;
    }
    
    if (pet1.gender === pet2.gender) {
        interaction.editReply(res.danger(`${icon.error} | Eu sei que esse é um assunto polêmico, mas pets do mesmo sexo não pode acasalar!`));
        return;
    }
    
    if (pet1.isPregnant || pet2.isPregnant) {
        interaction.editReply(res.danger(`${icon.error} | A fêmea já está gravida! espere ela parir para poder reproduzir novamente!`));
        return;
    }

    // VERIFICAÇÕES DE PARENTESCO

    // 1. Verificar se são pai/filho DIRETO
    const isDirectParentChild = (
        // Pet1 é pai/mãe do Pet2
        pet1.childsAsParent1.some(child => child.id === pet2.id) ||
        pet1.childsAsParent2.some(child => child.id === pet2.id) ||
        // Pet2 é pai/mãe do Pet1
        pet2.childsAsParent1.some(child => child.id === pet1.id) ||
        pet2.childsAsParent2.some(child => child.id === pet1.id)
    );

    if (isDirectParentChild) {
        interaction.editReply(res.danger(`${icon.denied} | Você não pode acasalar pais e filhos!`));
        return;
    }

    // 2. Verificar se são IRMÃOS (mesmos pais)
    const areSiblings = (
        // Mesmo pai OU mesma mãe
        (pet1.parent1?.id === pet2.parent1?.id && pet1.parent1 !== null) ||
        (pet1.parent1?.id === pet2.parent2?.id && pet1.parent1 !== null) ||
        (pet1.parent2?.id === pet2.parent1?.id && pet1.parent2 !== null) ||
        (pet1.parent2?.id === pet2.parent2?.id && pet1.parent2 !== null)
    );

    if (areSiblings) {
        interaction.editReply(res.danger(`${icon.denied} | Você não pode acasalar irmãos!`));
        return;
    }

    // 3. Verificar se são PRIMOS (opcional - se quiser mais restrições)
    const areCousins = checkIfCousins(pet1, pet2);
    if (areCousins) {
        interaction.editReply(res.danger(`${icon.denied} | Você não pode acasalar primos!`));
        return;
    }

    // 4. Verificar se já estão casados com outros
    if (pet1.spouseId || pet2.spouseId) {
        interaction.editReply(res.danger(`${icon.denied} | Um dos pets já está em um relacionamento!`));
        return;
    }

    const female = pet1.gender === "FEMALE" ? pet1 : pet2;
    const male = pet1.gender === "MALE" ? pet1 : pet2;

    const animalPregnantDurationInMinutes: Record<Animal, number> = {
        CAT: 60 * 12,
        DOG: 60 * 12,
        BIRD: 60 * 8,
        DRAGON: 60 * 24 * 12,
        HAMSTER: 60 * 4,
        JAGUAR: 60 * 24 * 5,
        LION: 60 * 24 * 7,
        RABBIT: 60 * 10
    }

    const dateToPregnantEnd = new Date(Date.now() + 1000 * 60 * animalPregnantDurationInMinutes[female.pet.animal]);

    await prisma.$transaction([
        prisma.userPet.update({
            where: { id: female.id },
            data: {
                isPregnant: true,
                pregnantEndAt: dateToPregnantEnd,
                spouseId: male.id
            }
        }),
        prisma.userPet.update({
            where: { id: male.id },
            data: {
                spouseId: female.id
            }
        })
    ]);

    interaction.editReply(res.success(`${icon.success} | Você colocou seu pet **${male.name}** para se reproduzir com **${female.name}**! ela está grávida e irá parir em ${time(dateToPregnantEnd, "R")}`));
}

// Função auxiliar para verificar se são primos
function checkIfCousins(pet1: any, pet2: any): boolean {
    const pet1Grandparents = [
        pet1.parent1?.parent1?.id, pet1.parent1?.parent2?.id,
        pet1.parent2?.parent1?.id, pet1.parent2?.parent2?.id
    ].filter(Boolean);
    
    const pet2Grandparents = [
        pet2.parent1?.parent1?.id, pet2.parent1?.parent2?.id,
        pet2.parent2?.parent1?.id, pet2.parent2?.parent2?.id
    ].filter(Boolean);

    // Se compartilham algum avô em comum, são primos
    return pet1Grandparents.some(gp1 => 
        pet2Grandparents.some(gp2 => gp1 === gp2)
    );
}