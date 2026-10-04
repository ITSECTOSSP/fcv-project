import api from "@/lib/api/api";

import type {
  AttachmentTypeResponse,
  AttachmentTypesResponse,
  CreateAttachmentTypePayload,
  UpdateAttachmentTypePayload,
} from "@/types/inv-fcv/attachment-type";

export async function getAttachmentTypes(
  params?: {
    search?: string;
    page?: number;
    per_page?: number;
  },
): Promise<AttachmentTypesResponse> {
  const response =
    await api.get<AttachmentTypesResponse>(
      "/api/inventory/attachment-types",
      {
        params,
      },
    );

  return response.data;
}

export async function getAttachmentType(
  id: string,
): Promise<AttachmentTypeResponse> {
  const response =
    await api.get<AttachmentTypeResponse>(
      `/api/inventory/attachment-types/${id}`,
    );

  return response.data;
}

export async function createAttachmentType(
  payload: CreateAttachmentTypePayload,
): Promise<AttachmentTypeResponse> {
  const response =
    await api.post<AttachmentTypeResponse>(
      "/api/inventory/attachment-types",
      payload,
    );

  return response.data;
}

export async function updateAttachmentType(
  id: string,
  payload: UpdateAttachmentTypePayload,
): Promise<AttachmentTypeResponse> {
  const response =
    await api.put<AttachmentTypeResponse>(
      `/api/inventory/attachment-types/${id}`,
      payload,
    );

  return response.data;
}

export async function deleteAttachmentType(
  id: string,
): Promise<{ message: string }> {
  const response =
    await api.delete<{ message: string }>(
      `/api/inventory/attachment-types/${id}`,
    );

  return response.data;
}