import { prisma } from "#database";
import { calculateProbability, getRandomValue, icon, petAnimalFormatted, petRarityFormatted, petSkillNameFormatted, res, resv2 } from "#functions";
import { Gender, PersonalityTrait, Rarity } from "#prisma";
import { brBuilder, createRow, createSeparator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, time } from "discord.js";

// Dados estáticos fora da função
const rarityWeights: Record<Rarity, number> = {
    LEGENDARY: 2,
    EPIC: 12,
    RARE: 30,
    UNCOMUM: 40,
    COMUM: 60
};

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

function getRandomRarity(): Rarity {
    const weights = Object.entries(rarityWeights) as [Rarity, number][];
    const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
    const cumulativeWeights = weights.reduce((acc, [rarity, weight], i) => {
        acc.push([rarity, (acc[i - 1]?.[1] || 0) + weight]);
        return acc;
    }, [] as [Rarity, number][]);

    const random = Math.random() * totalWeight;
    for (const [rarity, cumulative] of cumulativeWeights) {
        if (random <= cumulative) return rarity;
    }
    return weights[weights.length - 1][0]; // Fallback
}

async function getRandomPet(rarity: Rarity) {
    const pets = await prisma.pet.findMany({
        where: { rarity },
        take: 1,
        orderBy: { id: 'asc' }, // Simula random com take 1
        skip: Math.floor(Math.random() * await prisma.pet.count({ where: { rarity } }))
    });
    return pets[0] || null;
}

async function createUserPet(
    userId: string,
    petId: number,
    gender: Gender,
    name: string
) {
    // Buscar catálogo de genes, skills e personalidades em uma transação
    const [geneticsCatalog, possibleSkills, possibleTraits] = await prisma.$transaction([
        prisma.genetics.findMany({ where: { petId } }),
        prisma.petSkill.findMany(),
        prisma.personalityTrait.findMany()
    ]);

    // Agrupar genes por colorPart
    const parts: { [key: string]: any[] } = {};
    geneticsCatalog.forEach(gene => {
        if (!parts[gene.colorPart]) parts[gene.colorPart] = [];
        parts[gene.colorPart].push(gene);
    });

    // Selecionar um gene por colorPart com pesos baseados em geneType
    const userPetGenetics: { geneId: number; inheritedFromParent1: boolean; inheritedFromParent2: boolean }[] = [];
    for (const part in parts) {
        const candidates = parts[part];
        if (candidates.length === 0) continue;

        // Definir pesos por geneType
        const weights = candidates.map(gene => {
            switch (gene.geneType) {
                case 'DOMINANT': return 50;
                case 'CODOMINANT': return 30;
                case 'NEUTRAL': return 15;
                case 'RECESSIVE': return 5;
                default: return 10;
            }
        });

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const random = Math.random() * totalWeight;
        let cumulative = 0;

        for (let i = 0; i < candidates.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                userPetGenetics.push({
                    geneId: candidates[i].id,
                    inheritedFromParent1: false, // Sem pais, geração inicial
                    inheritedFromParent2: false
                });
                break;
            }
        }
    }

    // Chance de 40% de começar com uma skill
    const userPetSkills = Math.random() <= 0.4 && possibleSkills.length > 0
        ? [{ skillId: getRandomValue(possibleSkills).id, level: 1 }]
        : [];

    // Escolher 1–2 personalidades sem conflitos
    const shuffledTraits = [...possibleTraits].sort(() => Math.random() - 0.5);
    const selectedTraits: PersonalityTrait[] = [];
    let remainingSlots = Math.random() < 0.3 ? 2 : 1;

    for (const trait of shuffledTraits) {
        if (remainingSlots === 0) break;

        // Verificar se a personalidade atual conflita com alguma já selecionada
        const hasConflict = selectedTraits.some(selected =>
            selected.personalityConflictNames.includes(trait.name) ||
            trait.personalityConflictNames.includes(selected.name)
        );

        if (!hasConflict) {
            selectedTraits.push(trait);
            remainingSlots--;
        }
    }

    const userPetPersonalities = selectedTraits.map(trait => ({
        traitId: trait.id
    }));

    // Criar usuário e pet em uma transação
    const [_, userPet] = await prisma.$transaction([
        prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId }
        }),
        prisma.userPet.create({
            data: {
                userId,
                petId,
                gender,
                name,
                genetics: { create: userPetGenetics },
                skills: { create: userPetSkills },
                personality: { create: userPetPersonalities }
            },
            include: {
                genetics: { include: { gene: true } },
                skills: { include: { skill: true } },
                personality: { include: { trait: true } }
            }
        })
    ]);

    return userPet;
}

async function setCooldown(userId: string) {
    const cooldownEnd = new Date(Date.now() + 1000 * 60 * 120); // 2 horas
    await prisma.cooldown.upsert({
        where: { userId_name: { userId, name: "petSpin" } },
        update: { willEndIn: cooldownEnd },
        create: { name: "petSpin", userId, willEndIn: cooldownEnd }
    });
    return cooldownEnd;
}

export async function petSpin(interaction: ChatInputCommandInteraction<"cached">) {
    const { user } = interaction;
    await interaction.deferReply();

    // Verificar cooldown
    const cooldown = await prisma.cooldown.findUnique({
        where: { userId_name: { userId: user.id, name: "petSpin" } }
    });

    if (cooldown && cooldown.willEndIn > new Date()) {
        await interaction.editReply(res.danger(
            `${icon.denied} | Você está em cooldown! Você pode girar pets novamente ${time(cooldown.willEndIn, "R")}`
        ));
        return;
    }

    // Sortear raridade e pet
    await interaction.editReply(resv2.warning(`${icon.waiting_white} | Girando roleta...`));
    const rarity = getRandomRarity();
    const pet = await getRandomPet(rarity);

    if (!pet) {
        await interaction.editReply(resv2.danger(
            `${icon.error} | Não foi possível encontrar um pet adequado! Desculpe-me, isso é um erro meu! ${icon.Eris_cry}`
        ));
        return;
    }

    // Gerar dados do pet
    const petGender = calculateProbability(50) ? "MALE" : "FEMALE" as Gender;
    const petName = getRandomValue(randomNames[petGender]);

    // Criar UserPet
    const userPet = await createUserPet(user.id, pet.id, petGender, petName);

    const petRarityLogLevel: Record<Rarity, number> = {
        LEGENDARY: 10,
        EPIC: 8,
        RARE: 6,
        UNCOMUM: 4,
        COMUM: 2
    }

    await prisma.log.create({
        data: {
            userId: user.id,
            type: "info",
            message: `Ganhou um pet ${petRarityFormatted[pet.rarity]} (${pet.animal}) ao girar a roleta de pets.`,
            tags: ["pet", "spin", "reward", `PETID_${pet.id.toString()}`, `USERPETID_${userPet.id.toString()}`, `RARITY_${pet.rarity}`],
            level: petRarityLogLevel[pet.rarity]
        }
    })

    // Aplicar cooldown
    const cooldownEnd = await setCooldown(user.id);

    // Responder com detalhes
    await interaction.editReply(resv2.success(
        `## Giro de Pet`,
        createSeparator(),
        `Você deu um giro e conseguiu um pet **${petRarityFormatted[pet.rarity].toLowerCase()}**!`,
        brBuilder(
            "### Detalhes do Pet",
            `**Nome:** ${userPet.name}`,
            `**Animal:** ${petAnimalFormatted[pet.animal]} (Espécie: **${pet.specie}**)`,
            `**Raridade:** ${petRarityFormatted[pet.rarity]}`,
            `**Gênero:** ${petGender === "MALE" ? "Macho" : "Fêmea"}`,
            `**Personalidades:** ${userPet.personality.length > 0 ? userPet.personality.map(p => p.trait.name).join(", ") : "Nenhuma"}`,
            `**Humor:** ${userPet.humor}`,
            `**Habilidades:** ${userPet.skills.length > 0 ? userPet.skills.map(skill => `**\`${petSkillNameFormatted[skill.skill.name] || skill.skill.name}\`** - Nível **${skill.level}**`).join(", ") : "Nenhuma"}`,
            `**Genética:** ${userPet.genetics.length > 0 ? userPet.genetics.map(g => `**\`${g.gene.trait}\` - \`(${g.gene.colorPart})\`** [**${g.gene.geneType}**]`).join(", ") : "Nenhuma"}`,
            `**Pais:** ${userPet.parent1Id || userPet.parent2Id ? "Tem pais" : "Nenhum (geração inicial)"}`,
            `**Está grávida?:** ${userPet.isPregnant ? "Sim" : "Não"}`
        ),
        createSeparator(),
        brBuilder(
            `Você pode renomear seu pet ou colocá-lo para adoção.`,
            `Cooldown até: ${time(cooldownEnd, "R")}`
        ),
        createRow(
            new ButtonBuilder({
                customId: `pet/spin/name/${user.id}/${userPet.id}`,
                label: "Trocar Nome",
                style: ButtonStyle.Primary
            }),
            new ButtonBuilder({
                customId: `pet/spin/del/${user.id}/${userPet.id}`,
                label: "Desfazer Pet",
                style: ButtonStyle.Danger
            })
        )
    ));
}