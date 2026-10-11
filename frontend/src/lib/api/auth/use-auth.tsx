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
import type { Employee } from "@/types/hr-fcv/employee";

/*
|--------------------------------------------------------------------------
| AUTH CONTEXT TYPE
|--------------------------------------------------------------------------
*/

interface AuthContextType {
  user: UserWithEmployee | null;
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setSession = useCallback((authUser: User) => {
    const authenticatedUser: UserWithEmployee = {
      ...authUser,
      employee: null,
    };

    setUser(authenticatedUser);
    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH AUTHENTICATED USER
  |--------------------------------------------------------------------------
  |
  | Auth-FCV provides account information.
  | HR-FCV provides the employee information linked to that account.
  |
  */

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setUser(null);
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
          /*
          | HR-FCV failure should not automatically invalidate
          | a valid Auth-FCV session.
          */

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

      if (employee) {
        console.log(
          "Employee Name:",
          [employee.first_name, employee.middle_name, employee.last_name]
            .filter(Boolean)
            .join(" "),
        );

        console.log("Employee Email:", employee.email);
        console.log("Contact Number:", employee.contact_number);
        console.log("Section:", employee.section?.name ?? "—");
        console.log("Division:", employee.section?.division?.name ?? "—");
        console.log("Employee Status:", employee.status);
      } else {
        console.log("No HR-FCV employee information was loaded.");
      }

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

        setUser(null);
        setIsAuthenticated(false);
      } else {
        /*
        | Keep the token when the API is temporarily unavailable.
        | AuthGuard can use isAuthenticated and isCheckingAuth
        | to decide whether to render protected routes.
        */

        setUser(null);
        setIsAuthenticated(false);

        console.error("Failed to verify the authenticated user.", error);
      }
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

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
      // The Axios interceptor automatically attaches auth_token.
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
      // Clear local authentication regardless of API availability.
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      window.dispatchEvent(new Event("auth-token-changed"));

      // Clear the shared React authentication state.
      setUser(null);
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
