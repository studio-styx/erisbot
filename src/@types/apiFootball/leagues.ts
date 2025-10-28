// types/apiFootball/leagues.ts
import { ApiResponse } from "./apiResponse.js";

export interface League {
    league: {
        id: number;
        name: string;
        type: "League" | "Cup";
        logo: string;
    };
    country: {
        name: string;
        code: string | null;
        flag: string | null;
    };
    seasons: Array<{
        year: number;
        start: string; // "2025-08-09"
        end: string;   // "2026-05-17"
        current: boolean;
        coverage: {
            fixtures: {
                events: boolean;
                lineups: boolean;
                statistics_fixtures: boolean;
                statistics_players: boolean;
            };
            standings: boolean;
            players: boolean;
            top_scorers: boolean;
            top_assists: boolean;
            top_cards: boolean;
            injuries: boolean;
            predictions: boolean;
            odds: boolean;
        };
    }>;
}

export type LeaguesResponse = ApiResponse<League[]>;
export type LeagueByIdResponse = ApiResponse<League[]>;