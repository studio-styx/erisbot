// Área geográfica do clube (país)
interface Area {
    id: number;                    // ID único da área
    name: string;                  // Nome do país (ex: "Spain")
    code: string;                  // Código ISO do país (ex: "ESP")
    flag: string;                  // URL da bandeira em SVG
}

// Competição em que o time está participando
interface Competition {
    id: number;                    // ID da competição
    name: string;                  // Nome completo (ex: "Primera Division")
    code: string;                  // Código curto (ex: "PD")
    type: 'LEAGUE' | 'CUP' | string; // Tipo da competição
    emblem: string | null;         // URL do emblema (pode ser null)
}

// Contrato (início e fim)
interface Contract {
    start: string;                 // Mês/ano de início (ex: "2020-08")
    until: string;                 // Mês/ano de término (ex: "2023-06")
}

// Treinador do time
interface Coach {
    id: number;                    // ID do treinador
    firstName: string;             // Primeiro nome
    lastName: string;              // Sobrenome
    name: string;                  // Nome completo (ex: "Manuel Pellegrini")
    dateOfBirth: string;           // Data de nascimento (ISO: "1953-09-16")
    nationality: string;           // Nacionalidade
    contract: Contract;            // Contrato atual
}

// TIPO SEPARADO: Jogador do elenco (squad)
interface Player {
    id: number;                    // ID único do jogador
    firstName: string;             // Primeiro nome (pode estar vazio "")
    lastName: string | null;       // Sobrenome (pode ser null)
    name: string;                  // Nome completo para exibição
    position: 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence'; // Posição
    dateOfBirth: string;           // Data de nascimento (ISO)
    nationality: string;           // Nacionalidade
    shirtNumber: number;           // Número da camisa
    marketValue: number | null;    // Valor de mercado em EUR (pode ser null)
    contract: Contract;            // Contrato do jogador
}

// Membro da comissão técnica (staff)
interface Staff {
    id: number;                    // ID do membro
    firstName: string;             // Primeiro nome (pode estar vazio)
    lastName: string;              // Sobrenome
    name: string;                  // Nome completo
    dateOfBirth: string;           // Data de nascimento (ISO)
    nationality: string;           // Nacionalidade
    contract: Contract;            // Contrato
}

// RESPOSTA COMPLETA DA API - Informações do clube
export interface ClubResponse {
    area: Area;                    // País do clube
    id: number;                    // ID único do clube
    name: string;                  // Nome completo (ex: "Real Betis Balompié")
    shortName: string;             // Nome curto (ex: "Real Betis")
    tla: string;                   // Sigla de 3 letras (ex: "BET")
    crest: string;                 // URL do escudo (geralmente PNG)
    address: string;               // Endereço do clube
    website: string;               // Site oficial
    founded: number;               // Ano de fundação
    clubColors: string;            // Cores do clube (ex: "Green / White")
    venue: string;                 // Nome do estádio
    runningCompetitions: Competition[]; // Competições ativas
    coach: Coach;                  // Treinador principal
    marketValue: number;           // Valor total de mercado do elenco (em EUR)
    squad: Player[];               // Elenco completo (jogadores)
    staff: Staff[];                // Comissão técnica
    lastUpdated: string;           // Última atualização (ISO datetime)
}