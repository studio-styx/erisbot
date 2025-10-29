export interface Participant {
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
    founded: number | null;
    meta: {
        location: "home" | "away";
    };
    image_path: string,

}