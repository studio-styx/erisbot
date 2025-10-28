// types/apiFootball/team.ts
import { ApiResponse } from "./apiResponse.js";

// Reutilizado em Fixture
export interface TeamInfo {
    id: number;
    name: string;
    logo: string;
    winner: boolean | null;
}

// Detalhes completos do time
export interface Team {
    team: {
        id: number;
        name: string;
        code: string | null;
        country: string;
        founded: number;
        national: boolean;
        logo: string;
    };
    venue: {
        id: number | null;
        name: string | null;
        address: string | null;
        city: string | null;
        capacity: number | null;
        surface: string | null;
        image: string | null;
    };
}

export type TeamsResponse = ApiResponse<Team[]>;
export type TeamByIdResponse = ApiResponse<Team[]>;