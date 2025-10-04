type TimeUnit = 'h' | 'm' | 's' | 'd';
type OutputUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days';

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

interface ConvertTimeParams<T extends string> {
    time: ValidTimeString<T>;
    to: OutputUnit;
}

// Constantes de conversão
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

export function convertTime<T extends string>({
    time,
    to
}: ConvertTimeParams<T>): number {
    const parsedTime = parseTimeString(time);

    // Converter tudo para milissegundos primeiro
    const totalMilliseconds = calculateTotalMilliseconds(parsedTime);

    // Converter para a unidade desejada
    return convertMillisecondsToUnit(totalMilliseconds, to);
}

function parseTimeString(timeString: string): ParsedTime {
    const result: ParsedTime = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        days: 0
    };

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

    if (result.hours === 0 && result.minutes === 0 && result.seconds === 0 && result.days === 0) {
        throw new Error('Formato de tempo inválido. Use formato como "3h15m", "2d", "30m", etc.');
    }

    return result;
}

function calculateTotalMilliseconds(parsedTime: ParsedTime): number {
    const { days, hours, minutes, seconds } = parsedTime;

    const totalMilliseconds =
        days * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND +
        hours * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND +
        minutes * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND +
        seconds * MILLISECONDS_IN_SECOND;

    return totalMilliseconds;
}

function convertMillisecondsToUnit(milliseconds: number, to: OutputUnit): number {
    switch (to) {
        case 'milliseconds':
            return milliseconds;

        case 'seconds':
            return milliseconds / MILLISECONDS_IN_SECOND;

        case 'minutes':
            return milliseconds / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE);

        case 'hours':
            return milliseconds / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR);

        case 'days':
            return milliseconds / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY);

        default:
            throw new Error(`Unidade de saída não suportada: ${to}`);
    }
}