
export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  service: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  module: string;
  record_id: string | null;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  user?: AuditLogUser | null;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AuditLogFilters {
  user_id?: string;
  service?: string;
  action?: "CREATE" | "UPDATE" | "DELETE";
  module?: string;
  page?: number;
}
