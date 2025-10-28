export interface Area {
    id: number;
    name: string;
    code: string;
    flag: string | null;
}

export interface Competition {
    id: number;
    name: string;
    code: string;
    type: "LEAGUE" | "CUP";
    emblem: string | null;
    area: Area;
    currentSeason?: {
        id: number;
        startDate: string;
        endDate: string;
        currentMatchday: number | null;
    };
}

export interface CompetitionsResponse {
    count: number;
    filters: Record<string, any>;
    competitions: Competition[];
}