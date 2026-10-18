import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  PasswordInput,
  Select,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

import { useForm } from "@mantine/form";

import { AlertCircle, Save, UserPlus } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useCreateUser } from "@/lib/hook/auth-fcv/create-user";
import { useEditUser } from "@/lib/hook/auth-fcv/edit-user";
import { useUsers } from "@/lib/hook/auth-fcv/fetch-users";

import { employeeApi } from "@/lib/api/hr-fcv/employee";

import type { UserStatus } from "@/types/auth-fcv/user";

import type { Employee } from "@/types/hr-fcv/employee";

/*
|--------------------------------------------------------------------------
| USER FORM VALUES
|--------------------------------------------------------------------------
*/

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string | null;
  employee_id: string | null;
  status: UserStatus;
};

/*
|--------------------------------------------------------------------------
| USER FORM PROPS
|--------------------------------------------------------------------------
*/

type UserFormProps = {
  mode: "create" | "edit";
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

/*
|--------------------------------------------------------------------------
| USER FORM SKELETON
|--------------------------------------------------------------------------
*/

function UserFormSkeleton() {
  return (
    <Card
      withBorder
      radius="md"
      padding="xl"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <Stack gap="xl">
        {/* Account Information */}

        <Stack gap="sm">
          <Skeleton height={22} width={180} radius="sm" />

          <Skeleton height={14} width="55%" radius="sm" />
        </Stack>

        <Divider />

        {/* Name */}

        <Stack gap={8}>
          <Skeleton height={14} width={70} radius="sm" />

          <Skeleton height={42} radius="sm" />
        </Stack>

        {/* Email */}

        <Stack gap={8}>
          <Skeleton height={14} width={105} radius="sm" />

          <Skeleton height={42} radius="sm" />
        </Stack>

        {/* Employee */}

        <Stack gap={8}>
          <Skeleton height={14} width={85} radius="sm" />

          <Skeleton height={42} radius="sm" />
        </Stack>

        <Divider />

        {/* Account Access */}

        <Stack gap="sm">
          <Skeleton height={22} width={150} radius="sm" />

          <Skeleton height={14} width="50%" radius="sm" />
        </Stack>

        {/* Role + Status */}

        <Group grow align="flex-start" gap="md">
          <Stack gap={8}>
            <Skeleton height={14} width={45} radius="sm" />

            <Skeleton height={42} radius="sm" />

            <Skeleton height={11} width="80%" radius="sm" />
          </Stack>

          <Stack gap={8}>
            <Skeleton height={14} width={105} radius="sm" />

            <Skeleton height={36} radius="sm" />

            <Skeleton height={11} width="85%" radius="sm" />
          </Stack>
        </Group>

        <Divider />

        {/* Actions */}

        <Group justify="flex-end" gap="sm">
          <Skeleton height={36} width={85} radius="sm" />

          <Skeleton height={36} width={125} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}

/*
|--------------------------------------------------------------------------
| USER FORM
|--------------------------------------------------------------------------
*/

export default function UserForm({
  mode,
  userId,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const isEdit = mode === "edit";

  /*
  |--------------------------------------------------------------------------
  | AUTH USER DATA
  |--------------------------------------------------------------------------
  */

  const { roles, loadingFilters, filterError } = useUsers();

  /*
  |--------------------------------------------------------------------------
  | CREATE USER
  |--------------------------------------------------------------------------
  */

  const { createUser, loading: creating, error: createError } = useCreateUser();

  /*
  |--------------------------------------------------------------------------
  | EDIT USER
  |--------------------------------------------------------------------------
  */

  const {
    user: fetchedUser,
    loading: loadingUser,
    updateUser,
    updating,
    updateError,
  } = useEditUser(isEdit ? userId : undefined);

  /*
  |--------------------------------------------------------------------------
  | EMPLOYEE STATE
  |--------------------------------------------------------------------------
  */

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [employeeError, setEmployeeError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const loading = creating || updating;

  const formLoading = isEdit && loadingUser;

  const error = isEdit ? updateError : createError;

  const form = useForm<UserFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_id: null,
      employee_id: null,
      status: "active",
    },

    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name is required."
          : value.trim().length > 255
            ? "Name must not exceed 255 characters."
            : null,

      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address.",

      password: (value) => {
        // Password is optional when editing a user.
        if (isEdit && !value) {
          return null;
        }

        return value.length < 8
          ? "Password must be at least 8 characters."
          : null;
      },

      password_confirmation: (value, values) => {
        // Confirmation is optional when no new password is entered.
        if (isEdit && !values.password) {
          return null;
        }

        if (!values.password) {
          return null;
        }

        return value !== values.password ? "Passwords do not match." : null;
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH EMPLOYEES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setEmployeeError(null);

      try {
        const response = await employeeApi.index({
          status: "active",
          per_page: 1000,
        });

        if (!mounted) {
          return;
        }

        setEmployees(response.data.data);
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error("Failed to load HR-FCV employees.", error);

        setEmployeeError("Unable to load employees from HR-FCV.");
      } finally {
        if (mounted) {
          setLoadingEmployees(false);
        }
      }
    };

    fetchEmployees();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | EMPLOYEE OPTIONS
  |--------------------------------------------------------------------------
  */

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: employee.middle_name
          ? `${employee.first_name} ${employee.middle_name} ${employee.last_name}`
          : `${employee.first_name} ${employee.last_name}`,
      })),
    [employees],
  );

  /*
  |--------------------------------------------------------------------------
  | SELECTED EMPLOYEE
  |--------------------------------------------------------------------------
  */

  const selectedEmployee = useMemo(
    () =>
      employees.find((employee) => employee.id === form.values.employee_id) ??
      null,
    [employees, form.values.employee_id],
  );

  /*
  |--------------------------------------------------------------------------
  | POPULATE FORM WHEN EDITING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isEdit || !fetchedUser) {
      return;
    }

    form.setValues({
      name: fetchedUser.name,
      email: fetchedUser.email,
      password: "",
      password_confirmation: "",
      role_id: fetchedUser.role_id,
      employee_id: fetchedUser.employee_id,
      status: fetchedUser.status,
    });
  }, [isEdit, fetchedUser]);

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (values: UserFormValues) => {
    const newPassword = values.password.trim();

    if (isEdit) {
      const response = await updateUser({
        name: values.name.trim(),
        email: values.email.trim(),
        role_id: values.role_id,
        employee_id: values.employee_id,
        status: values.status,

        ...(newPassword
          ? {
              password: newPassword,
              password_confirmation: values.password_confirmation,
            }
          : {}),
      });

      if (response) {
        onSuccess?.();
      }

      return;
    }

    const response = await createUser({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      password_confirmation: values.password_confirmation,
      role_id: values.role_id,
      employee_id: values.employee_id,
      status: values.status,
    });

    if (response) {
      onSuccess?.();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {error && (
        <Alert
          icon={<AlertCircle size={18} />}
          color="red"
          variant="light"
          title={isEdit ? "Unable to update user" : "Unable to create user"}
          mb="md"
        >
          {error}
        </Alert>
      )}

      {filterError && (
        <Alert
          icon={<AlertCircle size={18} />}
          color="red"
          variant="light"
          title="Unable to load roles"
          mb="md"
        >
          {filterError}
        </Alert>
      )}

      {employeeError && (
        <Alert
          icon={<AlertCircle size={18} />}
          color="red"
          variant="light"
          title="Unable to load employees"
          mb="md"
        >
          {employeeError}
        </Alert>
      )}

      {formLoading ? (
        <UserFormSkeleton />
      ) : (
        <Card
          withBorder
          radius="md"
          padding="xl"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xl">
              {/*
              |--------------------------------------------------------------------------
              | ACCOUNT INFORMATION
              |--------------------------------------------------------------------------
              */}

              <Stack gap={4}>
                <Text fw={600} size="lg" c="var(--text-h)">
                  Account Information
                </Text>

                <Text size="sm" c="var(--text-muted)">
                  {isEdit
                    ? "Update the basic information for this system account."
                    : "Provide the basic information for the new system account."}
                </Text>
              </Stack>

              <Divider />

              {/*
              |--------------------------------------------------------------------------
              | USERNAME
              |--------------------------------------------------------------------------
              */}

              <TextInput
                label="Username"
                placeholder="Enter username"
                required
                size="md"
                disabled={loading}
                {...form.getInputProps("name")}
              />

              {/*
              |--------------------------------------------------------------------------
              | EMAIL
              |--------------------------------------------------------------------------
              */}

              <TextInput
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                required
                size="md"
                disabled={loading}
                {...form.getInputProps("email")}
              />

              {/*
              |--------------------------------------------------------------------------
              | EMPLOYEE
              |--------------------------------------------------------------------------
              */}

              <Select
                label="Employee"
                placeholder={
                  loadingEmployees ? "Loading employees..." : "Select employee"
                }
                description="Link this system account to an HR-FCV employee."
                data={employeeOptions}
                searchable
                clearable
                disabled={loadingEmployees || loading}
                nothingFoundMessage={
                  loadingEmployees
                    ? "Loading employees..."
                    : "No active employees found."
                }
                size="md"
                {...form.getInputProps("employee_id")}
              />

              {/*
              |--------------------------------------------------------------------------
              | SELECTED EMPLOYEE INFORMATION
              |--------------------------------------------------------------------------
              */}

              {selectedEmployee && (
                <Card
                  withBorder
                  radius="md"
                  padding="md"
                  style={{
                    backgroundColor: "var(--surface-hover)",
                    borderColor: "var(--border)",
                  }}
                >
                  <Stack gap="xs">
                    <Text size="sm" fw={600} c="var(--text-h)">
                      Employee Information
                    </Text>

                    <Group gap="xl" align="flex-start">
                      <div>
                        <Text size="xs" c="var(--text-muted)">
                          Employee
                        </Text>

                        <Text size="sm" fw={500}>
                          {selectedEmployee.middle_name
                            ? `${selectedEmployee.first_name} ${selectedEmployee.middle_name} ${selectedEmployee.last_name}`
                            : `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="var(--text-muted)">
                          Section
                        </Text>

                        <Text size="sm" fw={500}>
                          {selectedEmployee.section?.name ?? "—"}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="var(--text-muted)">
                          Division
                        </Text>

                        <Text size="sm" fw={500}>
                          {selectedEmployee.section?.division?.name ?? "—"}
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              )}

              {/*
              |--------------------------------------------------------------------------
              | PASSWORD
              |--------------------------------------------------------------------------
              */}

              <Stack gap="sm">
                <Text fw={600} size="lg" c="var(--text-h)">
                  {isEdit ? "Change Password" : "Set Password"}
                </Text>

                <Text size="sm" c="var(--text-muted)">
                  {isEdit
                    ? "Leave both fields blank to keep the current password."
                    : "Set a password for the new system account."}
                </Text>
              </Stack>

              <Group grow align="flex-start" gap="md">
                <PasswordInput
                  label={isEdit ? "New Password" : "Password"}
                  placeholder={
                    isEdit ? "Enter new password (optional)" : "Enter password"
                  }
                  description="Minimum of 8 characters"
                  required={!isEdit}
                  size="md"
                  disabled={loading}
                  autoComplete="new-password"
                  {...form.getInputProps("password")}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder={
                    isEdit ? "Confirm new password" : "Re-enter password"
                  }
                  required={!isEdit}
                  size="md"
                  disabled={loading}
                  autoComplete="new-password"
                  {...form.getInputProps("password_confirmation")}
                />
              </Group>

              <Divider />

              {/*
              |--------------------------------------------------------------------------
              | ACCOUNT ACCESS
              |--------------------------------------------------------------------------
              */}

              <Stack gap={4}>
                <Text fw={600} size="lg" c="var(--text-h)">
                  Account Access
                </Text>

                <Text size="sm" c="var(--text-muted)">
                  Configure the user's role and account status.
                </Text>
              </Stack>

              <Group grow align="flex-start" gap="md">
                {/*
                |--------------------------------------------------------------------------
                | ROLE
                |--------------------------------------------------------------------------
                */}

                <Select
                  label="Role"
                  placeholder={
                    loadingFilters ? "Loading roles..." : "Select a role"
                  }
                  description="The role determines the user's access level."
                  data={roles}
                  clearable
                  searchable
                  disabled={loadingFilters || loading}
                  size="md"
                  {...form.getInputProps("role_id")}
                />

                {/*
                |--------------------------------------------------------------------------
                | STATUS
                |--------------------------------------------------------------------------
                */}

                <Stack gap={5}>
                  <Text component="label" size="sm" fw={500} c="var(--text-h)">
                    Account Status
                  </Text>

                  <SegmentedControl
                    fullWidth
                    data={[
                      {
                        label: "Active",
                        value: "active",
                      },
                      {
                        label: "Inactive",
                        value: "inactive",
                      },
                    ]}
                    size="md"
                    disabled={loading}
                    {...form.getInputProps("status")}
                  />

                  <Text size="xs" c="var(--text-muted)">
                    Inactive accounts cannot be used to access the system.
                  </Text>
                </Stack>
              </Group>

              <Divider />

              {/*
              |--------------------------------------------------------------------------
              | ACTIONS
              |--------------------------------------------------------------------------
              */}

              <Group justify="flex-end" gap="sm">
                <Button variant="default" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={loading}
                  leftSection={
                    !loading ? (
                      isEdit ? (
                        <Save size={17} />
                      ) : (
                        <UserPlus size={17} />
                      )
                    ) : undefined
                  }
                  styles={{
                    root: {
                      backgroundColor: "var(--accent)",

                      "&:hover": {
                        backgroundColor: "var(--accent-hover)",
                      },
                    },
                  }}
                >
                  {isEdit ? "Save Changes" : "Create User"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      )}
    </>
  );
}
