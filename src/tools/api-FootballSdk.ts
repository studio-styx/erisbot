import { env } from "#settings";
import { EventsResponse } from "#types/sportMonks/events.js";
import { LeaguesResponse } from "#types/sportMonks/leagues.js";
import { PlayersResponse } from "#types/sportMonks/players.js";
import { TeamsResponse } from "#types/sportMonks/teams.js";
import { FixturesResponse } from "#types/sportMonks/fixtures.js";
import { OddsResponse } from "#types/sportMonks/odds.js";
import axios from "axios";

export class FootballSdk {
    private readonly token: string;
    private readonly baseUrl = "https://api.sportmonks.com/v3/football";

    constructor() {
        this.token = env.SPORTMONKS_API_KEY;
        if (!this.token) {
            throw new Error("SPORTMONKS_API_KEY não encontrada no .env");
        }
    }

    public sportmonks = {
        fixtures: {
            byDateRange: async (from: Date, to: Date): Promise<FixturesResponse> => {
                const endpoint = `/fixtures/between/${this.fmt(from)}/${this.fmt(to)}`;
                return this.get(endpoint, {
                    include: "league.country;season;venue;participants", // ← AQUI
                    per_page: 50,
                });
            },

            byDate: async (date: Date): Promise<FixturesResponse> => {
                const endpoint = `/fixtures/dates/${this.fmt(date)}`;
                return this.get(endpoint, {
                    include: "league.country;season;venue;participants",
                    per_page: 50,
                });
            },

            live: async (): Promise<FixturesResponse> =>
                this.get("/fixtures/live", {
                    include: "league.country;season;venue;participants",
                }),

            byId: async (id: number): Promise<FixturesResponse> =>
                this.get(`/fixtures/${id}`, {
                    include: "league.country;season;venue;events;lineups;odds;participants",
                }),
        },

        leagues: {
            list: async (): Promise<LeaguesResponse> =>
                this.get("/leagues", { include: "country,seasons" }),
            byId: async (id: number): Promise<LeaguesResponse> =>
                this.get(`/leagues/${id}`, { include: "country,seasons" }),
        },

        teams: {
            byId: async (id: number): Promise<TeamsResponse> =>
                this.get(`/teams/${id}`, { include: "venue,players" }),
            byLeagueAndSeason: async (
                leagueId: number,
                seasonId: number
            ): Promise<TeamsResponse> =>
                this.get("/teams", {
                    league_id: leagueId,
                    season_id: seasonId,
                    include: "venue",
                }),
        },

        players: {
            byTeam: async (teamId: number): Promise<PlayersResponse> =>
                this.get(`/teams/${teamId}/squad`),
        },

        odds: {
            byFixture: async (fixtureId: number): Promise<OddsResponse> =>
                this.get(`/odds/pre-match/fixtures/${fixtureId}`),
        },

        events: {
            byFixture: async (fixtureId: number): Promise<EventsResponse> =>
                this.get(`/fixtures/${fixtureId}/events`),
        },
    };

    private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const fullParams = {
            ...params,
            api_token: this.token,
            tz: "America/Sao_Paulo",
        };

        const response = await axios.get<T>(url, {
            params: fullParams,
            timeout: 10_000,
        });

        return response.data;
    }

    private fmt(d: Date): string {
        return d.toISOString().split("T")[0];
    }
}