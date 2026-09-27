import { useCallback, useEffect, useState } from "react";

import api from "@/lib/api/api";

import type {
  Permission,
  PermissionOption,
  PermissionsResponse,
} from "@/types/auth-fcv/permission";

import type { Role, RoleOption, RolesResponse } from "@/types/auth-fcv/role";

import type { User, UserFilters, UserResponse } from "@/types/auth-fcv/user";

export function useUsers(filters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);

  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [permissions, setPermissions] = useState<PermissionOption[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingFilters, setLoadingFilters] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [filterError, setFilterError] = useState<string | null>(null);

  /*
   * |--------------------------------------------------------------------------
   * | Fetch Users
   * |--------------------------------------------------------------------------
   */

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<UserResponse>("/api/auth/admin/users", {
        params: {
          search: filters.search || undefined,

          status: filters.status || undefined,

          role_ids: filters.role_ids?.length ? filters.role_ids : undefined,

          permission_ids: filters.permission_ids?.length
            ? filters.permission_ids
            : undefined,
        },

        paramsSerializer: {
          indexes: false,
        },
      });

      setUsers(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);

      setError(error.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.status,
    filters.role_ids,
    filters.permission_ids,
  ]);

  /*
   * |--------------------------------------------------------------------------
   * | Fetch Role and Permission Filter Options
   * |--------------------------------------------------------------------------
   */

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoadingFilters(true);
      setFilterError(null);

      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get<RolesResponse>("/api/auth/admin/roles"),

        api.get<PermissionsResponse>("/api/auth/admin/permissions"),
      ]);

      setRoles(
        rolesResponse.data.data.map((role: Role) => ({
          value: role.id,
          label: role.name,
        })),
      );

      setPermissions(
        permissionsResponse.data.data.map((permission: Permission) => ({
          value: permission.id,
          label: permission.name,
        })),
      );
    } catch (error: any) {
      console.error("Failed to fetch filter options:", error);

      setFilterError(
        error.response?.data?.message ||
          "Failed to load roles and permissions.",
      );
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  /*
   * |--------------------------------------------------------------------------
   * | Effects
   * |--------------------------------------------------------------------------
   */

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  /*
   * |--------------------------------------------------------------------------
   * | Return
   * |--------------------------------------------------------------------------
   */

  return {
    users,
    roles,
    permissions,

    loading,
    loadingFilters,

    error,
    filterError,

    fetchUsers,
    fetchFilterOptions,
  };
}
