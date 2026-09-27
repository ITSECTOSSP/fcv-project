import { useCallback, useEffect, useState } from "react";

import { contentsApi } from "@/lib/api/blog-fcv/contents";

import type {
  Content,
  ContentFilters,
  ContentPayload,
  ContentsResponse,
  ContentResponse,
} from "@/types/blog-fcv/content";

export function useContents() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });

  const fetchContents = useCallback(async (filters?: ContentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await contentsApi.getAll(filters);

      setContents(response.data);

      setPagination({
        currentPage: response.current_page ?? 1,
        lastPage: response.last_page ?? 1,
        perPage: response.per_page ?? 15,
        total: response.total ?? response.data.length,
      });
    } catch (err) {
      console.error("Failed to fetch contents:", err);

      setError("Unable to load contents.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createContent = async (payload: ContentPayload) => {
    try {
      const response = await contentsApi.create(payload);

      console.log("API CREATE RESPONSE:", response);

      await fetchContents();

      return response;
    } catch (error) {
      console.error("CREATE CONTENT API ERROR:", error);

      throw error;
    }
  };

  const getContent = useCallback(async (id: number) => {
    try {
      setError(null);

      const response = await contentsApi.getById(id);

      console.log("GET CONTENT API RESPONSE:", response);

      return response;
    } catch (err) {
      console.error("Failed to fetch content:", err);
      setError("Unable to load content.");
      throw err;
    }
  }, []);

  const updateContent = async (
    id: number,
    payload: Partial<ContentPayload>,
  ) => {
    const response = await contentsApi.update(id, payload);

    await fetchContents();

    return response;
  };

  const deleteContent = async (id: number) => {
    await contentsApi.delete(id);

    await fetchContents();
  };

  const publishContent = async (id: number) => {
    const response = await contentsApi.publish(id);

    await fetchContents();

    return response.data;
  };

  const archiveContent = async (id: number) => {
    const response = await contentsApi.archive(id);

    await fetchContents();

    return response.data;
  };

  const restoreContent = async (id: number) => {
    const response = await contentsApi.restore(id);

    await fetchContents();

    return response.data;
  };

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return {
    contents,
    loading,
    error,
    pagination,
    fetchContents,
    createContent,
    getContent,
    updateContent,
    deleteContent,
    publishContent,
    archiveContent,
    restoreContent,
  };
}
