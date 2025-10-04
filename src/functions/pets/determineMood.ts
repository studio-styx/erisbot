import { prisma, redis } from "#database";
import { UserPet } from "#prisma";
import { convertTime } from "functions/utils/convertTime.js";

export async function determineMood(pet: UserPet) {
    const { hungry, energy, happiness } = pet;

    // Consulta efeitos temporários no Redis
    const moodEffectKey = `pet:mood_effect:${pet.id}`;
    const activeEffect = await redis.get(moodEffectKey);

    // Lógica principal de humor baseado nos atributos
    let mood = "neutral"; // padrão

    if (hungry <= 20) {
        mood = "starving";
    } else if (hungry >= 95) {
        mood = "very full";
    } else if (energy <= 15) {
        mood = "exhausted";
    } else if (happiness >= 80) {
        mood = "very happy";
    } else if (happiness <= 30) {
        mood = "sad";
    }

    // Sobrescreve com efeitos temporários se existirem
    if (activeEffect) {
        mood = activeEffect;
    }

    return mood;
}

export async function determineMoodInterval() {
    setInterval(async () => {
        const allPets = await prisma.userPet.findMany({
            where: {
                isDead: false,
                adoption: null
            }
        });

        const promises = allPets.map(pet => (async () => {
            const moodEffectKey = `pet:mood_effect:${pet.id}`;
            const hasActiveEffect = await redis.exists(moodEffectKey);

            // Só atualiza se não houver efeito temporário ativo
            if (!hasActiveEffect) {
                const currentMood = await determineMood(pet);
                await prisma.userPet.update({
                    where: { id: pet.id },
                    data: { humor: currentMood }
                });
            }
        })())

        await Promise.all(promises);
    }, convertTime({ time: "30m", to: "milliseconds" }))
}