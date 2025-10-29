export interface ApiResponse<T> {
  data: T;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
  errors?: Record<string, string[]>;
}