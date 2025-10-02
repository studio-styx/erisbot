import { Animal } from "#prisma";

export interface PetFood {
    name: string;
    price: number;
    points: number;
}

export const petsFood: Record<Animal, PetFood[]> = {
    [Animal.CAT]: [
        { name: "Atum", price: 20, points: 3 },
        { name: "Salmão", price: 35, points: 5 },
        { name: "Ração Premium", price: 25, points: 4 },
        { name: "Leite", price: 15, points: 2 }
    ],
    [Animal.DOG]: [
        { name: "Osso", price: 20, points: 3 },
        { name: "Carne Moída", price: 30, points: 4 },
        { name: "Ração Canina", price: 25, points: 3 },
        { name: "Biscoito Canino", price: 15, points: 2 }
    ],
    [Animal.BIRD]: [
        { name: "Sementes", price: 10, points: 2 },
        { name: "Frutas Tropicais", price: 25, points: 4 },
        { name: "Néctar Doce", price: 30, points: 5 }
    ],
    [Animal.HAMSTER]: [
        { name: "Sementes de Girassol", price: 10, points: 2 },
        { name: "Frutas Secas", price: 15, points: 3 },
        { name: "Nozes", price: 20, points: 4 }
    ],
    [Animal.RABBIT]: [
        { name: "Cenoura", price: 10, points: 2 },
        { name: "Folhas Verdes", price: 15, points: 3 },
        { name: "Ração de Coelho", price: 20, points: 4 },
        { name: "Maçã", price: 12, points: 2 }
    ],
    [Animal.DRAGON]: [
        { name: "Carne Flamejante", price: 100, points: 10 },
        { name: "Cristal Mágico", price: 150, points: 15 },
        { name: "Peixe Gigante", price: 80, points: 8 },
        { name: "Fruta de Fogo", price: 120, points: 12 }
    ],
    [Animal.LION]: [
        { name: "Carne Crua", price: 50, points: 6 },
        { name: "Antílope Assado", price: 80, points: 9 },
        { name: "Costela Sangrenta", price: 70, points: 8 }
    ],
    [Animal.JAGUAR]: [
        { name: "Carne de Veado", price: 55, points: 6 },
        { name: "Carne Fresca", price: 65, points: 7 },
        { name: "Ave Selvagem", price: 60, points: 7 }
    ]
};
