type OperationType = 'increment' | 'decrement';

interface CalculateDateParams {
    typeCalc: OperationType;
    time: string;
    baseDate?: Date;
}

type TimeUnit = 'h' | 'm' | 's' | 'd';

interface ParsedTime {
    hours: number;
    minutes: number;
    seconds: number;
    days: number;
}

// Tipo para validar a string de tempo
type ValidTimeString<T extends string> =
    T extends `${infer _}${TimeUnit}`
    ? T
    : never;

export function calculateDate<T extends string>({
    typeCalc,
    time,
    baseDate = new Date()
}: CalculateDateParams & { time: ValidTimeString<T> }): Date {
    const parsedTime = parseTimeString(time);
    const resultDate = new Date(baseDate);

    const multiplier = typeCalc === 'increment' ? 1 : -1;

    resultDate.setDate(resultDate.getDate() + (parsedTime.days * multiplier));
    resultDate.setHours(resultDate.getHours() + (parsedTime.hours * multiplier));
    resultDate.setMinutes(resultDate.getMinutes() + (parsedTime.minutes * multiplier));
    resultDate.setSeconds(resultDate.getSeconds() + (parsedTime.seconds * multiplier));

    return resultDate;
}

function parseTimeString(timeString: string): ParsedTime {
    const result: ParsedTime = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        days: 0
    };

    // Regex para capturar números seguidos de letras (h, m, s, d)
    const regex = /(\d+)([hmds])/g;
    let match;

    while ((match = regex.exec(timeString)) !== null) {
        const value = parseInt(match[1], 10);
        const unit = match[2] as TimeUnit;

        switch (unit) {
            case 'h':
                result.hours = value;
                break;
            case 'm':
                result.minutes = value;
                break;
            case 's':
                result.seconds = value;
                break;
            case 'd':
                result.days = value;
                break;
        }
    }

    // Validação: pelo menos uma unidade deve ser especificada
    if (result.hours === 0 && result.minutes === 0 && result.seconds === 0 && result.days === 0) {
        throw new Error('Formato de tempo inválido. Use formato como "3h15m", "2d", "30m", etc.');
    }

    return result;
}