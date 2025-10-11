export function getRandomValue<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}