export interface ApiResponse<T> {
  data: T;
  pagination?: {
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
  message?: string;
  errors?: Record<string, string[]>;
}