import { Competition } from "./competitions.js";
import { Team } from "./teams.js";

export interface Score {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    duration: "REGULAR" | "EXTRA_TIME" | "PENALTIES";
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
    extraTime: { home: number | null; away: number | null };
    penalties: { home: number | null; away: number | null };
}

export interface Match {
    id: number;
    competition: Competition;
    season: {
        id: number;
        startDate: string;
        endDate: string;
        currentMatchday: number | null;
    };
    utcDate: string; // ISO: "2025-10-28T19:00:00Z"
    status: "SCHEDULED" | "LIVE" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "SUSPENDED" | "CANCELLED";
    minute: number | null;
    injuryTime: number | null;
    matchday: number | null;
    stage: string;
    group: string | null;
    lastUpdated: string;
    homeTeam: Team;
    awayTeam: Team;
    score: Score;
    referees?: Array<{ id: number; name: string; role: string; nationality: string | null }>;
}

export interface MatchesResponse {
    count: number;
    filters: {
        dateFrom?: string;
        dateTo?: string;
        status?: string[];
        permission?: string;
    };
    matches: Match[];
    competition?: Competition;
}