import type { Role } from "./role";
import type { Permission } from "./permission";

export type UserStatus =
  | "active"
  | "inactive";

export type User = {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  role: Role | null;
  permissions: Permission[];
};

export type UserFilters = {
  search?: string;
  status?: UserStatus | "";
  role_ids?: string[];
  permission_ids?: string[];
};

export type UserResponse = {
  current_page: number;
  data: User[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type UserOption = {
  value: string;
  label: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string | null;
  status: UserStatus;
};

export type CreateUserResponse = {
  message: string;
  data: User;
};
