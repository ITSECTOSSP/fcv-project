import { useCallback, useEffect, useState } from "react";

import api from "@/lib/api/api";

import type {
  Permission,
  PermissionOption,
  PermissionsResponse,
} from "@/types/auth-fcv/permission";

import type { Role, RoleOption, RolesResponse } from "@/types/auth-fcv/role";

import type {
  UserFilters,
  UserResponse,
  UserWithEmployee,
} from "@/types/auth-fcv/user";

import type { Employee } from "@/types/hr-fcv/employee";

export function useUsers(filters: UserFilters = {}) {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [users, setUsers] = useState<UserWithEmployee[]>([]);

  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [permissions, setPermissions] = useState<PermissionOption[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingFilters, setLoadingFilters] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [filterError, setFilterError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH USERS
  |--------------------------------------------------------------------------
  */

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      /*
      |--------------------------------------------------------------------------
      | GET AUTH-FCV USERS
      |--------------------------------------------------------------------------
      */

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

      const authUsers = response.data.data;

      /*
      |--------------------------------------------------------------------------
      | LOAD HR-FCV EMPLOYEES
      |--------------------------------------------------------------------------
      |
      | Auth-FCV only stores employee_id.
      | The actual employee information belongs to HR-FCV.
      |
      */

      const usersWithEmployees: UserWithEmployee[] = await Promise.all(
        authUsers.map(async (user) => {
          let employee: Employee | null = null;

          if (user.employee_id) {
            try {
              const employeeResponse = await api.get<{
                data: Employee;
              }>(`/api/hr/employees/${user.employee_id}`);

              employee = employeeResponse.data.data;
            } catch (employeeError) {
              /*
                |--------------------------------------------------------------------------
                | EMPLOYEE LOOKUP FAILED
                |--------------------------------------------------------------------------
                |
                | Keep the user in the table even if HR-FCV
                | cannot return the employee.
                |
                */

              console.error(
                `Failed to load employee ${user.employee_id} for user ${user.id}:`,
                employeeError,
              );
            }
          }

          return {
            ...user,
            employee,
          };
        }),
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE USERS
      |--------------------------------------------------------------------------
      */

      setUsers(usersWithEmployees);
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
  |--------------------------------------------------------------------------
  | FETCH ROLE AND PERMISSION FILTER OPTIONS
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | EFFECTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
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
