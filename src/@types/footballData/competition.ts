// Área geográfica da competição (país)
interface Area {
    id: number;                    // ID único da área
    name: string;                  // Nome do país (ex: "England")
    code: string;                  // Código ISO do país (ex: "ENG")
    flag: string;                  // URL da bandeira em SVG
}

// Clube campeão de uma temporada (quando houver vencedor)
interface WinnerClub {
    id: number;                    // ID do clube
    name: string;                  // Nome completo (ex: "Manchester City FC")
    shortName: string;             // Nome curto (ex: "Man City")
    tla: string;                   // Sigla de 3 letras (ex: "MCI")
    crest: string;                 // URL do escudo (PNG)
    address: string;               // Endereço do clube
    website: string;               // Site oficial
    founded: number;               // Ano de fundação
    clubColors: string;            // Cores do clube (ex: "Sky Blue / White")
    venue: string;                 // Nome do estádio
    lastUpdated: string;           // Última atualização (ISO datetime)
}

// Temporada (usada em currentSeason e no array de seasons)
interface Season {
    id: number;                    // ID único da temporada
    startDate: string;             // Data de início (ISO: "2021-08-13")
    endDate: string;               // Data de término (ISO: "2022-05-22")
    currentMatchday: number | null; // Rodada atual (ou null em temporadas antigas)
    winner: WinnerClub | null;     // Clube campeão (ou null se não houver)
    stages: string[];              // Fases da temporada (ex: ["REGULAR_SEASON"])
}

// RESPOSTA COMPLETA DA API - Informações da competição
export interface CompetitionResponse {
    area: Area;                    // País da competição
    id: number;                    // ID único da competição
    name: string;                  // Nome completo (ex: "Premier League")
    code: string;                  // Código curto (ex: "PL")
    type: 'LEAGUE' | 'CUP' | string; // Tipo da competição
    emblem: string;                // URL do emblema (PNG)

    currentSeason: Season;         // Temporada atual (com currentMatchday ativo)

    seasons: Season[];             // Histórico completo de todas as temporadas

    lastUpdated: string;           // Última atualização dos dados (ISO datetime)
}