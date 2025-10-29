export interface Event {
    time: { elapsed: number; extra: number | null };
    team: { id: number; name: string; logo: string };
    player: { id: number; name: string };
    assist: { id: number | null; name: string | null };
    type: "Goal" | "Card" | "subst" | "Var";
    detail: string; // "Normal Goal", "Yellow Card"
    comments: string | null;
}

export type EventsResponse = {
    get: string;
    parameters: Record<string, any>;
    errors: any[];
    results: number;
    paging: { current: number; total: number };
    response: Event[];
};