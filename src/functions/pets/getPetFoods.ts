import { Animal } from "#prisma";

export interface PetFood {
    id: string;
    name: string;
    price: number;
    points: number;
}

export const petsFood: Record<Animal, PetFood[]> = {
    [Animal.CAT]: [
        { id: "cat_tuna", name: "Atum", price: 20, points: 12 },
        { id: "cat_salmon", name: "Salmão", price: 35, points: 17 },
        { id: "cat_premium", name: "Ração Premium", price: 25, points: 16 },
        { id: "cat_milk", name: "Leite", price: 15, points: 14 }
    ],
    [Animal.DOG]: [
        { id: "dog_bone", name: "Osso", price: 20, points: 14 },
        { id: "dog_meat", name: "Carne Moída", price: 30, points: 16},
        { id: "dog_food", name: "Ração Canina", price: 25, points: 15 },
        { id: "dog_biscuit", name: "Biscoito Canino", price: 15, points: 14 }
    ],
    [Animal.BIRD]: [
        { id: "bird_seeds", name: "Sementes", price: 10, points: 13 },
        { id: "bird_fruits", name: "Frutas Tropicais", price: 25, points: 17 },
        { id: "bird_nectar", name: "Néctar Doce", price: 30, points: 18 }
    ],
    [Animal.HAMSTER]: [
        { id: "hamster_sunflower", name: "Sementes de Girassol", price: 10, points: 14 },
        { id: "hamster_dried", name: "Frutas Secas", price: 15, points: 18 },
        { id: "hamster_nuts", name: "Nozes", price: 20, points: 16 }
    ],
    [Animal.RABBIT]: [
        { id: "rabbit_carrot", name: "Cenoura", price: 10, points: 14 },
        { id: "rabbit_leaves", name: "Folhas Verdes", price: 15, points: 16 },
        { id: "rabbit_food", name: "Ração de Coelho", price: 20, points: 15 },
        { id: "rabbit_apple", name: "Maçã", price: 12, points: 18 }
    ],
    [Animal.DRAGON]: [
        { id: "dragon_flame_meat", name: "Carne Flamejante", price: 100, points: 20 },
        { id: "dragon_crystal", name: "Cristal Mágico", price: 150, points: 25 },
        { id: "dragon_giant_fish", name: "Peixe Gigante", price: 80, points: 18 },
        { id: "dragon_firefruit", name: "Fruta de Fogo", price: 120, points: 22 }
    ],
    [Animal.LION]: [
        { id: "lion_raw", name: "Carne Crua", price: 50, points: 16 },
        { id: "lion_antelope", name: "Antílope Assado", price: 80, points: 19 },
        { id: "lion_ribs", name: "Costela Sangrenta", price: 70, points: 18 }
    ],
    [Animal.JAGUAR]: [
        { id: "jaguar_deer", name: "Carne de Veado", price: 55, points: 16 },
        { id: "jaguar_fresh", name: "Carne Fresca", price: 65, points: 17 },
        { id: "jaguar_bird", name: "Ave Selvagem", price: 60, points: 17 }
    ]
};
