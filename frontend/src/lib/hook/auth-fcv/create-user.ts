import { useState } from "react";

import api from "@/lib/api/api";

import type {
  CreateUserPayload,
  CreateUserResponse,
} from "@/types/auth-fcv/user";

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (
    payload: CreateUserPayload,
  ): Promise<CreateUserResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await api.post<CreateUserResponse>(
          "/api/auth/admin/users",
          payload,
        );

      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to create user:",
        error,
      );

      const message =
        error.response?.data?.message ||
        "Failed to create user.";

      setError(message);

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    loading,
    error,
  };
}
