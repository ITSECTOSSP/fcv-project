import api from "../api";

import type {
  Content,
  ContentFilters,
  ContentPayload,
  ContentsResponse,
  ContentResponse,
} from "@/types/blog-fcv/content";

export const contentsApi = {
  getAll: async (filters?: ContentFilters) => {
    const response = await api.get<ContentsResponse>("/api/blog/contents", {
      params: filters,
    });

    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Content>(`/api/blog/contents/${id}`);

    return response.data;
  },

  create: async (payload: ContentPayload) => {
    const formData = new FormData();

    formData.append("content_type_id", String(payload.content_type_id));

    formData.append("title", payload.title);

    if (payload.slug) {
      formData.append("slug", payload.slug);
    }

    if (payload.excerpt) {
      formData.append("excerpt", payload.excerpt);
    }

    if (payload.content) {
      formData.append("content", payload.content);
    }

    if (payload.status) {
      formData.append("status", payload.status);
    }

    formData.append("is_featured", payload.is_featured ? "1" : "0");

    if (payload.published_at) {
      formData.append("published_at", payload.published_at);
    }

    payload.category_ids?.forEach((id) => {
      formData.append("category_ids[]", String(id));
    });

    if (payload.featured_media) {
      formData.append("featured_media", payload.featured_media);
    }

    if (payload.banner_media) {
      formData.append("banner_media", payload.banner_media);
    }

    payload.attachments?.forEach((file) => {
      formData.append("attachments[]", file);
    });

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log("UPLOAD FILE:", key, {
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified,
        });
      } else {
        console.log("FORM FIELD:", key, value);
      }
    }

    const response = await api.post<ContentResponse>(
      "/api/blog/contents",
      formData,
    );

    return response.data;
  },

  update: async (id: number, payload: Partial<ContentPayload>) => {
    const formData = new FormData();

    if (payload.content_type_id !== undefined) {
      formData.append("content_type_id", String(payload.content_type_id));
    }

    if (payload.title !== undefined) {
      formData.append("title", payload.title);
    }

    if (payload.slug !== undefined) {
      formData.append("slug", payload.slug ?? "");
    }

    if (payload.excerpt !== undefined) {
      formData.append("excerpt", payload.excerpt ?? "");
    }

    if (payload.content !== undefined) {
      formData.append("content", payload.content ?? "");
    }

    if (payload.status !== undefined) {
      formData.append("status", payload.status);
    }

    if (payload.is_featured !== undefined) {
      formData.append("is_featured", payload.is_featured ? "1" : "0");
    }

    if (payload.published_at !== undefined) {
      formData.append("published_at", payload.published_at ?? "");
    }

    payload.category_ids?.forEach((id) => {
      formData.append("category_ids[]", String(id));
    });

    if (payload.featured_media) {
      formData.append("featured_media", payload.featured_media);
    }

    if (payload.banner_media) {
      formData.append("banner_media", payload.banner_media);
    }

    payload.attachments?.forEach((file) => {
      formData.append("attachments[]", file);
    });

    // Remove existing media
    if (payload.remove_featured_media !== undefined) {
      formData.append(
        "remove_featured_media",
        payload.remove_featured_media ? "1" : "0",
      );
    }

    if (payload.remove_banner_media !== undefined) {
      formData.append(
        "remove_banner_media",
        payload.remove_banner_media ? "1" : "0",
      );
    }

    // Laravel handles multipart updates through POST + _method
    formData.append("_method", "PUT");

    // Temporary debugging
    for (const [key, value] of formData.entries()) {
      console.log("UPDATE FORMDATA:", key, value);
    }

    const response = await api.post<Content>(
      `/api/blog/contents/${id}`,
      formData,
    );

    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/blog/contents/${id}`);

    return response.data;
  },

  publish: async (id: number) => {
    const response = await api.post<ContentResponse>(
      `/api/blog/contents/${id}/publish`,
    );

    return response.data;
  },

  archive: async (id: number) => {
    const response = await api.post<ContentResponse>(
      `/api/blog/contents/${id}/archive`,
    );

    return response.data;
  },

  restore: async (id: number) => {
    const response = await api.post<ContentResponse>(
      `/api/blog/contents/${id}/restore`,
    );

    return response.data;
  },
};
