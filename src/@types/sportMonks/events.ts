import { ApiResponse } from "./apiResponse.js";
import { Player } from "./players.js";
import { Team } from "./teams.js";

export interface Event {
    id: number;
    fixture_id: number;
    minute: number;
    extra_minute: number | null;
    type: string; // "Goal", "Yellow Card", "Red Card", "Substitution"
    team_id: number;
    player_id: number | null;
    assist_id: number | null;
    team: Team;
    player: Player | null;
    assist: Player | null;
    related: any | null; // Para substiuições
    description: string | null;
}

export type EventsResponse = ApiResponse<Event[]>;