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

export function calculateProbability(chance: number): boolean {
    if (chance < 0 || chance > 100) {
        throw new Error("Chance deve estar entre 0 e 100");
    }

    const randomValue = getRandomNumber(0, 99);
    return randomValue < chance;
}
