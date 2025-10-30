import { MatchResponse } from "./match.js";

export interface MatchesResponse {
    filters: {                                  // Informações dos filtros usados
        dateFrom: string;                       // Data inicial
        dateTo: string;                         // Data final
        permission: "TIER_ONE" | string;        // Permissão
    };
    resultSet: {                                // Informações sobre o resultado
        count: number;                          // Número de partidas encontradas
        competitions: string;                   // Competições encontradas (codes separados por virgula) exemplo: CLI,SA
        first: string;                          // Data do primeiro jogo
        last: string;                           // Data do último jogo
        played: number;                         // Número de jogos jogados
    };
    matches: MatchResponse[];                   // Todas as partidas
}