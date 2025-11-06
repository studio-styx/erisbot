export function getRandomNumber(min: number, max: number, decimalPlaces?: number): number {
    if (min > max) {
        // Se min > max, troca os valores
        [min, max] = [max, min];
    }

    // Se min e max são iguais, retorna um valor decimal entre eles
    if (min === max) {
        const randomDecimal = Math.random() * 0.999999; // Gera um número entre 0 e 0.999999
        let result = min + randomDecimal;

        // Usa 2 casas decimais como padrão quando min = max, ou o valor especificado
        const casas = decimalPlaces !== undefined ? decimalPlaces : 2;
        result = Number(result.toFixed(casas));

        return result;
    }

    // Se decimalPlaces é especificado, retorna número decimal
    if (decimalPlaces !== undefined) {
        const random = Math.random() * (max - min) + min;
        return Number(random.toFixed(decimalPlaces));
    }

    // Caso padrão: número inteiro
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateProbability<T>(items: (T & { chance: number } )[]): T;
export function calculateProbability(chance: number): boolean;
export function calculateProbability<T>(arg: number | (T & { chance: number })[]): boolean | T {
    if (typeof arg === "number") {
        const chance = arg;
        if (chance < 0 || chance > 100) {
            throw new Error("Chance deve estar entre 0 e 100");
        }

        const randomValue = getRandomNumber(0, 99);
        return randomValue < chance;
    }

    const items = arg;
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items deve ser um array não vazio");
    }

    // Valida e soma chances
    let totalChance = 0;
    for (const it of items) {
        if (typeof it.chance !== "number" || it.chance < 0) {
            throw new Error("Cada item deve ter uma propriedade 'chance' numérica >= 0");
        }
        totalChance += it.chance;
    }

    if (totalChance <= 0) {
        throw new Error("A soma das chances deve ser maior que 0");
    }

    // Seleciona um item baseado nas chances (peso proporcional)
    const r = Math.random() * totalChance;
    let accumulated = 0;
    for (const it of items) {
        accumulated += it.chance;
        if (r < accumulated) {
            return it;
        }
    }

    // Fallback (por segurança)
    return items[items.length - 1];
}
