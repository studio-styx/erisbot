export interface OddsValue {
    value: string; // "Home", "Over 2.5"
    odd: string;   // "1.95"
}

export interface OddsBet {
    id: number;
    name: string; // "Match Winner"
    values: OddsValue[];
}

export interface OddsBookmaker {
    id: number;
    name: string;
    bets: OddsBet[];
}

export interface Odds {
    fixture: { id: number };
    update: string;
    bookmakers: OddsBookmaker[];
}

export type OddsResponse = {
    get: string;
    parameters: Record<string, any>;
    errors: any[];
    results: number;
    paging: { current: number; total: number };
    response: Odds[];
};