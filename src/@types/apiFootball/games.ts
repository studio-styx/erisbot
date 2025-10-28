// types/apiFootball/games.ts
import { ApiResponse } from "./apiResponse.js";
import { TeamInfo } from "./team.js"; // reutiliza TeamInfo

// === FIXTURE (JOGO) ===
export interface Fixture {
    fixture: {
        id: number;
        referee: string | null;
        timezone: string;
        date: string; // ISO: "2025-10-28T19:00:00+00:00"
        timestamp: number;
        periods: { first: number | null; second: number | null };
        venue: { id: number | null; name: string | null; city: string | null };
        status: {
            long: string; // "Match Finished", "First Half", etc.
            short: string; // "FT", "1H", "LIVE"
            elapsed: number | null;
        };
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        flag: string | null;
        season: number;
        round: string;
    };
    teams: {
        home: TeamInfo;
        away: TeamInfo;
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    score: {
        halftime: { home: number | null; away: number | null };
        fulltime: { home: number | null; away: number | null };
        extratime: { home: number | null; away: number | null };
        penalty: { home: number | null; away: number | null };
    };
}

// === ESTATÍSTICAS DO JOGO ===
export interface FixtureStatistics {
    team: {
        id: number;
        name: string;
        logo: string;
    };
    statistics: Array<{
        type:
        | "Shots on Goal"
        | "Shots off Goal"
        | "Total Shots"
        | "Blocked Shots"
        | "Shots insidebox"
        | "Shots outsidebox"
        | "Fouls"
        | "Corner Kicks"
        | "Offsides"
        | "Ball Possession"
        | "Yellow Cards"
        | "Red Cards"
        | "Goalkeeper Saves"
        | "Total passes"
        | "Passes accurate"
        | "Passes %";
        value: number | string | null;
    }>;
}

// === ODDS (COTAÇÕES) ===
export interface OddsBookmaker {
    id: number;
    name: string;
}

export interface OddsValue {
    value: string; // "Home", "Draw", "Away", "Over 2.5", etc
    odd: string;   // "1.95"
}

export interface OddsBet {
    id: number;
    name: string; // "Match Winner", "Goals Over/Under", etc
    values: OddsValue[];
}

export interface Odds {
    fixture: { id: number };
    update: string; // ISO
    bookmakers: Array<{
        id: number;
        name: string;
        bets: OddsBet[];
    }>;
}

// === RESPOSTAS ===
export type FixtureResponse = ApiResponse<Fixture[]>;
export type LiveFixturesResponse = ApiResponse<Fixture[]>;
export type FixtureByIdResponse = ApiResponse<Fixture[]>;
export type StatisticsResponse = ApiResponse<FixtureStatistics[]>;
export type OddsResponse = ApiResponse<Odds[]>;