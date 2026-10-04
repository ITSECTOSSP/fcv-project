import api from "@/lib/api/api";

import type {
  EquipmentType,
  EquipmentTypeResponse,
  EquipmentTypesResponse,
  CreateEquipmentTypePayload,
  UpdateEquipmentTypePayload,
} from "@/types/inv-fcv/equipment-types";

export async function getEquipmentTypes(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<EquipmentTypesResponse> {
  const response = await api.get<EquipmentTypesResponse>(
    "/api/inventory/equipment-types",
    {
      params,
    },
  );

  return response.data;
}

export async function getEquipmentType(
  id: string,
): Promise<EquipmentTypeResponse> {
  const response = await api.get<EquipmentTypeResponse>(
    `/api/inventory/equipment-types/${id}`,
  );

  return response.data;
}

export async function createEquipmentType(
  payload: CreateEquipmentTypePayload,
): Promise<EquipmentTypeResponse> {
  const response = await api.post<EquipmentTypeResponse>(
    "/api/inventory/equipment-types",
    payload,
  );

  return response.data;
}

export async function updateEquipmentType(
  id: string,
  payload: UpdateEquipmentTypePayload,
): Promise<EquipmentTypeResponse> {
  const response = await api.put<EquipmentTypeResponse>(
    `/api/inventory/equipment-types/${id}`,
    payload,
  );

  return response.data;
}

export async function deleteEquipmentType(
  id: string,
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/api/inventory/equipment-types/${id}`,
  );

  return response.data;
}
