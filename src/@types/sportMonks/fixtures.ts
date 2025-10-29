import { ApiResponse } from "./apiResponse.js";
import { Team } from "./teams.js";
import { League } from "./leagues.js";

export interface Fixture {
    id: number;
    sport_id: number;
    league_id: number;
    season_id: number;
    date: string; // ISO: "2025-10-28T19:00:00+00:00"
    minute: number | null;
    status: string; // "LIVE", "FINISHED", "NS" (Not Started)
    referee_id: number | null;
    venue_id: number | null;
    aggregate: number | null;
    attendance: number | null;
    league: League;
    season: {
        id: number;
        name: string;
        league_id: number;
    };
    home_team: Team;
    away_team: Team;
    formation: {
        home: string | null;
        away: string | null;
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    scores: {
        halftime: { home: number | null; away: number | null };
        regular: { home: number | null; away: number | null };
        overtime: { home: number | null; away: number | null };
        penalties: { home: number | null; away: number | null };
    };
    lineups: any[]; // Array de players
    events: any[]; // Array de events
}

export type FixturesResponse = ApiResponse<Fixture[]>;