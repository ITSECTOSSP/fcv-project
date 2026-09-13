import api from "../api";

export type ContentStatus = "draft" | "pending" | "published" | "archived";

export interface Content {
  id: number;
  content_type_id: number;
  author_id: number | null;

  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;

  status: ContentStatus;
  is_featured: boolean;
  published_at: string | null;

  content_type?: {
    id: number;
    name: string;
    slug: string;
  };

  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];

  media?: {
    id: number;
    name: string;
    file_name: string;
    path: string;
    mime_type: string | null;
  }[];

  created_at: string;
  updated_at: string;
}

export interface ContentsResponse {
  data: Content[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface ContentResponse {
  data: Content;
  message?: string;
}

export interface ContentPayload {
  content_type_id: number;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  status?: ContentStatus;
  is_featured?: boolean;
  published_at?: string | null;
  category_ids?: number[];

  featured_media?: File | null;
  banner_media?: File | null;
  attachments?: File[];
}

export interface ContentFilters {
  search?: string;
  content_type_id?: number;
  status?: ContentStatus;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
}

export const contentsApi = {
  getAll: async (filters?: ContentFilters) => {
    const response = await api.get<ContentsResponse>("/api/blog/contents", {
      params: filters,
    });

    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ContentResponse>(`/api/blog/contents/${id}`);

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
    const response = await api.put<ContentResponse>(
      `/api/blog/contents/${id}`,
      payload,
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
