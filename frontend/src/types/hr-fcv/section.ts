import type { Division } from "./division";

export interface Section {
  id: number;

  division_id: number;
  name: string;

  division?: Division;

  employees_count?: number;

  created_at: string;
  updated_at: string;
}

export interface SectionPayload {
  division_id: number;
  name: string;
}

export interface SectionFilters {
  search?: string;
  division_ids?: number[];

  page?: number;
  per_page?: number;
}
