import { Animal, Rarity } from "#prisma";

export const petRarityFormatted: Record<Rarity, string> = {
    COMUM: "Comum",
    UNCOMUM: "Incomum",
    RARE: "Raro",
    EPIC: "Épico",
    LEGENDARY: "Lendário"
};

export const petAnimalFormatted: Record<Animal, string> = {
    CAT: "Gato",
    DOG: "Cachorro",
    RABBIT: "Coelho",
    BIRD: "Pássaro",
    DRAGON: "Dragão",
    HAMSTER: "Hamster",
    JAGUAR: "Onça",
    LION: "Leão"
};