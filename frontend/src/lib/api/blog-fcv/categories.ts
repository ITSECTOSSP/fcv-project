import api from "../api";

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    contents_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CategoryResponse {
    data: Category;
    message?: string;
}

export interface CategoriesResponse {
    data: Category[];
}

export interface CategoryPayload {
    name: string;
    slug?: string | null;
    description?: string | null;
    is_active?: boolean;
}

export const categoriesApi = {
    getAll: async () => {
        const response = await api.get<CategoriesResponse>(
            "/api/blog/categories"
        );

        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<CategoryResponse>(
            `/api/blog/categories/${id}`
        );

        return response.data;
    },

    create: async (payload: CategoryPayload) => {
        const response = await api.post<CategoryResponse>(
            "/api/blog/categories",
            payload
        );

        return response.data;
    },

    update: async (
        id: number,
        payload: Partial<CategoryPayload>
    ) => {
        const response = await api.put<CategoryResponse>(
            `/api/blog/categories/${id}`,
            payload
        );

        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(
            `/api/blog/categories/${id}`
        );

        return response.data;
    },
};