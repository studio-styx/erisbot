export interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string | null;
    crest: string | null;
    address: string | null;
    website: string | null;
    founded: number | null;
    clubColors: string | null;
    venue: string | null;
}

export interface TeamsResponse {
    count: number;
    filters: Record<string, any>;
    teams: Team[];
}