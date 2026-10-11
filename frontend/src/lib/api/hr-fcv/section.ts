import type {
  Section,
  SectionFilters,
  SectionPayload,
} from "@/types/hr-fcv/section";

import type { PaginatedResponse } from "@/types/pagination";

import api from "@/lib/api/api";

export const sectionApi = {
  /*
  |--------------------------------------------------------------------------
  | GET SECTIONS
  |--------------------------------------------------------------------------
  */
  index: (params?: SectionFilters) =>
    api.get<PaginatedResponse<Section>>("/api/hr/sections", {
      params,
    }),

  /*
  |--------------------------------------------------------------------------
  | GET SECTION
  |--------------------------------------------------------------------------
  */
  show: (id: number) =>
    api.get<{
      data: Section;
    }>(`/api/hr/sections/${id}`),

  /*
  |--------------------------------------------------------------------------
  | CREATE SECTION
  |--------------------------------------------------------------------------
  */
  store: (data: SectionPayload) =>
    api.post<{
      message: string;
      data: Section;
    }>("/api/hr/sections", data),

  /*
  |--------------------------------------------------------------------------
  | UPDATE SECTION
  |--------------------------------------------------------------------------
  */
  update: (id: number, data: SectionPayload) =>
    api.put<{
      message: string;
      data: Section;
    }>(`/api/hr/sections/${id}`, data),

  /*
  |--------------------------------------------------------------------------
  | DELETE SECTION
  |--------------------------------------------------------------------------
  */
  destroy: (id: number) =>
    api.delete<{
      message: string;
    }>(`/api/hr/sections/${id}`),
};
