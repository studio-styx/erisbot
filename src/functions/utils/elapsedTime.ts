export function formatElapsedTime(startDate: Date, endTime?: Date): string {
    const now = endTime || new Date();
    const diffMs = now.getTime() - startDate.getTime();

    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hora" : "horas"}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
    }
    if (seconds > 0 || (hours === 0 && minutes === 0)) {
        parts.push(`${seconds} ${seconds === 1 ? "segundo" : "segundos"}`);
    }

    if (parts.length === 0) {
        return "0 segundos";
    }

    if (parts.length === 1) {
        return parts[0];
    }

    if (parts.length === 2) {
        return `${parts[0]} e ${parts[1]}`;
    }

    return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}