import { ApiResponse } from "./apiResponse.js";

export interface OddsValue {
  odd: number | null; // ex: 1.95
}

export interface OddsBet {
  id: number;
  name: string; // "Match Winner", "Over/Under 2.5"
  values: OddsValue[]; // Array para home/draw/away ou over/under
}

export interface OddsBookmaker {
  id: number;
  name: string; // "Bet365"
  bets: OddsBet[];
}

export interface Odds {
  fixture_id: number;
  bookmaker_id: number;
  bookmaker: OddsBookmaker;
  bets: OddsBet[];
}

export type OddsResponse = ApiResponse<Odds[]>;