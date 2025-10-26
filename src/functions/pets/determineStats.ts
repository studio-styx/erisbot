import { prisma } from "#database";
import { brBuilder } from "@magicyan/discord";
import { petAnimalFormatted } from "./formatteds.js";
import { Client } from "discord.js";
import { menus } from "#menus";

// Definir multiplicadores por humor (maior impacto)
const multiplyerByHumor: Record<string, { hungry: number; energy: number; happiness: number }> = {
    normal: { hungry: -5, energy: -5, happiness: 0 },
    happy: { hungry: -3, energy: -3, happiness: 5 },
    sad: { hungry: -8, energy: -8, happiness: -10 },
    angry: { hungry: -7, energy: -10, happiness: -5 },
    tired: { hungry: -6, energy: -15, happiness: -3 },
    excited: { hungry: -10, energy: -8, happiness: 10 },
    sick: { hungry: -12, energy: -12, happiness: -15 }
};

// Definir multiplicadores por personalidade (menor impacto)
const multiplyerByPersonality: Record<string, { hungry: number; energy: number; happiness: number }> = {
    calm: { hungry: -2, energy: -2, happiness: 2 },
    playful: { hungry: -4, energy: -4, happiness: 4 },
    curious: { hungry: -3, energy: -5, happiness: 3 },
    shy: { hungry: -2, energy: -3, happiness: -2 },
    brave: { hungry: -3, energy: -3, happiness: 3 },
    loyal: { hungry: -2, energy: -2, happiness: 2 },
    aggressive: { hungry: -5, energy: -4, happiness: -4 },
    lazy: { hungry: -1, energy: -6, happiness: -1 },
    friendly: { hungry: -2, energy: -2, happiness: 5 },
    stubborn: { hungry: -3, energy: -3, happiness: -3 },
    gentle: { hungry: -1, energy: -1, happiness: 3 },
    energetic: { hungry: -5, energy: -5, happiness: 4 },
    protective: { hungry: -3, energy: -3, happiness: 2 },
    independent: { hungry: -2, energy: -2, happiness: 1 },
    clingy: { hungry: -3, energy: -2, happiness: -2 },
    timid: { hungry: -2, energy: -3, happiness: -3 },
    mischievous: { hungry: -4, energy: -4, happiness: 2 },
    patient: { hungry: -1, energy: -1, happiness: 2 },
    dominant: { hungry: -3, energy: -3, happiness: -2 },
    submissive: { hungry: -2, energy: -2, happiness: -2 }
};

export async function setAllPetsStats(client: Client) {
    const allDbPets = await prisma.userPet.findMany({
        where: {
            isDead: false,
            adoption: null,
        },
        include: {
            personality: { include: { trait: true } },
            pet: true
        },
    });

    const allPets = allDbPets.filter(pet => !pet.flags.includes("IMMORTAL"));

    const currentDate = new Date();

    const promises = allPets.map(pet => (async () => {
        // Obter o humor do pet
        const humor = pet.humor || "normal";

        // Obter os multiplicadores do humor
        const humorMultipliers = multiplyerByHumor[humor] || multiplyerByHumor.normal;

        // Obter as personalidades do pet
        const personalities = pet.personality.map(p => p.trait.name);

        // Somar os multiplicadores das personalidades (se houver)
        const personalityMultipliers = personalities.reduce(
            (acc, personality) => {
                const multipliers = multiplyerByPersonality[personality] || { hungry: 0, energy: 0, happiness: 0 };
                return {
                    hungry: acc.hungry + multipliers.hungry,
                    energy: acc.energy + multipliers.energy,
                    happiness: acc.happiness + multipliers.happiness,
                };
            },
            { hungry: 0, energy: 0, happiness: 0 }
        );

        // Combinar multiplicadores (humor tem peso maior, personalidade tem peso menor)
        const combinedMultipliers = {
            hungry: humorMultipliers.hungry + personalityMultipliers.hungry * 0.5, // Personalidade tem 50% do peso
            energy: humorMultipliers.energy + personalityMultipliers.energy * 0.5,
            happiness: humorMultipliers.happiness + personalityMultipliers.happiness * 0.5,
        };

        // Calcular dias de vida
        const createdAt = new Date(pet.createdAt);
        const daysLived = Math.floor((currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        // Calcular a redução de vida (2 pontos por dia vivido)
        const lifeReduction = daysLived * 2;
        const newLife = Math.max(0, 100 - lifeReduction); // Vida inicial é 100

        // Calcular novos valores para hungry, energy e happiness
        const newHungry = Math.max(0, Math.min(100, pet.hungry + combinedMultipliers.hungry));
        const newEnergy = Math.max(0, Math.min(100, pet.energy + combinedMultipliers.energy));
        const newHappiness = Math.max(0, Math.min(100, pet.happiness + combinedMultipliers.happiness));

        // Verificar se o pet morreu
        const isDead = newLife <= 0 || newHungry <= 0;

        // Atualizar o pet
        const { user } = await prisma.userPet.update({
            where: { id: pet.id },
            data: {
                hungry: newHungry,
                energy: newEnergy,
                happiness: newHappiness,
                life: newLife,
                isDead: isDead,
                updatedAt: currentDate,
            },
            include: {
                user: true
            }
        });

        if (isDead) {
            await prisma.$transaction([
                prisma.mails.create({
                    data: {
                        userId: pet.userId,
                        content: brBuilder(
                            `${pet.gender === "FEMALE" ? "Sua pet" : "Seu pet"} **${pet.name}** (${petAnimalFormatted[pet.pet.animal]}) morreu de **${newLife <= 0 ? `velhice` : newHungry <= 0 ? "fome" : "desconhecido"}**!`
                        ),
                        whoSendId: "1171963692984844401"
                    }
                }),
                prisma.user.update({
                    where: { id: pet.userId },
                    data: {
                        activePetId: { set: null }
                    }
                })
            ])
            if (user.dmNotification) {
                const allMails = await prisma.mails.findMany({
                    where: {
                        userId: pet.userId,
                        asRead: false
                    }
                });
                if (allMails.length === 0) return;
                try {
                    const discordUser = await client.users.fetch(pet.userId);
                    await discordUser.createDM();
                    await discordUser.send(menus.mails.userMails(allMails, user, 0))
                } catch (_) {}
            }
        }
    })());

    // Executar todas as atualizações em paralelo
    await Promise.all(promises);
}