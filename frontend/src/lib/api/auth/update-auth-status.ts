import api from "@/lib/api/api";
import type { UserStatus } from "@/types/auth-fcv/user";
/* |-------------------------------------------------------------------------- | UPDATE USER STATUS RESPONSE |-------------------------------------------------------------------------- */ export type UpdateUserStatusResponse =
  {
    message: string;
    data: { id: string; status: UserStatus; employee_id: string | null };
  };
/* |-------------------------------------------------------------------------- | UPDATE USER STATUS |-------------------------------------------------------------------------- */ export async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<UpdateUserStatusResponse> {
  const response = await api.patch<UpdateUserStatusResponse>(
    `/api/auth/admin/users/${userId}/status`,
    { status },
  );
  return response.data;
}
