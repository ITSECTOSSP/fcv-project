import api from "@/lib/api/api";

import type {
  PaginatedUserSessions,
  UserSession,
  UserSessionFilters,
} from "@/types/auth-fcv/session";

export async function getUserSessions(
  filters: UserSessionFilters,
): Promise<PaginatedUserSessions> {
  const response = await api.get<PaginatedUserSessions>("/api/auth/sessions", {
    params: filters,
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
}

export async function getActiveUserSessions(
  userId: string | number,
): Promise<UserSession[]> {
  const response = await api.get<{ data: UserSession[] }>(
    "/api/auth/sessions/active",
    {
      params: { user_id: userId },
      headers: { Accept: "application/json" },
    },
  );

  return response.data.data;
}

export async function getUserSession(id: string): Promise<UserSession> {
  const response = await api.get<{ data: UserSession }>(
    `/api/auth/sessions/${encodeURIComponent(id)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  return response.data.data;
}
