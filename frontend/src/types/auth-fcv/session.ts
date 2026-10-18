export type UserSession = {
  id: string;
  user_id: number | string;
  token_id: string | number | null;
  ip_address: string | null;
  user_agent: string | null;
  logged_in_at: string | null;
  last_activity_at: string | null;
  logged_out_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginatedUserSessions = {
  data: UserSession[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type UserSessionFilters = {
  user_id: number | string;
  page?: number;
};
