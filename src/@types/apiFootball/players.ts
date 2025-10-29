export interface Player {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    age: number;
    birth: {
        date: string; // "1990-01-01"
        place: string | null;
        country: string | null;
    };
    nationality: string;
    height: string | null; // "185 cm"
    weight: string | null; // "78 kg"
    injured: boolean;
    photo: string;
}

export interface PlayerStatistics {
    team: {
        id: number;
        name: string;
        logo: string;
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        season: number;
    };
    games: {
        appearences: number | null;
        lineups: number | null;
        minutes: number | null;
        position: string;
    };
    goals: {
        total: number | null;
        assists: number | null;
        saves: number | null;
        conceded: number | null;
    };
    cards: {
        yellow: number | null;
        yellowred: number | null;
        red: number | null;
    };
    // ... mais stats (shots, passes, etc.)
}

export interface PlayersResponse {
    get: string;
    parameters: Record<string, any>;
    errors: any[];
    results: number;
    paging: { current: number; total: number };
    response: Array<{
        player: Player;
        statistics: PlayerStatistics[];
    }>;
}