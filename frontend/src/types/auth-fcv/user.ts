import type { Employee } from "@/types/hr-fcv/employee";
import type { Permission } from "./permission";
import type { Role } from "./role";

/*
 * |--------------------------------------------------------------------------
 * | USER STATUS
 * |--------------------------------------------------------------------------
 */

export type UserStatus = "active" | "inactive";

/*
 * |--------------------------------------------------------------------------
 * | USER
 * |--------------------------------------------------------------------------
 */

export interface User {
  id: string;

  name: string;

  email: string;

  role_id: string | null;

  /*
   * HR-FCV employee UUID.
   *
   * This is only the cross-service reference.
   * The actual employee information is owned by HR-FCV.
   */
  employee_id: string | null;

  status: UserStatus;

  created_at: string;

  updated_at: string;

  role: Role | null;

  permissions: Permission[];
}

/*
 * |--------------------------------------------------------------------------
 * | USER WITH EMPLOYEE
 * |--------------------------------------------------------------------------
 *
 * Use this when the frontend has loaded the employee information
 * from HR-FCV.
 *
 * The Employee type is reused directly from hr-fcv.
 */

export interface UserWithEmployee extends User {
  employee: Employee | null;
}

/*
 * |--------------------------------------------------------------------------
 * | USER FILTERS
 * |--------------------------------------------------------------------------
 */

export interface UserFilters {
  search?: string;

  status?: UserStatus | "";

  role_ids?: string[];

  permission_ids?: string[];

  employee_id?: string;

  page?: number;

  per_page?: number;
}

/*
 * |--------------------------------------------------------------------------
 * | USER RESPONSE
 * |--------------------------------------------------------------------------
 */

export interface UserResponse {
  current_page: number;

  data: User[];

  first_page_url: string;

  from: number | null;

  last_page: number;

  last_page_url: string;

  per_page: number;

  to: number | null;

  total: number;
}

/*
 * |--------------------------------------------------------------------------
 * | USER OPTION
 * |--------------------------------------------------------------------------
 */

export interface UserOption {
  value: string;

  label: string;
}

/*
 * |--------------------------------------------------------------------------
 * | EMPLOYEE OPTION
 * |--------------------------------------------------------------------------
 *
 * Used when selecting an HR-FCV employee while creating
 * or editing an Auth-FCV user.
 */

export interface EmployeeOption {
  value: string;

  label: string;

  employee?: Employee;
}

/*
 * |--------------------------------------------------------------------------
 * | CREATE USER PAYLOAD
 * |--------------------------------------------------------------------------
 */

export interface CreateUserPayload {
  name: string;

  email: string;

  password: string;

  password_confirmation: string;

  role_id: string | null;

  /*
   * HR-FCV employee UUID.
   *
   * Null means the Auth-FCV account is not linked
   * to an HR-FCV employee.
   */
  employee_id: string | null;

  status: UserStatus;
}

/*
 * |--------------------------------------------------------------------------
 * | UPDATE USER PAYLOAD
 * |--------------------------------------------------------------------------
 */

export interface UpdateUserPayload {
  name: string;

  email: string;

  /*
   * Optional when changing other user information.
   */
  password?: string;

  password_confirmation?: string;

  role_id: string | null;

  /*
   * Assign or remove the HR-FCV employee.
   */
  employee_id: string | null;

  status?: UserStatus;
}

/*
 * |--------------------------------------------------------------------------
 * | CREATE USER RESPONSE
 * |--------------------------------------------------------------------------
 */

export interface CreateUserResponse {
  message: string;

  data: User;
}

/*
 * |--------------------------------------------------------------------------
 * | UPDATE USER RESPONSE
 * |--------------------------------------------------------------------------
 */

export interface UpdateUserResponse {
  message: string;

  data: User;
}

/*
 * |--------------------------------------------------------------------------
 * | AUTHENTICATED USER RESPONSE
 * |--------------------------------------------------------------------------
 *
 * GET /api/auth/user
 *
 * Auth-FCV returns the account and employee_id.
 */

export interface AuthUserResponse {
  user: User;
}

/*
 * |--------------------------------------------------------------------------
 * | AUTHENTICATED USER WITH EMPLOYEE
 * |--------------------------------------------------------------------------
 *
 * Frontend representation after HR-FCV employee information
 * has also been loaded.
 */

export interface AuthUserWithEmployeeResponse {
  user: UserWithEmployee;
}

/*
 * |--------------------------------------------------------------------------
 * | MY EMPLOYEE RESPONSE
 * |--------------------------------------------------------------------------
 *
 * GET /api/hr/me
 */

export interface MyEmployeeResponse {
  data: Employee | null;
}
