import type {
  Division,
  DivisionFilters,
  DivisionPayload,
} from "@/types/hr-fcv/division";

import type { PaginatedResponse } from "@/types/pagination";

import api from "@/lib/api/api";

export const divisionApi = {
  /*
  |--------------------------------------------------------------------------
  | GET DIVISIONS
  |--------------------------------------------------------------------------
  */
  index: (params?: DivisionFilters) =>
    api.get<PaginatedResponse<Division>>("/api/hr/divisions", {
      params,
    }),

  /*
  |--------------------------------------------------------------------------
  | GET DIVISION
  |--------------------------------------------------------------------------
  */
  show: (id: number) =>
    api.get<{
      data: Division;
    }>(`/api/hr/divisions/${id}`),

  /*
  |--------------------------------------------------------------------------
  | CREATE DIVISION
  |--------------------------------------------------------------------------
  */
  store: (data: DivisionPayload) =>
    api.post<{
      message: string;
      data: Division;
    }>("/api/hr/divisions", data),

  /*
  |--------------------------------------------------------------------------
  | UPDATE DIVISION
  |--------------------------------------------------------------------------
  */
  update: (id: number, data: DivisionPayload) =>
    api.put<{
      message: string;
      data: Division;
    }>(`/api/hr/divisions/${id}`, data),

  /*
  |--------------------------------------------------------------------------
  | DELETE DIVISION
  |--------------------------------------------------------------------------
  */
  destroy: (id: number) =>
    api.delete<{
      message: string;
    }>(`/api/hr/divisions/${id}`),
};
