import api from "../api";

export interface ContentType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    contents_count?: number;
    created_at: string;
    updated_at: string;
}

export interface ContentTypeResponse {
    data: ContentType;
    message?: string;
}

export interface ContentTypesResponse {
    data: ContentType[];
}

export interface ContentTypePayload {
    name: string;
    slug?: string | null;
    description?: string | null;
    is_active?: boolean;
}

export const contentTypesApi = {
    getAll: async () => {
        const response =
            await api.get<ContentTypesResponse>(
                "/api/blog/content-types"
            );

        return response.data;
    },

    getById: async (id: number) => {
        const response =
            await api.get<ContentTypeResponse>(
                `/api/blog/content-types/${id}`
            );

        return response.data;
    },

    create: async (payload: ContentTypePayload) => {
        const response =
            await api.post<ContentTypeResponse>(
                "/api/blog/content-types",
                payload
            );

        return response.data;
    },

    update: async (
        id: number,
        payload: Partial<ContentTypePayload>
    ) => {
        const response =
            await api.put<ContentTypeResponse>(
                `/api/blog/content-types/${id}`,
                payload
            );

        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(
            `/api/blog/content-types/${id}`
        );

        return response.data;
    },
};