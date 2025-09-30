import { prisma } from "#database";
import { getRandomValue, icon, res, resv2 } from "#functions";
import { Animal, Gender, Rarity } from "#prisma";
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

const petRarityFormatted: Record<Rarity, string> = {
    COMUM: "Comum",
    UNCOMUM: "Incomum",
    RARE: "Raro",
    EPIC: "Épico",
    LEGENDARY: "Lendário"
};

const petAnimalFormatted: Record<Animal, string> = {
    CAT: "Gato",
    DOG: "Cachorro",
    RABBIT: "Coelho",
    BIRD: "Pássaro",
    DRAGON: "Dragão",
    HAMSTER: "Hamster",
    JAGUAR: "Onça",
    LION: "Leão"
};

function getRandomRarity(): Rarity {
    const weights = Object.entries(rarityWeights) as [Rarity, number][];
    const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
    const cumulativeWeights = weights.reduce((acc, [rarity, weight], i) => {
        acc.push([rarity, (acc[i-1]?.[1] || 0) + weight]);
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
    const geneticsCatalog = await prisma.genetics.findMany({ where: { petId } });
    const possibleSkills = await prisma.petSkill.findMany();
    
    const userPetGenetics = geneticsCatalog.map(gene => ({
        geneId: gene.id,
        inheritedFromParent1: false,
        inheritedFromParent2: false
    }));

    const userPetSkills = Math.random() <= 0.4 && possibleSkills.length > 0
        ? [{ skillId: getRandomValue(possibleSkills).id, level: 1 }]
        : [];

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
                skills: { create: userPetSkills }
            },
            include: {
                genetics: true,
                skills: { include: { skill: true } }
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
            `${icon.denied} | Você está em cooldown! Você pode girar pets em ${time(cooldown.willEndIn, "R")}`
        ));
        return;
    }

    // Sortear raridade e pet
    const rarity = getRandomRarity();
    const pet = await getRandomPet(rarity);

    if (!pet) {
        await interaction.editReply(res.danger(
            `${icon.error} | Não foi possível encontrar um pet adequado! Desculpe-me, isso é um erro meu! ${icon.Eris_cry}`
        ));
        return;
    }

    // Gerar dados do pet
    const petGender = getRandomValue(["MALE", "FEMALE"]) as Gender;
    const petName = getRandomValue(randomNames[petGender]);

    // Criar UserPet
    const userPet = await createUserPet(user.id, pet.id, petGender, petName);

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
            `**Habilidades:** ${userPet.skills.length > 0 ? userPet.skills.map(skill => `${skill.skill.name} - Nível ${skill.level}`).join(", ") : "Nenhuma"}`,
            `**Gênero:** ${petGender === "MALE" ? "Macho" : "Fêmea"}`
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