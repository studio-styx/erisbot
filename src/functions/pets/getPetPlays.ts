import { Animal } from "#prisma";

export interface PetPlay {
    id: string;
    name: string;
    fun: number;    // quanto diverte
    energy: number; // quanto cansa
}

export const petPlays: Record<Animal, PetPlay[]> = {
    [Animal.CAT]: [
        { id: "cat_yarn", name: "Caçar bolinha de lã", fun: 4, energy: 3 },
        { id: "cat_scratcher", name: "Brincar com arranhador", fun: 3, energy: 2 },
        { id: "cat_laser", name: "Perseguir luzinha", fun: 5, energy: 4 }
    ],
    [Animal.DOG]: [
        { id: "dog_fetch", name: "Buscar a bolinha", fun: 5, energy: 4 },
        { id: "dog_walk", name: "Passear na rua", fun: 6, energy: 5 },
        { id: "dog_run", name: "Correr no parque", fun: 7, energy: 6 }
    ],
    [Animal.BIRD]: [
        { id: "bird_sing", name: "Cantar músicas", fun: 3, energy: 2 },
        { id: "bird_fly", name: "Voar pela sala", fun: 5, energy: 4 },
        { id: "bird_mirror", name: "Brincar com espelho", fun: 4, energy: 2 }
    ],
    [Animal.HAMSTER]: [
        { id: "hamster_wheel", name: "Correr na roda", fun: 4, energy: 3 },
        { id: "hamster_tunnel", name: "Explorar o túnel", fun: 3, energy: 2 },
        { id: "hamster_ball", name: "Rolar na bolinha", fun: 5, energy: 4 }
    ],
    [Animal.RABBIT]: [
        { id: "rabbit_jump", name: "Pular pelo jardim", fun: 5, energy: 4 },
        { id: "rabbit_chew", name: "Roer brinquedos", fun: 3, energy: 2 },
        { id: "rabbit_hide", name: "Brincar de esconde-esconde", fun: 4, energy: 3 }
    ],
    [Animal.DRAGON]: [
        { id: "dragon_fire", name: "Soltar fogo no ar", fun: 8, energy: 6 },
        { id: "dragon_fly", name: "Voar sobre montanhas", fun: 10, energy: 8 },
        { id: "dragon_hunt", name: "Caçar cavaleiros", fun: 9, energy: 7 }
    ],
    [Animal.LION]: [
        { id: "lion_roar", name: "Treinar rugido", fun: 5, energy: 3 },
        { id: "lion_hunt", name: "Caçar na savana", fun: 9, energy: 8 },
        { id: "lion_pride", name: "Brincar com a manada", fun: 6, energy: 4 }
    ],
    [Animal.JAGUAR]: [
        { id: "jaguar_climb", name: "Escalar árvores", fun: 7, energy: 6 },
        { id: "jaguar_hunt", name: "Caçar silenciosamente", fun: 8, energy: 7 },
        { id: "jaguar_swim", name: "Nadar no rio", fun: 6, energy: 5 }
    ],
    [Animal.BAT]: [
        { id: "bat_fly_night", name: "Voar sob a lua", fun: 6, energy: 4 },
        { id: "bat_hang", name: "Pendurar-se de cabeça pra baixo", fun: 4, energy: 2 },
        { id: "bat_screech", name: "Gritar no escuro", fun: 5, energy: 3 }
    ],
    [Animal.RAVEN]: [
        { id: "raven_steal", name: "Roubar brilhantes", fun: 6, energy: 3 },
        { id: "raven_talk", name: "Imitar vozes", fun: 5, energy: 2 },
        { id: "raven_fly_night", name: "Voar sobre cemitérios", fun: 7, energy: 4 }
    ],
    [Animal.SPIDER]: [
        { id: "spider_web", name: "Tecendo teia", fun: 4, energy: 3 },
        { id: "spider_climb", name: "Escalar paredes", fun: 5, energy: 4 },
        { id: "spider_hide", name: "Esconder-se nas sombras", fun: 3, energy: 2 }
    ],
    [Animal.WOLF]: [
        { id: "wolf_howl", name: "Uivar para a lua", fun: 8, energy: 5 },
        { id: "wolf_run_pack", name: "Correr com a alcateia", fun: 7, energy: 6 },
        { id: "wolf_hunt", name: "Caçar à noite", fun: 9, energy: 7 }
    ],
    [Animal.BLACK_CAT]: [
        { id: "blackcat_shadow", name: "Perseguir sombras", fun: 5, energy: 3 },
        { id: "blackcat_broom", name: "Passear na vassoura", fun: 7, energy: 4 },
        { id: "blackcat_potion", name: "Misturar poções", fun: 6, energy: 5 }
    ],
    [Animal.GHOST_DOG]: [
        { id: "ghostdog_haunt", name: "Assombrar corredores", fun: 7, energy: 4 },
        { id: "ghostdog_glow", name: "Brincar com luzes", fun: 5, energy: 3 },
        { id: "ghostdog_fly", name: "Flutuar pelo cemitério", fun: 8, energy: 5 }
    ],
    [Animal.ZOMBIE_RABBIT]: [
        { id: "zombierabbit_dig", name: "Sair da cova", fun: 6, energy: 4 },
        { id: "zombierabbit_stumble", name: "Cambalear por aí", fun: 4, energy: 2 },
        { id: "zombierabbit_scary", name: "Assustar visitantes", fun: 7, energy: 5 }
    ],
    [Animal.SKELETON_HORSE]: [
        { id: "skeletonhorse_gallop", name: "Galopar sob trovões", fun: 8, energy: 6 },
        { id: "skeletonhorse_rattle", name: "Chacoalhar ossos", fun: 5, energy: 3 },
        { id: "skeletonhorse_ride", name: "Levar almas em passeio", fun: 9, energy: 7 }
    ],
    [Animal.PUMPKIN_GOLEM]: [
        { id: "pumpkingolem_light", name: "Acender a cabeça", fun: 6, energy: 3 },
        { id: "pumpkingolem_guard", name: "Proteger o portão", fun: 5, energy: 4 },
        { id: "pumpkingolem_smile", name: "Fazer caretas assustadoras", fun: 7, energy: 5 }
    ]
};
