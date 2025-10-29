import { ApiResponse } from "./apiResponse.js";
import { League } from "./leagues.js";
import { Venue } from "./venue.js";
import { Participant } from "./participants.js";

export interface Fixture {
    id: number;
    sport_id: number;
    league_id: number;
    season_id: number;
    stage_id: number;
    group_id: number | null;
    aggregate_id: number | null;
    round_id: number;
    state_id: number;
    venue_id: number | null;
    name: string;
    starting_at: string;
    result_info: string | null;
    leg: string;
    details: any | null;
    length: number;
    placeholder: boolean;
    has_odds: boolean;
    has_premium_odds: boolean;
    starting_at_timestamp: number;

    // Relacionados
    league?: League;
    season?: {
        id: number;
        name: string;
        league_id: number;
        is_current: boolean;
    };
    venue?: Venue;
    participants?: Participant[];
}

export type FixturesResponse = ApiResponse<Fixture[]>;