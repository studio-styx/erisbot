import { prisma } from "#database";
import { getRandomNumber, getRandomValue } from "#functions";
import { Gender } from "#prisma";

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


export async function scheduleReproductionsDate() {
    // Busca pets grávidas com data de término próxima
    const pregnantPets = await prisma.userPet.findMany({
        where: {
            isPregnant: true,
            pregnantEndAt: {
                not: null,
                lt: new Date(Date.now() + 1000 * 60 * 60),
            },
        },
        select: {
            id: true,
            pregnantEndAt: true,
        },
    });

    for (const pet of pregnantPets) {
        setTimeout(async () => {
            await setEndReproduction(pet.id);
        }, pet.pregnantEndAt!.getTime() - Date.now());
    }
}

export async function setEndReproduction(petId: number) {
    // Busca a mãe com todos os dados necessários
    const mother = await prisma.userPet.findUnique({
        where: { id: petId },
        include: {
            spouse: {
                include: {
                    pet: true,
                    personality: { include: { trait: true } },
                    genetics: { include: { gene: true } },
                    skills: { include: { skill: true } },
                },
            },
            pet: true,
            personality: { include: { trait: true } },
            genetics: { include: { gene: true } },
            skills: { include: { skill: true } },
        },
    })

    if (!mother || !mother.isPregnant || !mother.spouseId || !mother.spouse) {
        if (mother) {
            // Reseta gravidez se inválida
            await prisma.userPet.update({
                where: { id: mother.id },
                data: { isPregnant: false, pregnantEndAt: null },
            });
        }
        return;
    }

    const father = mother.spouse;

    // Check se espécies são compatíveis
    if (mother.petId !== father.petId) {
        // Incompatível, aborta gravidez em transação
        await prisma.$transaction([
            prisma.userPet.update({
                where: { id: mother.id },
                data: { isPregnant: false, pregnantEndAt: null, spouseId: null },
            }),
            prisma.userPet.update({
                where: { id: father.id },
                data: { spouseId: null },
            }),
        ]);
        return;
    }

    // Gerar 1 a 3 filhos
    const offspringCount = getRandomNumber(1, 3);

    // Puxar catálogos em uma única transação
    const [catalogGenes, allPersonalityTraits, allSkills] = await prisma.$transaction([
        prisma.genetics.findMany({ where: { petId: mother.petId } }),
        prisma.personalityTrait.findMany(),
        prisma.petSkill.findMany(),
    ]);

    for (let i = 1; i <= offspringCount; i++) {
        // Dados básicos do filho
        const gender = Math.random() < 0.5 ? 'MALE' : 'FEMALE';
        const name = getRandomValue(randomNames[gender]);

        // Criar o filho
        const newOffspring = await prisma.userPet.create({
            data: {
                userId: mother.userId, // Dono da mãe
                petId: mother.petId, // Mesma espécie
                name,
                gender,
                hungry: 100,
                life: 100,
                happiness: 100,
                energy: 100,
                isDead: false,
                isPregnant: false,
                humor: 'normal',
                parent1Id: father.id, // Pai como parent1
                parent2Id: mother.id, // Mãe como parent2
            },
        });

        // Herança de Genetics
        const motherGenes = mother.genetics.map(g => g.gene);
        const fatherGenes = father.genetics.map(g => g.gene);
        const offspringGenes: { geneId: number; inheritedFromParent1: boolean; inheritedFromParent2: boolean }[] = [];

        // Agrupar genes por colorPart
        const parts: { [key: string]: any[] } = {};
        catalogGenes.forEach(gene => {
            if (!parts[gene.colorPart]) parts[gene.colorPart] = [];
            parts[gene.colorPart].push(gene);
        });

        for (const part in parts) {
            let selectedGene = null;
            const candidates = parts[part];

            for (const gene of candidates) {
                const hasMother = motherGenes.some(g => g.id === gene.id);
                const hasFather = fatherGenes.some(g => g.id === gene.id);

                let chance = 0;
                switch (gene.geneType) {
                    case 'DOMINANT':
                        if (hasMother || hasFather) chance = 0.75;
                        if (hasMother && hasFather) chance = 0.9;
                        break;
                    case 'RECESSIVE':
                        if (hasMother && hasFather) chance = 0.25;
                        break;
                    case 'CODOMINANT':
                        if (hasMother || hasFather) chance = 0.5;
                        if (hasMother && hasFather) chance = 0.75;
                        break;
                    case 'NEUTRAL':
                        if (hasMother) chance += 0.5;
                        if (hasFather) chance += 0.5;
                        break;
                }

                // Mutação: 10% chance de gene random
                if (Math.random() < 0.1) {
                    selectedGene = candidates[Math.floor(Math.random() * candidates.length)];
                    break;
                }

                if (Math.random() < chance) {
                    selectedGene = gene;
                    break;
                }
            }

            if (selectedGene) {
                offspringGenes.push({
                    geneId: selectedGene.id,
                    inheritedFromParent1: fatherGenes.some(g => g.id === selectedGene.id),
                    inheritedFromParent2: motherGenes.some(g => g.id === selectedGene.id),
                });
            }
        }

        // Herança de Personality
        const motherTraits = mother.personality.map(p => p.trait);
        const fatherTraits = father.personality.map(p => p.trait);
        const offspringTraits: number[] = [];

        allPersonalityTraits.forEach(trait => {
            const hasMother = motherTraits.some(t => t.id === trait.id);
            const hasFather = fatherTraits.some(t => t.id === trait.id);

            let chance = 0;
            switch (trait.geneType) {
                case 'DOMINANT':
                    if (hasMother || hasFather) chance = 0.75;
                    if (hasMother && hasFather) chance = 0.9;
                    break;
                case 'RECESSIVE':
                    if (hasMother && hasFather) chance = 0.25;
                    break;
                case 'CODOMINANT':
                    if (hasMother || hasFather) chance = 0.5;
                    if (hasMother && hasFather) chance = 0.75;
                    break;
                case 'NEUTRAL':
                    if (hasMother) chance += 0.5;
                    if (hasFather) chance += 0.5;
                    break;
            }

            // Mutação: 10%
            if (Math.random() < 0.1) {
                offspringTraits.push(trait.id);
                return;
            }

            if (Math.random() < chance) {
                offspringTraits.push(trait.id);
            }
        });

        // Herança de Skills
        const motherSkills = mother.skills.map(s => ({ id: s.skill.id, level: s.level }));
        const fatherSkills = father.skills.map(s => ({ id: s.skill.id, level: s.level }));
        const offspringSkills: { skillId: number; level: number }[] = [];

        const hasMotherSkills = motherSkills.length > 0;
        const hasFatherSkills = fatherSkills.length > 0;
        const roll = Math.random();

        if (hasMotherSkills && hasFatherSkills) {
            if (roll < 0.2) {
                // Herda do pai
                const skill = fatherSkills[Math.floor(Math.random() * fatherSkills.length)];
                offspringSkills.push({ skillId: skill.id, level: 1 });
            } else if (roll < 0.4) {
                // Herda da mãe
                const skill = motherSkills[Math.floor(Math.random() * motherSkills.length)];
                offspringSkills.push({ skillId: skill.id, level: 1 });
            } else if (roll < 0.6) {
                // Aleatória
                if (allSkills.length > 0) {
                    const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
                    offspringSkills.push({ skillId: randomSkill.id, level: 1 });
                }
            }
            // else nada
        } else if (hasMotherSkills || hasFatherSkills) {
            const parentSkills = hasFatherSkills ? fatherSkills : motherSkills;
            if (roll < 0.3) {
                // Herda do parent
                const skill = parentSkills[Math.floor(Math.random() * parentSkills.length)];
                offspringSkills.push({ skillId: skill.id, level: 1 });
            } else if (roll < 0.6) {
                // Aleatória
                if (allSkills.length > 0) {
                    const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
                    offspringSkills.push({ skillId: randomSkill.id, level: 1 });
                }
            }
            // else nada
        } else {
            if (Math.random() < 0.3 && allSkills.length > 0) {
                const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
                offspringSkills.push({ skillId: randomSkill.id, level: 1 });
            }
        }

        // Persistir genes, personalidades e skills
        await prisma.$transaction([
            prisma.petGenetics.createMany({
                data: offspringGenes.map(g => ({ ...g, userPetId: newOffspring.id })),
            }),
            prisma.userPetPersonality.createMany({
                data: offspringTraits.map(traitId => ({ userPetId: newOffspring.id, traitId })),
            }),
            prisma.userPetSkill.createMany({
                data: offspringSkills.map(s => ({ ...s, userPetId: newOffspring.id })),
            }),
        ]);
    }

    // Finaliza gravidez e remove cônjuge
    await prisma.$transaction([
        prisma.userPet.update({
            where: { id: mother.id },
            data: { isPregnant: false, pregnantEndAt: null, spouseId: null },
        }),
        prisma.userPet.update({
            where: { id: father.id },
            data: { spouseId: null },
        }),
    ]);
}