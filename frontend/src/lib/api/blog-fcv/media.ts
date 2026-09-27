import api from "../api";

import type {
  ContentMedia,
} from "@/types/blog-fcv/content";

export interface MediaResponse {
  data: ContentMedia;
  message?: string;
}

export interface MediaListResponse {
  data: ContentMedia[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface MediaUploadPayload {
  file: File;
  name?: string;
  alt_text?: string;
  caption?: string;
  disk?: string;
}

export const mediaApi = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get<MediaListResponse>(
      "/api/blog/media",
      {
        params,
      },
    );

    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<MediaResponse>(
      `/api/blog/media/${id}`,
    );

    return response.data;
  },

  getUrl: (media: ContentMedia) => {
    if (media.url) {
      return media.url;
    }

    return `${import.meta.env.VITE_API_URL}/api/blog/storage/${media.path}`;
  },

  upload: async (payload: MediaUploadPayload) => {
    const formData = new FormData();

    formData.append("file", payload.file);

    if (payload.name) {
      formData.append("name", payload.name);
    }

    if (payload.alt_text) {
      formData.append("alt_text", payload.alt_text);
    }

    if (payload.caption) {
      formData.append("caption", payload.caption);
    }

    if (payload.disk) {
      formData.append("disk", payload.disk);
    }

    const response = await api.post<MediaResponse>(
      "/api/blog/media",
      formData,
    );

    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(
      `/api/blog/media/${id}`,
    );

    return response.data;
  },
};