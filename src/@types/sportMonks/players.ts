import { ApiResponse } from "./apiResponse.js";

export interface Player {
    id: number;
    player_id: number;
    team_id: number;
    country_id: number;
    position_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    nationality: string;
    birth_date: string;
    birth_country: string;
    birth_place: string | null;
    age: number;
    height: string | null; // "185 cm"
    weight: string | null; // "78 kg"
    image: string | null;
    active: boolean;
    injured: boolean;
    position: {
        id: number;
        name: string; // "Goalkeeper", "Midfielder"
    };
}

export type PlayersResponse = ApiResponse<Player[]>;