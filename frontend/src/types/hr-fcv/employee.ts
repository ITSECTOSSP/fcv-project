import type { Section } from "./section";

/*
|--------------------------------------------------------------------------
| EMPLOYEE STATUS
|--------------------------------------------------------------------------
*/

export type EmployeeStatus = "active" | "retired" | "resigned";

/*
|--------------------------------------------------------------------------
| EMPLOYEE
|--------------------------------------------------------------------------
*/

export interface Employee {
  id: string;

  first_name: string;
  middle_name: string | null;
  last_name: string;

  date_birth: string;

  email: string;
  contact_number: string;

  section_id: number;

  status: EmployeeStatus;

  encoded_by: string;
  updated_by: string | null;

  section?: Section;

  created_at: string;
  updated_at: string;
}

/*
|--------------------------------------------------------------------------
| EMPLOYEE PAYLOAD
|--------------------------------------------------------------------------
*/

export interface EmployeePayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;

  date_birth: string;

  email: string;
  contact_number: string;

  section_id: number;

  status?: EmployeeStatus;
}

/*
|--------------------------------------------------------------------------
| EMPLOYEE FILTERS
|--------------------------------------------------------------------------
*/

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  division_ids?: number[];
  section_ids?: number[];
  page?: number;
  per_page?: number;
}
