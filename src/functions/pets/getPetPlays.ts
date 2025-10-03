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
    ]
};
