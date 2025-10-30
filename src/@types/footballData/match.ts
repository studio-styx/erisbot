// Área geográfica (país ou região da competição)
interface Area {
    id: number;                    // ID único da área
    name: string;                  // Nome do país (ex: "France")
    code: string;                  // Código ISO do país (ex: "FRA")
    flag: string;                  // URL da bandeira em SVG
}

// Informações da competição (campeonato)
interface Competition {
    id: number;                    // ID único da competição
    name: string;                  // Nome completo (ex: "Ligue 1")
    code: string;                  // Código curto (ex: "FL1")
    type: 'LEAGUE' | 'CUP' | string; // Tipo da competição (liga, copa, etc.)
    emblem: string;                // URL do emblema (geralmente PNG)
}

// Temporada do campeonato
interface Season {
    id: number;                    // ID da temporada
    startDate: string;             // Data de início (ISO: "2021-08-06")
    endDate: string;               // Data de término (ISO: "2022-05-21")
    currentMatchday: number;       // Rodada atual (ex: 38)
    winner: {                      // Time campeão (pode ser null se ainda não definido)
        id: number;
        name: string;
    } | null;
    stages: string[];              // Fases da temporada (ex: ["REGULAR_SEASON"])
}

// Treinador do time
interface Coach {
    id: number;                    // ID do treinador
    name: string;                  // Nome completo
    nationality: string | null;    // Nacionalidade (pode ser null)
}

// Jogador (usado em escalação e banco)
interface Player {
    id: number;                    // ID único do jogador
    name: string;                  // Nome completo
    position: string | null;       // Posição (ex: "Centre-Forward") ou null
    shirtNumber: number;           // Número da camisa
}

// Time (casa ou visitante) com escalação, banco e estatísticas
export interface TeamSide {
    id: number;                    // ID do time
    name: string;                  // Nome completo (ex: "ES Troyes AC")
    shortName: string;             // Nome curto (ex: "Troyes")
    tla: string;                   // Sigla de 3 letras (ex: "ETR")
    crest: string;                 // URL do escudo (geralmente SVG)
    coach: Coach;                  // Treinador do time
    leagueRank: number | null;     // Posição na tabela (null se não aplicável)
    formation: string;             // Formação tática (ex: "3-4-1-2")
    lineup: Player[];              // Jogadores titulares
    bench: Player[];               // Jogadores no banco
    statistics: MatchStatistics;   // Estatísticas do time na partida
}

export interface MatchStatistics {  // Estatísticas do time na partida
    corner_kicks: number;           // Escanteios
    free_kicks: number;             // Faltas cobradas
    goal_kicks: number;             // Tiros de meta
    offsides: number;               // Impedimentos
    fouls: number;                  // Faltas cometidas
    ball_possession: number;        // Posse de bola (%)
    saves: number;                  // Defesas do goleiro
    throw_ins: number;              // Laterais
    shots: number;                  // Chutes totais
    shots_on_goal: number;          // Chutes no gol
    shots_off_goal: number;         // Chutes pra fora
    yellow_cards: number;           // Cartões amarelos
    yellow_red_cards: number;       // Segundo amarelo (conta como 1)
    red_cards: number;              // Cartões vermelhos diretos
};

// Placar detalhado (tempo integral e meio-tempo)
interface ScoreDetail {
    home: number;                  // Gols do time da casa
    away: number;                  // Gols do time visitante
}

// Resultado da partida
interface Score {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW'; // Quem venceu ou empate
    duration: 'REGULAR' | string;  // Duração (normalmente "REGULAR")
    fullTime: ScoreDetail;         // Placar final
    halfTime: ScoreDetail;         // Placar no intervalo
}

// Gol marcado
interface Goal {
    minute: number;                // Minuto do gol
    injuryTime: number | null;     // Minuto de acréscimo (ou null)
    type: 'REGULAR' | 'PENALTY' | 'OWN_GOAL' | string; // Tipo do gol
    team: {                        // Time que marcou
        id: number;
        name: string;
    };
    scorer: {                      // Jogador que fez o gol
        id: number;
        name: string;
    };
    assist: {                      // Assistência (pode ser null)
        id: number;
        name: string;
    } | null;
    score: ScoreDetail;            // Placar no momento do gol
}

// Pênalti (em disputas ou durante o jogo)
interface Penalty {
    player: {                      // Jogador que bateu
        id: number;
        name: string;
    };
    team: {                        // Time (pode ser null em alguns contextos)
        id: number | null;
        name: string | null;
    };
    scored: boolean;               // Se converteu ou não
}

// Cartão aplicado
interface Booking {
    minute: number;                // Minuto do cartão
    team: {                        // Time do jogador
        id: number;
        name: string;
    };
    player: {                      // Jogador advertido
        id: number;
        name: string;
    };
    card: 'YELLOW' | 'RED' | 'YELLOW_RED'; // Tipo de cartão
}

// Substituição
interface Substitution {
    minute: number;                // Minuto da troca
    team: {                        // Time que fez a substituição
        id: number;
        name: string;
    };
    playerOut: {                   // Jogador que saiu
        id: number;
        name: string;
    };
    playerIn: {                    // Jogador que entrou
        id: number;
        name: string;
    };
}

// Odds (probabilidades de aposta)
interface Odds {
    homeWin: number;               // Odd para vitória do mandante
    draw: number;                  // Odd para empate
    awayWin: number;               // Odd para vitória do visitante
}

// Árbitro ou auxiliar
interface Referee {
    id: number;                    // ID do oficial
    name: string;                  // Nome completo
    type: string;                  // Função (ex: "REFEREE", "ASSISTANT_REFEREE_N1")
    nationality: string | null;    // Nacionalidade (pode ser null)
}

// RESPOSTA COMPLETA DA API - Interface principal
export interface MatchResponse {
    area: Area;                    // País da competição
    competition: Competition;      // Campeonato
    season: Season;                // Temporada
    id: number;                    // ID único da partida
    utcDate: string;               // Data/hora em UTC (ISO: "2022-02-27T16:05:00Z")
    status: MatchStatus;           // Status da partida
    minute: number;                // Minuto atual (90+ para acréscimos)
    injuryTime: number;            // Tempo de acréscimo total
    attendance: number | null;     // Público presente (pode ser null)
    venue: string;                 // Nome do estádio
    matchday: number;              // Rodada (ex: 26)
    stage: MatchStages;                 // Fase (ex: "REGULAR_SEASON")
    group: string | null;          // Grupo (em copas, pode ser null)
    lastUpdated: string;           // Última atualização (ISO datetime)

    homeTeam: TeamSide;            // Time da casa
    awayTeam: TeamSide;            // Time visitante

    score: Score;                  // Placar e resultado
    goals: Goal[];                 // Lista de gols
    penalties: Penalty[];          // Pênaltis (geralmente em disputa)
    bookings: Booking[];           // Cartões aplicados
    substitutions: Substitution[]; // Substituições realizadas
    odds: Odds;                    // Odds de aposta
    referees: Referee[];           // Equipe de arbitragem
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELED' | 'AWARDED';

export type MatchStages =
    | "FINAL"
    | "THIRD_PLACE"
    | "SEMI_FINALS"
    | "QUARTER_FINALS"
    | "LAST_16"
    | "LAST_32"
    | "LAST_64"
    | "ROUND_4"
    | "ROUND_3"
    | "ROUND_2"
    | "ROUND_1"
    | "GROUP_STAGE"
    | "PRELIMINARY_ROUND"
    | "QUALIFICATION"
    | "QUALIFICATION_ROUND_1"
    | "QUALIFICATION_ROUND_2"
    | "QUALIFICATION_ROUND_3"
    | "PLAYOFF_ROUND_1"
    | "PLAYOFF_ROUND_2"
    | "PLAYOFFS"
    | "REGULAR_SEASON"
    | "CLAUSURA"
    | "APERTURA"
    | "CHAMPIONSHIP_ROUND"
    | "RELEGATION_ROUND"