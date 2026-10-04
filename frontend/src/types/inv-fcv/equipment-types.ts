export type EquipmentType = {
  id: string;
  name: string;
  description: string | null;
  equipments_count?: number;
  created_at: string;
  updated_at: string;
};

export type EquipmentTypeFilters = {
  search?: string;
  page?: number;
  per_page?: number;
};

export type EquipmentTypesResponse = {
  current_page: number;
  data: EquipmentType[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type EquipmentTypeResponse = {
  message?: string;
  data: EquipmentType;
};

export type CreateEquipmentTypePayload = {
  name: string;
  description?: string | null;
};

export type UpdateEquipmentTypePayload = {
  name: string;
  description?: string | null;
};