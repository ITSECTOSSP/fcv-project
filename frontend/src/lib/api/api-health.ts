// This hook checks the health status of the API by making a request to the health endpoint. It manages the health status state and provides a function to manually check the health status when needed. The hook returns the current health status and boolean flags indicating whether the API is checking, online, or offline.
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api/api";

type ApiHealthStatus = "checking" | "online" | "offline";

interface ApiHealthResponse {
    status: string;
    service?: string;
}

export function useApiHealth() {
    const [status, setStatus] =
        useState<ApiHealthStatus>("checking");

    const checkHealth = useCallback(async () => {
        setStatus("checking");

        try {
            const response =
                await api.get<ApiHealthResponse>(
                    "/api/auth/health",
                );

            if (response.data?.status === "ok") {
                setStatus("online");
            } else {
                setStatus("offline");
            }
        } catch {
            setStatus("offline");
        }
    }, []);

    useEffect(() => {
        checkHealth();
    }, [checkHealth]);

    return {
        status,
        isChecking: status === "checking",
        isOnline: status === "online",
        isOffline: status === "offline",
        checkHealth,
    };
}