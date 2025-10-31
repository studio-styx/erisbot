// src/tools/footballSdk.ts
import { redis } from "#database";
import { env } from "#settings";
import { CompetitionResponse } from "#types/footballData/competition.js";
import { MatchResponse, MatchStatus } from "#types/footballData/match.js";
import { MatchesResponse } from "#types/footballData/matches.js";
import { ClubResponse } from "#types/footballData/teamInfo.js";
import axios, { AxiosError } from "axios";

class RequestQueue {
    private queue: Array<() => Promise<any>> = [];
    private processing = false;
    private lastRequest = 0;
    private minInterval = 6000; // 10 req/min → 6s entre cada

    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const wrapped = async () => {
                await this.delay();
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.lastRequest = Date.now();
                }
            };
            this.queue.push(wrapped);
            this.process();
        });
    }

    private async delay() {
        const now = Date.now();
        const elapsed = now - this.lastRequest;
        if (elapsed < this.minInterval) {
            await new Promise(r => setTimeout(r, this.minInterval - elapsed));
        }
    }

    private process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;
        const next = this.queue.shift()!;
        next().finally(() => {
            this.processing = false;
            this.process();
        });
    }
}

export class ApiFootballSdk {
    private baseUrl = "https://api.football-data.org/v4";
    private apiKey: string;
    private queue = new RequestQueue();

    constructor(apiKey?: string) {
        this.apiKey = apiKey || env.API_FOOTBALL_DATA_KEY!;
    }

    private async request<T>(config: any): Promise<T> {
        return this.queue.add(async () => {
            try {
                const response = await axios(config);
                return response.data;
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status === 429) {
                    const retryAfter = error.response.headers["retry-after"];
                    const delay = (retryAfter ? parseInt(retryAfter) : 60) * 1000;
                    console.warn(`Rate limit! Aguardando ${delay / 1000}s...`);
                    await new Promise(r => setTimeout(r, delay));
                    return this.request(config); // retry
                }
                throw error;
            }
        });
    }

    get matches() {
        return {
            get: (id: number | string) =>
                this.request<MatchResponse>({
                    url: `${this.baseUrl}/matches/${id}`,
                    headers: { "X-Auth-Token": this.apiKey },
                }),
            
            getAndUseCache: async (id: number | string) => {
                // Verificar o cache redis
                const key = `football:match:${id}`;
                const raw = await redis.get(key);

                if (raw) return JSON.parse(raw) as MatchResponse;
                
                const response = this.request<MatchResponse>({
                    url: `${this.baseUrl}/matches/${id}`,
                    headers: { "X-Auth-Token": this.apiKey },
                });

                await redis.setex(key, 60 * 60, JSON.stringify(response));

                return response;
            },

            getTodayGames: () =>
                this.request<MatchesResponse>({
                    url: `${this.baseUrl}/matches`,
                    headers: { "X-Auth-Token": this.apiKey },
                }),

            getGamesByRange: (dateFrom: string | Date, dateTo: string | Date) => {
                const format = (d: string | Date) =>
                    d instanceof Date
                        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                        : d;

                return this.request<MatchesResponse>({
                    url: `${this.baseUrl}/matches`,
                    params: { dateFrom: format(dateFrom), dateTo: format(dateTo) },
                    headers: { "X-Auth-Token": this.apiKey },
                });
            },
        };
    }

    get teams() {
        return {
            get: (id: number | string) => ({
                getMatches: (options: { status: MatchStatus; limit: number }) =>
                    this.request<MatchesResponse>({
                        url: `${this.baseUrl}/teams/${id}/matches`,
                        params: options,
                        headers: { "X-Auth-Token": this.apiKey },
                    }),

                getInfo: () =>
                    this.request<ClubResponse>({
                        url: `${this.baseUrl}/teams/${id}`,
                        headers: { "X-Auth-Token": this.apiKey },
                    }),
            }),
        };
    }

    get competitions() {
        return {
            get: (code: string) => ({
                getInfo: () =>
                    this.request<CompetitionResponse>({
                        url: `${this.baseUrl}/competitions/${code}`,
                        headers: { "X-Auth-Token": this.apiKey },
                    }),

                getMatchday: (matchday: number) =>
                    this.request<MatchesResponse>({
                        url: `${this.baseUrl}/competitions/${code}/matches`,
                        params: { matchday },
                        headers: { "X-Auth-Token": this.apiKey },
                    }),
            }),
        };
    }
}

export const footballSdk = new ApiFootballSdk();