import { ApiResponse } from "./apiResponse.js";

export interface Team {
    id: number;
    name: string;
    short_name: string | null;
    symbol: string | null;
    country_id: number;
    country: {
        id: number;
        name: string;
        iso_code: string;
    };
    founded: number | null;
    address: string | null;
    phone_number: string | null;
    website: string | null;
    email: string | null;
    venue_id: number | null;
    venue: {
        id: number;
        name: string;
        address: string | null;
        city: string | null;
        capacity: number | null;
        surface: string | null;
        image: string | null;
    } | null;
    players: any[]; // Array de players
}

export type TeamsResponse = ApiResponse<Team[]>;