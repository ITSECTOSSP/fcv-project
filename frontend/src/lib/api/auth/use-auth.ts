// This hook checks if the user is authenticated by verifying the presence of an auth token in local storage and making an API request to fetch the user's information. If the user is not authenticated, it redirects them to the login page. It also handles cases where the API is temporarily unavailable without logging the user out.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api/api";

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export function useAuth() {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }

        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/api/auth/user");

        if (!mounted) return;

        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error: any) {
        if (!mounted) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");

          setUser(null);
          setIsAuthenticated(false);

          navigate("/login", { replace: true });
          return;
        }

        // If the API itself is temporarily unavailable,
        // don't automatically destroy the user's session.
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
  };
}
