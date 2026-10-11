import type {
  Employee,
  EmployeeFilters,
  EmployeePayload,
} from "@/types/hr-fcv/employee";

import type { PaginatedResponse } from "@/types/pagination";

import api from "@/lib/api/api";

export const employeeApi = {
  /*
  |--------------------------------------------------------------------------
  | GET EMPLOYEES
  |--------------------------------------------------------------------------
  */
  index: (params?: EmployeeFilters) =>
    api.get<PaginatedResponse<Employee>>(
      "/api/hr/employees",
      {
        params,
      },
    ),

  /*
  |--------------------------------------------------------------------------
  | GET EMPLOYEE
  |--------------------------------------------------------------------------
  */
  show: (id: string) =>
    api.get<{
      data: Employee;
    }>(
      `/api/hr/employees/${id}`,
    ),

  /*
  |--------------------------------------------------------------------------
  | CREATE EMPLOYEE
  |--------------------------------------------------------------------------
  */
  store: (data: EmployeePayload) =>
    api.post<{
      message: string;
      data: Employee;
    }>(
      "/api/hr/employees",
      data,
    ),

  /*
  |--------------------------------------------------------------------------
  | UPDATE EMPLOYEE
  |--------------------------------------------------------------------------
  */
  update: (
    id: string,
    data: EmployeePayload,
  ) =>
    api.put<{
      message: string;
      data: Employee;
    }>(
      `/api/hr/employees/${id}`,
      data,
    ),

  /*
  |--------------------------------------------------------------------------
  | DELETE EMPLOYEE
  |--------------------------------------------------------------------------
  */
  destroy: (id: string) =>
    api.delete<{
      message: string;
    }>(
      `/api/hr/employees/${id}`,
    ),
};