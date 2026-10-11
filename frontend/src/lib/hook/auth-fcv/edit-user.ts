import { useCallback, useEffect, useState } from "react";

import api from "@/lib/api/api";

import type {
  User,
  UpdateUserPayload,
  UserStatus,
} from "@/types/auth-fcv/user";

/*
|--------------------------------------------------------------------------
| GET USER RESPONSE
|--------------------------------------------------------------------------
*/

export type GetUserResponse = {
  data: User;
};

/*
|--------------------------------------------------------------------------
| UPDATE USER RESPONSE
|--------------------------------------------------------------------------
*/

export type UpdateUserResponse = {
  message: string;
  data: User;
};

/*
|--------------------------------------------------------------------------
| UPDATE USER STATUS RESPONSE
|--------------------------------------------------------------------------
*/

export type UpdateUserStatusResponse = {
  message: string;
  data: {
    id: string;
    status: UserStatus;
    employee_id: string | null;
  };
};

/*
|--------------------------------------------------------------------------
| USE EDIT USER
|--------------------------------------------------------------------------
*/

export function useEditUser(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [updateError, setUpdateError] = useState<string | null>(null);

  const [statusError, setStatusError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH USER
  |--------------------------------------------------------------------------
  */

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<GetUserResponse>(
        `/api/auth/admin/users/${userId}`,
      );

      setUser(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch user:", error);

      setError(error.response?.data?.message || "Failed to load user.");

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE USER
  |--------------------------------------------------------------------------
  */

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

      const response = await api.put<UpdateUserResponse>(
        `/api/auth/admin/users/${userId}`,
        payload,
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE LOCAL USER
      |--------------------------------------------------------------------------
      */

      setUser(response.data.data);

      return response.data;
    } catch (error: any) {
      console.error("Failed to update user:", error);

      setUpdateError(error.response?.data?.message || "Failed to update user.");

      return null;
    } finally {
      setUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE USER STATUS
  |--------------------------------------------------------------------------
  |
  | This uses the dedicated backend endpoint:
  |
  | PATCH /api/auth/admin/users/{user}/status
  |
  */

  const updateStatus = async (
    status: UserStatus,
  ): Promise<UpdateUserStatusResponse | null> => {
    if (!userId) {
      setStatusError("User ID is required.");

      return null;
    }

    try {
      setUpdatingStatus(true);
      setStatusError(null);

      const response = await api.patch<UpdateUserStatusResponse>(
        `/api/auth/admin/users/${userId}/status`,
        {
          status,
        },
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE LOCAL USER
      |--------------------------------------------------------------------------
      |
      | The status endpoint only returns:
      |
      | - id
      | - status
      | - employee_id
      |
      | Therefore, merge the returned values into
      | the existing user object rather than replacing
      | the entire user.
      |
      */

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,
          status: response.data.data.status,
          employee_id: response.data.data.employee_id,
        };
      });

      return response.data;
    } catch (error: any) {
      console.error("Failed to update user status:", error);

      setStatusError(
        error.response?.data?.message || "Failed to update user status.",
      );

      return null;
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return {
    user,

    loading,

    updating,

    updatingStatus,

    error,

    updateError,

    statusError,

    fetchUser,

    updateUser,

    updateStatus,
  };
}
