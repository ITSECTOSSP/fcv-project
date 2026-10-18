import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "@/lib/api/api";

import type { User, UserWithEmployee } from "@/types/auth-fcv/user";
import type { Permission } from "@/types/auth-fcv/permission";
import type { Employee } from "@/types/hr-fcv/employee";

/*
|--------------------------------------------------------------------------
| AUTH CONTEXT TYPE
|--------------------------------------------------------------------------
*/

interface AuthContextType {
  user: UserWithEmployee | null;
  permissions: Permission[];
  hasPermission: (permission: string) => boolean;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  refreshAuth: () => Promise<void>;
  setSession: (user: User) => void;
  logout: () => Promise<void>;
}

/*
|--------------------------------------------------------------------------
| AUTH CONTEXT
|--------------------------------------------------------------------------
*/

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/*
|--------------------------------------------------------------------------
| AUTH PROVIDER
|--------------------------------------------------------------------------
*/

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithEmployee | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH CURRENT USER PERMISSIONS
  |--------------------------------------------------------------------------
  */

  const fetchPermissions = useCallback(async (): Promise<Permission[]> => {
    const response = await api.get<{ data: Permission[] }>(
      "/api/auth/user/permissions",
    );

    return response.data.data;
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CHECK USER PERMISSION
  |--------------------------------------------------------------------------
  */

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.some((item) => item.key === permission);
    },
    [permissions],
  );

  /*
  |--------------------------------------------------------------------------
  | SET SESSION AFTER LOGIN
  |--------------------------------------------------------------------------
  */

  const setSession = useCallback(
    (authUser: User) => {
      const authenticatedUser: UserWithEmployee = {
        ...authUser,
        employee: null,
      };

      setUser(authenticatedUser);
      setPermissions([]);
      setIsAuthenticated(true);
      setIsCheckingAuth(true);

      void fetchPermissions()
        .then((userPermissions) => {
          setPermissions(userPermissions);
        })
        .catch((error: unknown) => {
          // Fail closed: no permissions are granted if loading fails.
          setPermissions([]);
          console.error("Failed to load user permissions.", error);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    },
    [fetchPermissions],
  );

  /*
  |--------------------------------------------------------------------------
  | FETCH AUTHENTICATED USER
  |--------------------------------------------------------------------------
  |
  | Auth-FCV provides account information and permissions.
  | HR-FCV provides the linked employee information.
  |
  */

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | FETCH AUTH-FCV USER
      |--------------------------------------------------------------------------
      */

      const authResponse = await api.get<{ user: User }>("/api/auth/user");
      const authUser = authResponse.data.user;

      /*
      |--------------------------------------------------------------------------
      | FETCH CURRENT USER PERMISSIONS
      |--------------------------------------------------------------------------
      */

      const userPermissions = await fetchPermissions();
      setPermissions(userPermissions);

      /*
      |--------------------------------------------------------------------------
      | FETCH HR-FCV EMPLOYEE
      |--------------------------------------------------------------------------
      */

      let employee: Employee | null = null;

      if (authUser.employee_id) {
        try {
          const employeeResponse = await api.get<{
            data: Employee | null;
          }>("/api/hr/employees/me");

          employee = employeeResponse.data.data ?? null;
        } catch (employeeError: unknown) {
          // HR failure does not automatically invalidate a valid auth session.
          console.error(
            "Failed to load HR-FCV employee information.",
            employeeError,
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | COMBINE USER AND EMPLOYEE
      |--------------------------------------------------------------------------
      */

      const authenticatedUser: UserWithEmployee = {
        ...authUser,
        employee,
      };

      /*
      |--------------------------------------------------------------------------
      | DEBUG AUTHENTICATED USER
      |--------------------------------------------------------------------------
      */

      console.group(
        "%cFCV Authenticated User",
        "color: #C9A227; font-weight: bold; font-size: 14px;",
      );

      console.log("Auth-FCV User:", authUser);
      console.log("Auth-FCV User ID:", authUser.id);
      console.log("Name:", authUser.name);
      console.log("Email:", authUser.email);
      console.log("Role ID:", authUser.role_id);
      console.log("Account Status:", authUser.status);
      console.log("Employee ID:", authUser.employee_id);
      console.log("HR-FCV Employee:", employee);
      console.log("User Permissions:", userPermissions);
      console.log(
        "Permission Keys:",
        userPermissions.map((permission) => permission.key),
      );
      console.log("Complete Authenticated User:", authenticatedUser);

      console.groupEnd();

      /*
      |--------------------------------------------------------------------------
      | UPDATE SHARED AUTH STATE
      |--------------------------------------------------------------------------
      */

      setUser(authenticatedUser);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 401) {
        // The Auth-FCV token is invalid or expired.
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.dispatchEvent(new Event("auth-token-changed"));
      } else {
        console.error(
          "Failed to verify the authenticated user or load permissions.",
          error,
        );
      }

      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, [fetchPermissions]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL AUTHENTICATION CHECK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  /*
  |--------------------------------------------------------------------------
  | LOG OUT USER
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
        message?: string;
      };

      console.error("Logout API request failed:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      window.dispatchEvent(new Event("auth-token-changed"));

      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PROVIDE SHARED AUTH STATE
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        hasPermission,
        isAuthenticated,
        isCheckingAuth,
        refreshAuth,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| USE AUTH
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
