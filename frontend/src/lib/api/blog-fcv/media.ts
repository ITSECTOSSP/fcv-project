import api from "../api";

export interface Media {
    id: number;
    name: string;
    file_name: string;
    path: string;
    disk: string;
    mime_type: string | null;
    size: number | null;
    alt_text: string | null;
    caption: string | null;
    created_at: string;
    updated_at: string;
}

export interface MediaResponse {
    data: Media;
    message?: string;
}

export interface MediaListResponse {
    data: Media[];
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
        const response =
            await api.get<MediaListResponse>(
                "/api/blog/media",
                {
                    params,
                }
            );

        return response.data;
    },

    getById: async (id: number) => {
        const response =
            await api.get<MediaResponse>(
                `/api/blog/media/${id}`
            );

        return response.data;
    },

    upload: async (payload: MediaUploadPayload) => {
        const formData = new FormData();

        formData.append("file", payload.file);

        if (payload.name) {
            formData.append("name", payload.name);
        }

        if (payload.alt_text) {
            formData.append(
                "alt_text",
                payload.alt_text
            );
        }

        if (payload.caption) {
            formData.append(
                "caption",
                payload.caption
            );
        }

        if (payload.disk) {
            formData.append("disk", payload.disk);
        }

        const response =
            await api.post<MediaResponse>(
                "/api/blog/media",
                formData
            );

        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(
            `/api/blog/media/${id}`
        );

        return response.data;
    },
};