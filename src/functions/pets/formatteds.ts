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
    LION: "Leão",

    // 🎃 Halloween
    BAT: "Morcego",
    RAVEN: "Corvo",
    SPIDER: "Aranha",
    WOLF: "Lobo",
    BLACK_CAT: "Gato Preto",
    GHOST_DOG: "Cachorro Fantasma",
    ZOMBIE_RABBIT: "Coelho Zumbi",
    SKELETON_HORSE: "Cavalo Esqueleto",
    PUMPKIN_GOLEM: "Golem de Abóbora"
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

export const petPowerFormatted: Record<string, string> = {
  Fireball: "Bola de Fogo",
  WaterJet: "Jato d'Água",
  Thunderbolt: "Raio",
  EarthSlam: "Impacto Terrestre",
  PsychicBlast: "Explosão Psíquica",
  MetalSlash: "Corte Metálico",
  GhostStrike: "Golpe Fantasma",
  PoisonSpit: "Cuspe Venenoso",
  HealingLight: "Luz Curativa",
  NaturesTouch: "Toque da Natureza",
  SpiritMend: "Cura Espiritual",
  FlameAura: "Aura de Chamas",
  WindBoost: "Impulso de Vento",
  PsychicShield: "Escudo Psíquico",
  Frostbite: "Congelamento",
  DarkVeil: "Véu Sombrio",
  PoisonCloud: "Nuvem Venenosa",
  Regeneration: "Regeneração"
};
