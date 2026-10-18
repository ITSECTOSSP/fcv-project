import api from "@/lib/api/api";
import type {
  AuditLog,
  AuditLogFilters,
  PaginatedAuditLogs,
} from "@/types/auth-fcv/audit-log";

const AUDIT_LOGS_ENDPOINT = "/api/auth/audit-logs";

export async function getAuditLogs(
  filters: AuditLogFilters = {},
): Promise<PaginatedAuditLogs> {
  const response = await api.get(AUDIT_LOGS_ENDPOINT, {
    params: filters,
  });

  const body = response.data;

  // console.log("Raw audit logs response:", body);

  // Supports Laravel's standard paginator:
  // { data: [...], current_page: 1, ... }
  //
  // Also supports a wrapped paginator:
  // { data: { data: [...], current_page: 1, ... } }
  const pagination =
    body?.data && !Array.isArray(body.data)
      ? body.data
      : body;

  return {
    data: Array.isArray(pagination?.data) ? pagination.data : [],
    current_page: pagination?.current_page ?? 1,
    last_page: pagination?.last_page ?? 1,
    per_page: pagination?.per_page ?? 15,
    total: pagination?.total ?? 0,
    from: pagination?.from ?? null,
    to: pagination?.to ?? null,
  };
}

export async function getAuditLog(id: string): Promise<AuditLog> {
  const response = await api.get<{ data: AuditLog }>(
    `${AUDIT_LOGS_ENDPOINT}/${id}`,
  );

  return response.data.data;
}