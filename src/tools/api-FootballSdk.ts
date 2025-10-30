import { env } from "#settings";
import { CompetitionResponse } from "#types/footballData/competition.js";
import { MatchResponse, MatchStatus } from "#types/footballData/match.js";
import { MatchesResponse } from "#types/footballData/matches.js";
import { ClubResponse } from "#types/footballData/teamInfo.js";
import axios from "axios";

export class ApiFootballSdk {
    private baseUrl = "https://api.football-data.org/v4";
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || env.API_FOOTBALL_DATA_KEY!;
    }

    get matches() {
        return {
            /**
             * Pegar os dados de uma partida especifica
             * @argument id da partida
             * @returns dados da partida
             */
            get: async (id: number | string) => {
                const response = await axios.get<MatchResponse>(`${this.baseUrl}/matches/${id}`, {
                    headers: {
                        "X-Auth-Token": this.apiKey
                    }
                });

                return response.data;
            },

            /**
             * Pega todos os jogos de hoje
             * @returns Array de partidas
             */
            getTodayGames: async () => {
                const response = await axios.get<MatchesResponse>(`${this.baseUrl}/matches`, {
                    headers: {
                        "X-Auth-Token": this.apiKey
                    }
                });

                return response.data;
            },

            /**
             * Retorna todos os jogos de um intervalo previamente definido
             * @param dateFrom data inicial
             * @param dateTo data final
             * @returns Array de partidas
             */
            getGamesByRange: async (dateFrom: string | Date, dateTo: string | Date) => {
                // Formatar as datas para estarem no formato: yyyy-MM-dd
                const formatDate = (d: string | Date) => {
                    if (d instanceof Date) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        return `${y}-${m}-${day}`;
                    }
                    return d;
                };

                const formattedFrom = formatDate(dateFrom);
                const formattedTo = formatDate(dateTo);

                const response = await axios.get<MatchesResponse[]>(`${this.baseUrl}/matches`, {
                    params: {
                        dateFrom: formattedFrom,
                        dateTo: formattedTo
                    },
                    headers: {
                        "X-Auth-Token": this.apiKey
                    }
                });

                return response.data;
            }
        }
    }

    get teams() {
        return {
            /**
             * Pegar dados sonbre um time IMPORTANTE: não retorna dados sobre ele, e sim seus métodos
             * @param id Retorna metódos sobre o id
             * @returns Rotas para as informações do time
             */
            get: (id: number | string) => {
                return {
                    /**
                     * Pegar os jogos do determinado time
                     * @param options Opções de partidas
                     * @returns Partidas do time
                     */
                    getMatches: async (options: {
                        status: MatchStatus;
                        limit: number;
                    }) => {
                        const response = await axios.get<MatchesResponse>(`${this.baseUrl}/teams/${id}/matches`, {
                            params: {
                                status: options.status,
                                limit: options.limit
                            },
                            headers: {
                                "X-Auth-Token": this.apiKey
                            }
                        });

                        return response.data;
                    },

                    /**
                     * Pegar informações sobre o time
                     * @returns Informações do time
                     */
                    getInfo: async () => {
                        const response = await axios.get<ClubResponse>(`${this.baseUrl}/teams/${id}`, {
                            headers: {
                                "X-Auth-Token": this.apiKey
                            }
                        });

                        return response.data;
                    }
                }
            }
        }
    };

    get competitions() {
        return {
            /**
             * Pegar todos os metódos de uma determinada competição
             */
            get: (code: string) => {
                return {
                    /**
                     * Obter todos os dados da competição
                     * @returns Retorna todos os dados da competição
                     */
                    getInfo: async () => {
                        const response = await axios.get<CompetitionResponse>(`${this.baseUrl}/competitions/${code}`, {
                            headers: {
                                "X-Auth-Token": this.apiKey
                            }
                        });

                        return response.data;
                    },

                    /**
                     * Obter todos os jogos de uma rodada
                     * @param matchday Rodada dos jogos, ex: rodada 38 (A ultima)
                     * @returns Todos os jogos da rodada
                     */
                    getMatchday: async (matchday: number) => {
                        const response = await axios.get<MatchesResponse>(`${this.baseUrl}/competitions/${code}/matches`, {
                            params: {
                                matchday
                            },
                            headers: {
                                "X-Auth-Token": this.apiKey
                            }
                        });

                        return response.data;
                    }
                }
            }
        }
    }
}