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

export const petSkillNameFormatted: Record<string, string> = {
    "daily_bonus": "Bônus no Prêmio Diário",
    "daily_cooldown_reduction": "Redução de Cooldown do Prêmio Diário",
    "work_bonus": "Bônus no Salário de Trabalho",
    "work_xp_bonus": "Bônus no XP do Trabalho",
    "job_interview_easier": "Entrevista de emprego facilitada",
    "work_challenge_avoid": "Elimina os desafios de emprego",
    "work_challenge_easier": "Dificuldade do Desafio de trabalho diminuída",
    "slots_luck": "Mais Sorte no Jogo de Maquina",
    "coinflip_luck": "Mais Sorte no Jogo de Moeda",
    "coinflip_bonus": "Bônus no Jogo da Moeda",
    "horse_racing_luck": "Mais Chances de Ganhar a Corrida de Cavalos",
    "horse_racing_bonus": "Bônus de Aposta na Corrida de Cavalos"
}