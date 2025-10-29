import { ApiResponse } from "./apiResponse.js";

export interface OddsValue {
  value: string;
  odd: string;
}

export interface OddsBet {
  id: number;
  name: string;
  values: OddsValue[];
}

export interface OddsBookmaker {
  id: number;
  name: string;
  bets: OddsBet[];
}

export interface Odds {
  fixture_id: number;
  bookmaker: OddsBookmaker;
}

export type OddsResponse = ApiResponse<Odds[]>;