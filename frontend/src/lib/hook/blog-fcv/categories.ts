import { useCallback, useEffect, useState } from "react";

import {
    categoriesApi,
    type Category,
    type CategoryPayload,
} from "@/lib/api/blog-fcv/categories";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await categoriesApi.getAll();

            setCategories(response.data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);

            setError("Unable to load categories.");
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = async (
        payload: CategoryPayload
    ) => {
        const response = await categoriesApi.create(payload);

        await fetchCategories();

        return response.data;
    };

    const updateCategory = async (
        id: number,
        payload: Partial<CategoryPayload>
    ) => {
        const response = await categoriesApi.update(id, payload);

        await fetchCategories();

        return response.data;
    };

    const deleteCategory = async (id: number) => {
        await categoriesApi.delete(id);

        await fetchCategories();
    };

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}