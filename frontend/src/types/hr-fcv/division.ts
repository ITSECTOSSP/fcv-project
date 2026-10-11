export interface Division {
  id: number;

  name: string;

  sections_count?: number;

  sections?: Array<{
    id: number;
    division_id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }>;

  created_at: string;
  updated_at: string;
}

export interface DivisionPayload {
  name: string;
}

export interface DivisionFilters {
  search?: string;

  page?: number;
  per_page?: number;
}
