import { useCallback, useEffect, useState } from "react";
import {
    contentTypesApi,
    type ContentType,
    type ContentTypePayload,
} from "@/lib/api/blog-fcv/content-types";

export function useContentTypes() {
    const [contentTypes, setContentTypes] = useState<ContentType[]>(
        []
    );

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContentTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await contentTypesApi.getAll();

            setContentTypes(response.data);
        } catch (err) {
            console.error("Failed to fetch content types:", err);

            setError("Unable to load content types.");
        } finally {
            setLoading(false);
        }
    }, []);

    const createContentType = async (
        payload: ContentTypePayload
    ) => {
        const response = await contentTypesApi.create(payload);

        await fetchContentTypes();

        return response.data;
    };

    const updateContentType = async (
        id: number,
        payload: Partial<ContentTypePayload>
    ) => {
        const response = await contentTypesApi.update(id, payload);

        await fetchContentTypes();

        return response.data;
    };

    const deleteContentType = async (id: number) => {
        await contentTypesApi.delete(id);

        await fetchContentTypes();
    };

    useEffect(() => {
        fetchContentTypes();
    }, [fetchContentTypes]);

    return {
        contentTypes,
        loading,
        error,
        fetchContentTypes,
        createContentType,
        updateContentType,
        deleteContentType,
    };
}