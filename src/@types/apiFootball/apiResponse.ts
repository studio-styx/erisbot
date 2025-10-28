export interface ApiResponse<T> {
    get: string;
    parameters: Record<string, any>;
    errors: any[];
    results: number;
    paging: { current: number; total: number };
    response: T;
}
