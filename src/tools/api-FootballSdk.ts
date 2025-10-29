import { env } from "#settings";
import { EventsResponse } from "#types/sportMonks/events.js";
import { LeaguesResponse } from "#types/sportMonks/leagues.js";
import { PlayersResponse } from "#types/sportMonks/players.js";
import { TeamsResponse } from "#types/sportMonks/teams.js";
import { FixturesResponse } from "#types/sportMonks/fixtures.js";
import axios from "axios";
import { OddsResponse } from "#types/sportMonks/odds.js";

export class FootballSdk {
    private readonly token: string;
    private readonly baseUrl = "https://api.sportmonks.com/v3/football";

    constructor() {
        this.token = env.SPORTMONKS_API_KEY ;
        if (!this.token) {
            throw new Error(
                "SPORTMONKS_API_KEY não encontrada no .env. Registre-se em https://www.sportmonks.com/register"
            );
        }
    }

    /** --------------------------------------------------------------
     *  SPORTMONKS
     *  -------------------------------------------------------------- */
    public sportmonks = {
        /* ---------- FIXTURES ---------- */
        fixtures: {
            /** Jogos entre duas datas (máx 7 dias) */
            byDateRange: async (from: Date, to: Date): Promise<FixturesResponse> => {
                return this.get("/fixtures", {
                    from: this.fmt(from),
                    to: this.fmt(to),
                    include:
                        "league,season,homeTeam,awayTeam,venue,events,lineups", // nomes EXATOS da doc
                });
            },

            /** Jogos ao vivo */
            live: async (): Promise<FixturesResponse> => {
                return this.get("/fixtures", {
                    status: "LIVE",
                    include: "league,season,homeTeam,awayTeam,venue",
                });
            },

            /** Fixture por ID */
            byId: async (id: number): Promise<FixturesResponse> => {
                return this.get(`/fixtures/${id}`, {
                    include:
                        "league,season,homeTeam,awayTeam,venue,events,lineups,odds",
                });
            },
        },

        /* ---------- LEAGUES ---------- */
        leagues: {
            list: async (): Promise<LeaguesResponse> => this.get("/leagues"),
            byId: async (id: number): Promise<LeaguesResponse> =>
                this.get(`/leagues/${id}`),
        },

        /* ---------- TEAMS ---------- */
        teams: {
            byLeagueAndSeason: async (
                leagueId: number,
                seasonId: number
            ): Promise<TeamsResponse> =>
                this.get("/teams", { league_id: leagueId, season_id: seasonId }),

            byId: async (id: number): Promise<TeamsResponse> =>
                this.get(`/teams/${id}`, { include: "venue,players" }),

            search: async (name: string): Promise<TeamsResponse> =>
                this.get("/teams/search", { name }),
        },

        /* ---------- PLAYERS ---------- */
        players: {
            byTeam: async (teamId: number): Promise<PlayersResponse> =>
                this.get(`/teams/${teamId}/squad`),

            topScorers: async (
                leagueId: number,
                seasonId: number
            ): Promise<PlayersResponse> =>
                this.get("/players/topscorers", {
                    league_id: leagueId,
                    season_id: seasonId,
                }),
        },

        /* ---------- ODDS ---------- */
        odds: {
            byFixture: async (fixtureId: number): Promise<OddsResponse> =>
                this.get(`/odds/fixture/${fixtureId}`),
        },

        /* ---------- EVENTS ---------- */
        events: {
            byFixture: async (fixtureId: number): Promise<EventsResponse> =>
                this.get(`/fixtures/${fixtureId}/events`),
        },

        /* ---------- POLLING ---------- */
        startLivePolling: async (
            cb: (fixtures: any[]) => void,
            ms = 30_000
        ) => {
            const poll = async () => {
                try {
                    const r = await this.sportmonks.fixtures.live();
                    cb(r.data);
                } catch (e) {
                    console.error("Polling error:", e);
                }
            };
            await poll();
            setInterval(poll, ms);
        },
    };

    /* --------------------------------------------------------------
     *  UTILIDADES
     *  -------------------------------------------------------------- */
    private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await axios.get<T>(url, {
            params: { ...params, tz: "America/Sao_Paulo" },
            headers: { Authorization: `Bearer ${this.token}` },
        });
        return response.data;
    }

    private fmt(d: Date): string {
        return d.toISOString().split("T")[0]; // 2025-10-28
    }
}