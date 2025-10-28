// FootballSdk.ts
import { env } from "#settings";
import { FixtureResponse, LiveFixturesResponse } from "#types/apiFootball/games.js";
import { LeaguesResponse } from "#types/apiFootball/leagues.js";
import { TeamsResponse } from "#types/apiFootball/team.js";
import { CompetitionsResponse } from "#types/footballData/competitions.js";
import { Match, MatchesResponse } from "#types/footballData/matches.js";
import axios from "axios";

export class FootballSdk {
    private apiFootballToken: string;
    private footballDataToken: string;
    private readonly apiFootballUrl = "https://v3.football.api-sports.io";
    private readonly footballDataUrl = "http://api.football-data.org/v4";

    constructor(apiFootballToken?: string, footballDataToken?: string) {
        this.apiFootballToken = apiFootballToken || env.API_FOOTBALL_KEY;
        this.footballDataToken = footballDataToken || env.FOOTBALL_DATA_KEY;
    }

    // ===================================================================
    // API-FOOTBALL
    // ===================================================================
    public apiFootball = {
        fixtures: {
            byDateRange: async (from: Date, to: Date): Promise<FixtureResponse> =>
                this.get(this.apiFootballUrl, "/fixtures", {
                    from: this.fmt(from),
                    to: this.fmt(to),
                }, this.apiFootballToken),

            live: async (): Promise<LiveFixturesResponse> =>
                this.get(this.apiFootballUrl, "/fixtures", { live: "all" }, this.apiFootballToken),
        },

        leagues: {
            list: async (): Promise<LeaguesResponse> =>
                this.get(this.apiFootballUrl, "/leagues", {}, this.apiFootballToken),
        },

        teams: {
            byLeagueAndSeason: async (leagueId: number, season: number): Promise<TeamsResponse> =>
                this.get(this.apiFootballUrl, "/teams", { league: leagueId, season }, this.apiFootballToken),
        },
    };

    // ===================================================================
    // FOOTBALL-DATA.ORG
    // ===================================================================
    public footballData = {
        fixtures: {
            /**
             * Jogos da semana (máx 7 dias)
             */
            byDateRange: async (from: Date, to: Date): Promise<MatchesResponse> => {
                const response = await axios.get<MatchesResponse>(
                    `${this.footballDataUrl}/matches`,
                    {
                        params: {
                            dateFrom: this.fmt(from),
                            dateTo: this.fmt(to),
                        },
                        headers: this.headersFd(),
                    }
                );
                return response.data;
            },

            /**
             * Jogos ao vivo ou por status
             */
            live: async (): Promise<MatchesResponse> => {
                const response = await axios.get<MatchesResponse>(
                    `${this.footballDataUrl}/matches`,
                    { params: { status: ["LIVE", "IN_PLAY"] }, headers: this.headersFd() }
                );
                return response.data;
            },

            byId: async (id: number): Promise<Match> => {
                const response = await axios.get<{ match: Match }>(
                    `${this.footballDataUrl}/matches/${id}`,
                    { headers: this.headersFd() }
                );
                return response.data.match;
            },
        },

        leagues: {
            list: async (): Promise<CompetitionsResponse> => {
                const response = await axios.get<CompetitionsResponse>(
                    `${this.footballDataUrl}/competitions`,
                    { headers: this.headersFd() }
                );
                return response.data;
            },

            byId: async (id: number): Promise<CompetitionsResponse> => {
                const response = await axios.get<CompetitionsResponse>(
                    `${this.footballDataUrl}/competitions/${id}`,
                    { headers: this.headersFd() }
                );
                return response.data;
            },
        },

        teams: {
            byLeague: async (leagueId: number): Promise<TeamsResponse> => {
                const response = await axios.get<TeamsResponse>(
                    `${this.footballDataUrl}/competitions/${leagueId}/teams`,
                    { headers: this.headersFd() }
                );
                return response.data;
            },
        },

        /**
         * Polling otimizado para lives (10 calls/min = 600/hora)
         */
        startLivePolling: async (
            callback: (matches: Match[]) => void,
            intervalMs: number = 60000
        ) => {
            const poll = async () => {
                try {
                    const data = await this.footballData.fixtures.live();
                    callback(data.matches);
                } catch (error) {
                    console.error("Polling error:", error);
                }
            };

            await poll();
            setInterval(poll, intervalMs);
        },
    };

    // ===================================================================
    // UTILS
    // ===================================================================
    private async get<T>(
        baseUrl: string,
        endpoint: string,
        params: Record<string, any>,
        token: string
    ): Promise<T> {
        const response = await axios.get<T>(`${baseUrl}${endpoint}`, {
            params,
            headers: { "x-apisports-key": token },
        });
        return response.data;
    }

    private headersFd() {
        return this.footballDataToken
            ? { "X-Auth-Token": this.footballDataToken }
            : {};
    }

    private fmt(date: Date): string {
        return date.toISOString().split("T")[0];
    }
}