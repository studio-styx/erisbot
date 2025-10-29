import { ApiResponse } from "./apiResponse.js";

export interface Event {
    id: number;
    fixture_id: number;
    minute: number;
    extra_minute: number | null;
    type: string;
    team_id: number;
    player_id: number | null;
    assist_id: number | null;
    description: string | null;
}

export type EventsResponse = ApiResponse<Event[]>;