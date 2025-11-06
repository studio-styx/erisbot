const production = !(process.env.ENV === "true");

export function getBrazilTime(): Date {
    const now = new Date();
    if (!production) return now;

    // Host em UTC → subtrai 3h para ter horário de Brasília
    return new Date(now.getTime() - 3 * 60 * 60 * 1000);
}

export function transformDateToBrazilTime(date: Date): Date {
    if (!production) return date;
    // Interpreta como se fosse em Brasília → ajusta para UTC
    return new Date(date.getTime() + 3 * 60 * 60 * 1000);
}