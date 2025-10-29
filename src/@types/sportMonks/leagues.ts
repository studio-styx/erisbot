import { ApiResponse } from "./apiResponse.js";

export interface Country {
  id: number;
  name: string;
  iso_code: string;
}

export interface League {
  id: number;
  sport_id: number;
  country_id: number;
  name: string;
  active: boolean;
  short_code: string | null;
  image_path: string;
  type: string;
  sub_type: string;
  last_played_at: string;
  category: number;
  has_jerseys: boolean;

  country?: Country;
}

export type LeaguesResponse = ApiResponse<League[]>;