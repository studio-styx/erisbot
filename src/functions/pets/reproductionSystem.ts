import { prisma } from "#database";
import { calculateProbability, getRandomNumber, getRandomValue } from "#functions";
import { Gender, GeneType, PetGeneticsColorPart } from "#prisma";

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
        const time = pet.pregnantEndAt!.getTime() - Date.now();
        if (time < 1) {
            await setEndReproduction(pet.id);
            continue;
        }
        setTimeout(async () => {
            await setEndReproduction(pet.id);
        }, pet.pregnantEndAt!.getTime() - Date.now());
    }
}

export async function setEndReproduction(petId: number) {
    // Busca a mãe com dados necessários, incluindo ancestrais
    const mother = await prisma.userPet.findUnique({
        where: { id: petId },
        include: {
            spouse: {
                include: {
                    pet: true,
                    personality: { include: { trait: true } },
                    genetics: { include: { gene: true } },
                    skills: { include: { skill: true } },
                    parent1: {
                        include: {
                            genetics: { include: { gene: true } },
                            personality: { include: { trait: true } },
                        }
                    },
                    parent2: {
                        include: {
                            genetics: { include: { gene: true } },
                            personality: { include: { trait: true } },
                        }
                    },
                },
            },
            pet: true,
            personality: { include: { trait: true } },
            genetics: { include: { gene: true } },
            skills: { include: { skill: true } },
            parent1: {
                include: {
                    genetics: { include: { gene: true } },
                    personality: { include: { trait: true } },
                }
            },
            parent2: {
                include: {
                    genetics: { include: { gene: true } },
                    personality: { include: { trait: true } },
                }
            },
        },
    });

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
    if (mother.pet.animal !== father.pet.animal) {
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

    // Coletar genes e traits ancestrais (avós)
    const ancestors = [mother.parent1, mother.parent2, father.parent1, father.parent2].filter(Boolean);
    const ancestralGenes = ancestors.flatMap(a => a?.genetics.map(g => g.gene) || []);
    const ancestralTraits = ancestors.flatMap(a => a?.personality.map(p => p.trait) || []);

    await prisma.$transaction(async (tx) => {
        for (let i = 1; i <= offspringCount; i++) {
            // Dados básicos do filho
            const gender = Math.random() < 0.5 ? 'MALE' : 'FEMALE';
            const name = getRandomValue(randomNames[gender]);

            // Criar o filho
            const newOffspring = await tx.userPet.create({
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
            const offspringGenes: { geneId: number; inheritedFromParent1: boolean; inheritedFromParent2: boolean }[] = [];

            // Agrupar genes por colorPart
            const parts: { [key: string]: any[] } = {};
            catalogGenes.forEach(gene => {
                if (!parts[gene.colorPart]) parts[gene.colorPart] = [];
                parts[gene.colorPart].push(gene);
            });

            // Processar apenas EYE, COLOR1, COLOR2
            const colorParts: PetGeneticsColorPart[] = ['EYE', 'COLOR1', 'COLOR2'];

            type GeneResult = {
                winner: GeneType | 'MIXED';
                gene: "GENE1" | "GENE2" | "GENE3";
                description: string;
                probabilities?: { [key: string]: number };
            };

            const geneCalc = (gene1: GeneType, gene2: GeneType): GeneResult => {
                type Allele = 'A' | 'a';

                const getAlleles = (gene: GeneType): [Allele, Allele] => {
                    switch (gene) {
                        case 'DOMINANT': return ['A', 'A'];
                        case 'RECESSIVE': return ['a', 'a'];
                        case 'CODOMINANT': return ['A', 'a'];
                        case 'NEUTRAL': return ['A', 'a'];
                        default: return ['A', 'a'];
                    }
                };

                const crossover = (alleles1: [Allele, Allele], alleles2: [Allele, Allele]): Allele[] => {
                    const results: Allele[] = [];
                    for (const a1 of alleles1) {
                        for (const a2 of alleles2) {
                            results.push(a1 === 'A' || a2 === 'A' ? 'A' : 'a');
                        }
                    }
                    return results;
                };

                const alleles1 = getAlleles(gene1);
                const alleles2 = getAlleles(gene2);
                const offspring = crossover(alleles1, alleles2);

                const countDominant = offspring.filter(a => a === 'A').length;
                const countRecessive = offspring.filter(a => a === 'a').length;
                const total = offspring.length;

                const probDominant = (countDominant / total) * 100;
                const probRecessive = (countRecessive / total) * 100;

                let winner: GeneType | 'MIXED';
                let description: string;
                let gene: "GENE1" | "GENE2" | "GENE3";

                if (gene1 === 'CODOMINANT' && gene2 === 'CODOMINANT') {
                    winner = 'MIXED';
                    description = 'Codominância - ambos genes expressos';
                    gene = "GENE3";
                } else if (gene1 === 'CODOMINANT' || gene2 === 'CODOMINANT') {
                    winner = 'MIXED';
                    description = 'Codominância parcial - ambos genes expressos';
                    gene = "GENE3";
                } else if (gene1 === 'NEUTRAL' && gene2 === 'NEUTRAL') {
                    winner = 'NEUTRAL';
                    description = 'Ambos genes neutros';
                    gene = calculateProbability(50) ? "GENE1" : "GENE2";
                } else if (gene1 === 'NEUTRAL' || gene2 === 'NEUTRAL') {
                    const otherGene = gene1 === 'NEUTRAL' ? gene2 : gene1;
                    winner = otherGene;
                    description = `Gene ${otherGene.toLowerCase()} domina sobre neutral`;
                    gene = gene1 === 'NEUTRAL' ? "GENE2" : "GENE1";
                } else {
                    if (calculateProbability(probDominant)) {
                        winner = 'DOMINANT';
                        description = `Expressão dominante (${probDominant}% chance)`;
                        gene = "GENE1";
                    } else {
                        winner = 'RECESSIVE';
                        description = `Expressão recessiva (${probRecessive}% chance)`;
                        gene = "GENE2";
                    }
                }

                return {
                    winner,
                    gene,
                    description,
                    probabilities: {
                        'DOMINANT': Math.round(probDominant),
                        'RECESSIVE': Math.round(probRecessive)
                    }
                };
            };

            type CharacteristicAndGene = GeneResult & {
                characteristic: PetGeneticsColorPart;
                geneId: number;
                inheritedFromParent1: boolean;
                inheritedFromParent2: boolean;
                fromAncestral: boolean;
                fromSpecies: boolean;
            };

            const getGene = (parent: "father" | "mother", characteristic: PetGeneticsColorPart) => {
                const genes = parent === "father" ? father.genetics : mother.genetics;
                return genes.find(g => g.gene.colorPart === characteristic);
            };

            const getGeneIdBasedOnWinner = (characteristic: PetGeneticsColorPart, result: GeneResult): { geneId: number; inheritedFromParent1: boolean; inheritedFromParent2: boolean } => {
                const fatherGene = getGene("father", characteristic);
                const motherGene = getGene("mother", characteristic);

                if (result.winner === 'MIXED') {
                    const availableGenes = [];
                    if (fatherGene) availableGenes.push({ gene: fatherGene.gene, weight: fatherGene.gene.geneType === 'DOMINANT' ? 50 : fatherGene.gene.geneType === 'CODOMINANT' ? 30 : 25 });
                    if (motherGene) availableGenes.push({ gene: motherGene.gene, weight: motherGene.gene.geneType === 'DOMINANT' ? 50 : motherGene.gene.geneType === 'CODOMINANT' ? 30 : 25 });

                    if (availableGenes.length === 0) {
                        const randomGene = getRandomValue(parts[characteristic] || []);
                        return { geneId: randomGene.id, inheritedFromParent1: false, inheritedFromParent2: false };
                    }

                    const totalWeight = availableGenes.reduce((sum, g) => sum + g.weight, 0);
                    const random = Math.random() * totalWeight;
                    let cumulative = 0;

                    for (const g of availableGenes) {
                        cumulative += g.weight;
                        if (random <= cumulative) {
                            return {
                                geneId: g.gene.id,
                                inheritedFromParent1: !!fatherGene && g.gene.id === fatherGene.gene.id,
                                inheritedFromParent2: !!motherGene && g.gene.id === motherGene.gene.id
                            };
                        }
                    }
                }

                if (fatherGene && result.gene === "GENE1") {
                    return { geneId: fatherGene.gene.id, inheritedFromParent1: true, inheritedFromParent2: false };
                }
                if (motherGene && result.gene === "GENE2") {
                    return { geneId: motherGene.gene.id, inheritedFromParent1: false, inheritedFromParent2: true };
                }

                const randomGene = getRandomValue(parts[characteristic] || []);
                return { geneId: randomGene.id, inheritedFromParent1: false, inheritedFromParent2: false };
            };

            const processCharacteristic = (characteristic: PetGeneticsColorPart): CharacteristicAndGene => {
                const fatherGene = getGene("father", characteristic);
                const motherGene = getGene("mother", characteristic);
                const ancestralPartGenes = ancestralGenes.filter(g => g.colorPart === characteristic);

                if (ancestralPartGenes.length > 0 && calculateProbability(15)) {
                    const ancestralGene = getRandomValue(ancestralPartGenes);
                    return {
                        winner: ancestralGene.geneType,
                        gene: "GENE3",
                        description: `Gene herdado de ancestral (${ancestralGene.colorPart})`,
                        characteristic,
                        geneId: ancestralGene.id,
                        inheritedFromParent1: false,
                        inheritedFromParent2: false,
                        fromAncestral: true,
                        fromSpecies: false,
                        probabilities: { 'DOMINANT': 0, 'RECESSIVE': 0 }
                    };
                }

                // Se ambos os pais têm o gene, usar lógica de alelos
                if (fatherGene && motherGene) {
                    const geneWinner = geneCalc(fatherGene.gene.geneType, motherGene.gene.geneType);
                    const { geneId, inheritedFromParent1, inheritedFromParent2 } = getGeneIdBasedOnWinner(characteristic, geneWinner);
                    return {
                        ...geneWinner,
                        characteristic,
                        geneId,
                        inheritedFromParent1,
                        inheritedFromParent2,
                        fromAncestral: false,
                        fromSpecies: false,
                        probabilities: geneWinner.probabilities
                    };
                }

                // Se apenas um pai tem o gene, usar chance baseada em geneType
                if (fatherGene || motherGene) {
                    const gene = fatherGene || motherGene!;
                    const chance = gene.gene.geneType === 'DOMINANT' ? 75 : gene.gene.geneType === 'CODOMINANT' ? 50 : gene.gene.geneType === 'NEUTRAL' ? 50 : 25;
                    if (calculateProbability(chance)) {
                        return {
                            winner: gene.gene.geneType,
                            gene: fatherGene ? "GENE1" : "GENE2",
                            description: `Gene herdado de ${fatherGene ? 'pai' : 'mãe'} (${chance}% chance)`,
                            characteristic,
                            geneId: gene.gene.id,
                            inheritedFromParent1: !!fatherGene,
                            inheritedFromParent2: !!motherGene,
                            fromAncestral: false,
                            fromSpecies: false,
                            probabilities: { 'DOMINANT': fatherGene ? chance : 0, 'RECESSIVE': motherGene ? chance : 0 }
                        };
                    }
                }

                // Fallback para catálogo (mutação)
                const randomGene = getRandomValue(parts[characteristic] || []);
                return {
                    winner: randomGene.geneType,
                    gene: "GENE3",
                    description: `Gene aleatório do catálogo (${randomGene.colorPart})`,
                    characteristic,
                    geneId: randomGene.id,
                    inheritedFromParent1: false,
                    inheritedFromParent2: false,
                    fromAncestral: false,
                    fromSpecies: true,
                    probabilities: { 'DOMINANT': 0, 'RECESSIVE': 0 }
                };
            };

            // Processar genes e garantir unicidade
            const geneMap: { [key in PetGeneticsColorPart]?: CharacteristicAndGene } = {};
            for (const part of colorParts) {
                if (parts[part] && parts[part].length > 0) {
                    geneMap[part] = processCharacteristic(part);
                }
            }

            // Adicionar genes ao offspringGenes
            for (const part of colorParts) {
                const charResult = geneMap[part];
                if (charResult) {
                    offspringGenes.push({
                        geneId: charResult.geneId,
                        inheritedFromParent1: charResult.inheritedFromParent1,
                        inheritedFromParent2: charResult.inheritedFromParent2
                    });
                }
            }

            // Herança de Personality
            const motherTraits = mother.personality.map(p => p.trait);
            const fatherTraits = father.personality.map(p => p.trait);
            const offspringTraits: number[] = [];

            const shuffledTraits = [...allPersonalityTraits].sort(() => Math.random() - 0.5);
            shuffledTraits.forEach(trait => {
                const fatherTrait = fatherTraits.find(t => t.id === trait.id);
                const motherTrait = motherTraits.find(t => t.id === trait.id);
                const ancestralTrait = ancestralTraits.find(t => t.id === trait.id);

                if (ancestralTrait && calculateProbability(15)) {
                    offspringTraits.push(trait.id);
                    return;
                }

                const traitCalc = (trait1?: { geneType: GeneType }, trait2?: { geneType: GeneType }): boolean => {
                    if (!trait1 && !trait2) {
                        return calculateProbability(0.3);
                    }
                    if (!trait1 || !trait2) {
                        const geneType = trait1?.geneType || trait2?.geneType;
                        return calculateProbability(geneType === 'DOMINANT' ? 75 : geneType === 'CODOMINANT' ? 50 : geneType === 'NEUTRAL' ? 50 : 25);
                    }

                    const getAlleles = (gene: GeneType): [string, string] => {
                        switch (gene) {
                            case 'DOMINANT': return ['A', 'A'];
                            case 'RECESSIVE': return ['a', 'a'];
                            case 'CODOMINANT': return ['A', 'a'];
                            case 'NEUTRAL': return ['A', 'a'];
                            default: return ['A', 'a'];
                        }
                    };

                    const crossover = (alleles1: [string, string], alleles2: [string, string]): string[] => {
                        const results: string[] = [];
                        for (const a1 of alleles1) {
                            for (const a2 of alleles2) {
                                results.push(a1 === 'A' || a2 === 'A' ? 'A' : 'a');
                            }
                        }
                        return results;
                    };

                    const alleles1 = getAlleles(trait1.geneType);
                    const alleles2 = getAlleles(trait2.geneType);
                    const offspring = crossover(alleles1, alleles2);

                    const countDominant = offspring.filter(a => a === 'A').length;
                    const probDominant = (countDominant / offspring.length) * 100;

                    return calculateProbability(probDominant);
                };

                if (traitCalc(fatherTrait, motherTrait)) {
                    offspringTraits.push(trait.id);
                }
            });

            // Garantia: Pelo menos 1 personality, máximo 2
            if (offspringTraits.length === 0 && allPersonalityTraits.length > 0) {
                const randomTrait = getRandomValue(allPersonalityTraits);
                offspringTraits.push(randomTrait.id);
            }
            if (offspringTraits.length > 2) {
                offspringTraits.splice(2);
            }

            // Herança de Skills
            const motherSkills = mother.skills.map(s => ({ id: s.skill.id, level: s.level }));
            const fatherSkills = father.skills.map(s => ({ id: s.skill.id, level: s.level }));
            const offspringSkills: { skillId: number; level: number }[] = [];

            const hasMotherSkills = motherSkills.length > 0;
            const hasFatherSkills = fatherSkills.length > 0;
            const roll = Math.random();

            if (hasMotherSkills && hasFatherSkills) {
                if (roll < 0.4) { // 40% pai
                    const skill = getRandomValue(fatherSkills);
                    offspringSkills.push({ skillId: skill.id, level: 1 });
                } else if (roll < 0.8) { // 40% mãe
                    const skill = getRandomValue(motherSkills);
                    offspringSkills.push({ skillId: skill.id, level: 1 });
                } else if (roll < 0.95) { // 15% aleatória
                    if (allSkills.length > 0) {
                        const randomSkill = getRandomValue(allSkills);
                        offspringSkills.push({ skillId: randomSkill.id, level: 1 });
                    }
                }
                // 5% nenhuma
            } else if (hasMotherSkills || hasFatherSkills) {
                const parentSkills = hasFatherSkills ? fatherSkills : motherSkills;
                if (roll < 0.6) { // 60% do pai ou mãe
                    const skill = getRandomValue(parentSkills);
                    offspringSkills.push({ skillId: skill.id, level: 1 });
                } else if (roll < 0.85) { // 25% aleatória
                    if (allSkills.length > 0) {
                        const randomSkill = getRandomValue(allSkills);
                        offspringSkills.push({ skillId: randomSkill.id, level: 1 });
                    }
                }
                // 15% nenhuma
            } else {
                if (calculateProbability(20) && allSkills.length > 0) { // 20% aleatória
                    const randomSkill = getRandomValue(allSkills);
                    offspringSkills.push({ skillId: randomSkill.id, level: 1 });
                }
            }

            // Persistir genes, personalidades e skills
            await Promise.all([
                tx.petGenetics.createMany({
                    data: offspringGenes.map(g => ({
                        geneId: g.geneId,
                        inheritedFromParent1: g.inheritedFromParent1,
                        inheritedFromParent2: g.inheritedFromParent2,
                        userPetId: newOffspring.id
                    })),
                }),
                tx.userPetPersonality.createMany({
                    data: offspringTraits.map(traitId => ({ userPetId: newOffspring.id, traitId })),
                }),
                tx.userPetSkill.createMany({
                    data: offspringSkills.map(s => ({ ...s, userPetId: newOffspring.id })),
                }),
            ]);
        }

        // Finaliza gravidez e remove cônjuge
        await tx.userPet.update({
            where: { id: mother.id },
            data: { isPregnant: false, pregnantEndAt: null, spouseId: null },
        });
        await tx.userPet.update({
            where: { id: father.id },
            data: { spouseId: null },
        });
    });
}