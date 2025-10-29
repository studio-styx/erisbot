import { ApiResponse } from "./apiResponse.js";

export interface League {
    id: number;
    name: string;
    short_name: string | null;
    symbol: string | null;
    country_id: number;
    country: {
        id: number;
        name: string;
        iso_code: string;
    };
    tv_station: string | null;
    is_popular: boolean;
    meta: {
        category: {
            id: number;
            name: string;
            parent_id: number | null;
        };
    };
    seasons: {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
        current: boolean;
    }[];
}

export type LeaguesResponse = ApiResponse<League[]>;