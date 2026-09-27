import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "@/lib/api/api";

import type {
  Permission,
  PermissionsResponse,
  UpdateUserPermissionsPayload,
  UpdateUserPermissionsResponse,
  UserPermissionsResponse,
} from "@/types/auth-fcv/permission";

export function useManageUserPermissions(
  userId: string | undefined,
) {
  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [
    selectedPermissionIds,
    setSelectedPermissionIds,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  const fetchPermissions =
    useCallback(async () => {
      if (!userId) {
        setPermissions([]);
        setSelectedPermissionIds([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          permissionsResponse,
          userPermissionsResponse,
        ] = await Promise.all([
          api.get<PermissionsResponse>(
            "/api/auth/admin/permissions",
          ),

          api.get<UserPermissionsResponse>(
            `/api/auth/admin/users/${userId}/permissions`,
          ),
        ]);

        const availablePermissions =
          permissionsResponse.data.data;

        const assignedPermissions =
          userPermissionsResponse.data.data;

        setPermissions(
          availablePermissions,
        );

        setSelectedPermissionIds(
          assignedPermissions.map(
            (permission) => permission.id,
          ),
        );
      } catch (error: any) {
        console.error(
          "Failed to fetch user permissions:",
          error,
        );

        setError(
          error.response?.data?.message ||
            "Failed to load permissions.",
        );
      } finally {
        setLoading(false);
      }
    }, [userId]);

  const updatePermissions =
    async (
      permissionIds: string[],
    ): Promise<
      UpdateUserPermissionsResponse | null
    > => {
      if (!userId) {
        setUpdateError(
          "User ID is required.",
        );

        return null;
      }

      try {
        setUpdating(true);
        setUpdateError(null);

        const payload: UpdateUserPermissionsPayload =
          {
            permission_ids: permissionIds,
          };

        const response =
          await api.put<UpdateUserPermissionsResponse>(
            `/api/auth/admin/users/${userId}/permissions`,
            payload,
          );

        setSelectedPermissionIds(
          permissionIds,
        );

        return response.data;
      } catch (error: any) {
        console.error(
          "Failed to update user permissions:",
          error,
        );

        setUpdateError(
          error.response?.data?.message ||
            "Failed to update user permissions.",
        );

        return null;
      } finally {
        setUpdating(false);
      }
    };

  const groupedPermissions =
    permissions.reduce(
      (groups, permission) => {
        if (!groups[permission.group]) {
          groups[permission.group] = [];
        }

        groups[permission.group].push(
          permission,
        );

        return groups;
      },
      {} as Record<string, Permission[]>,
    );

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    groupedPermissions,
    selectedPermissionIds,
    setSelectedPermissionIds,
    loading,
    updating,
    error,
    updateError,
    fetchPermissions,
    updatePermissions,
  };
}

