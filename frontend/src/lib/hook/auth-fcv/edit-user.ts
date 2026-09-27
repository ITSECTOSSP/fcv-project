import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "@/lib/api/api";

import type { User } from "@/types/auth-fcv/user";

export type UpdateUserPayload = {
  name: string;
  email: string;
  role_id: string | null;
  status: "active" | "inactive";
};

export type GetUserResponse = {
  data: User;
};

export type UpdateUserResponse = {
  message: string;
  data: User;
};

export function useEditUser(
  userId: string | undefined,
) {
  const [user, setUser] = useState<User | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response =
        await api.get<GetUserResponse>(
          `/api/auth/admin/users/${userId}`,
        );

      setUser(response.data.data);
    } catch (error: any) {
      console.error(
        "Failed to fetch user:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load user.",
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateUser = async (
    payload: UpdateUserPayload,
  ): Promise<UpdateUserResponse | null> => {
    if (!userId) {
      setUpdateError("User ID is required.");
      return null;
    }

    try {
      setUpdating(true);
      setUpdateError(null);

      const response =
        await api.put<UpdateUserResponse>(
          `/api/auth/admin/users/${userId}`,
          payload,
        );

      setUser(response.data.data);

      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to update user:",
        error,
      );

      setUpdateError(
        error.response?.data?.message ||
          "Failed to update user.",
      );

      return null;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    updating,
    error,
    updateError,
    fetchUser,
    updateUser,
  };
}
