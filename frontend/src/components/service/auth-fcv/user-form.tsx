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
import {
  AlertCircle,
  Save,
  UserPlus,
} from "lucide-react";
import { useEffect } from "react";

import { useCreateUser } from "@/lib/hook/auth-fcv/create-user";
import { useEditUser } from "@/lib/hook/auth-fcv/edit-user";
import { useUsers } from "@/lib/hook/auth-fcv/fetch-users";

import type {
  UserStatus,
} from "@/types/auth-fcv/user";

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string | null;
  status: UserStatus;
};

type UserFormProps = {
  mode: "create" | "edit";
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

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
          <Skeleton
            height={22}
            width={180}
            radius="sm"
          />

          <Skeleton
            height={14}
            width="55%"
            radius="sm"
          />
        </Stack>

        <Divider />

        {/* Name */}
        <Stack gap={8}>
          <Skeleton
            height={14}
            width={70}
            radius="sm"
          />

          <Skeleton
            height={42}
            radius="sm"
          />
        </Stack>

        {/* Email */}
        <Stack gap={8}>
          <Skeleton
            height={14}
            width={105}
            radius="sm"
          />

          <Skeleton
            height={42}
            radius="sm"
          />
        </Stack>

        <Divider />

        {/* Account Access */}
        <Stack gap="sm">
          <Skeleton
            height={22}
            width={150}
            radius="sm"
          />

          <Skeleton
            height={14}
            width="50%"
            radius="sm"
          />
        </Stack>

        {/* Role + Status */}
        <Group
          grow
          align="flex-start"
          gap="md"
        >
          <Stack gap={8}>
            <Skeleton
              height={14}
              width={45}
              radius="sm"
            />

            <Skeleton
              height={42}
              radius="sm"
            />

            <Skeleton
              height={11}
              width="80%"
              radius="sm"
            />
          </Stack>

          <Stack gap={8}>
            <Skeleton
              height={14}
              width={105}
              radius="sm"
            />

            <Skeleton
              height={36}
              radius="sm"
            />

            <Skeleton
              height={11}
              width="85%"
              radius="sm"
            />
          </Stack>
        </Group>

        <Divider />

        {/* Actions */}
        <Group justify="flex-end" gap="sm">
          <Skeleton
            height={36}
            width={85}
            radius="sm"
          />

          <Skeleton
            height={36}
            width={125}
            radius="sm"
          />
        </Group>
      </Stack>
    </Card>
  );
}

export default function UserForm({
  mode,
  userId,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const isEdit = mode === "edit";

  const {
    roles,
    loadingFilters,
    filterError,
  } = useUsers();

  const {
    createUser,
    loading: creating,
    error: createError,
  } = useCreateUser();

  const {
    user: fetchedUser,
    loading: loadingUser,
    updateUser,
    updating,
    updateError,
  } = useEditUser(
    isEdit ? userId : undefined,
  );

  const loading = creating || updating;

  const formLoading =
    isEdit && loadingUser;

  const error = isEdit
    ? updateError
    : createError;

  const form =
    useForm<UserFormValues>({
      initialValues: {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role_id: null,
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
          /^\S+@\S+\.\S+$/.test(value)
            ? null
            : "Enter a valid email address.",

        password: (value) => {
          if (isEdit) {
            return null;
          }

          return value.length < 8
            ? "Password must be at least 8 characters."
            : null;
        },

        password_confirmation: (
          value,
          values,
        ) => {
          if (isEdit) {
            return null;
          }

          return value !== values.password
            ? "Passwords do not match."
            : null;
        },
      },
    });

  /*
   * Populate form when editing
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
      status: fetchedUser.status,
    });
  }, [isEdit, fetchedUser]);

  const handleSubmit = async (
    values: UserFormValues,
  ) => {
    if (isEdit) {
      const response = await updateUser({
        name: values.name.trim(),
        email: values.email.trim(),
        role_id: values.role_id,
        status: values.status,
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
      password_confirmation:
        values.password_confirmation,
      role_id: values.role_id,
      status: values.status,
    });

    if (response) {
      onSuccess?.();
    }
  };

  return (
    <>
      {error && (
        <Alert
          icon={<AlertCircle size={18} />}
          color="red"
          variant="light"
          title={
            isEdit
              ? "Unable to update user"
              : "Unable to create user"
          }
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

      {formLoading ? (
        <UserFormSkeleton />
      ) : (
        <Card
          withBorder
          radius="md"
          padding="xl"
          style={{
            backgroundColor:
              "var(--surface)",
            borderColor:
              "var(--border)",
          }}
        >
          <form
            onSubmit={form.onSubmit(
              handleSubmit,
            )}
          >
            <Stack gap="xl">
              {/* Account Information */}
              <Stack gap={4}>
                <Text
                  fw={600}
                  size="lg"
                  c="var(--text-h)"
                >
                  Account Information
                </Text>

                <Text
                  size="sm"
                  c="var(--text-muted)"
                >
                  {isEdit
                    ? "Update the basic information for this system account."
                    : "Provide the basic information for the new system account."}
                </Text>
              </Stack>

              <Divider />

              {/* Username */}
              <TextInput
                label="Username"
                placeholder="Enter username"
                required
                size="md"
                {...form.getInputProps(
                  "name",
                )}
              />

              {/* Email */}
              <TextInput
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                required
                size="md"
                {...form.getInputProps(
                  "email",
                )}
              />

              {/* Password - Create only */}
              {!isEdit && (
                <Group
                  grow
                  align="flex-start"
                  gap="md"
                >
                  <PasswordInput
                    label="Password"
                    placeholder="Enter password"
                    description="Minimum of 8 characters"
                    required
                    size="md"
                    {...form.getInputProps(
                      "password",
                    )}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    required
                    size="md"
                    {...form.getInputProps(
                      "password_confirmation",
                    )}
                  />
                </Group>
              )}

              <Divider />

              {/* Account Access */}
              <Stack gap={4}>
                <Text
                  fw={600}
                  size="lg"
                  c="var(--text-h)"
                >
                  Account Access
                </Text>

                <Text
                  size="sm"
                  c="var(--text-muted)"
                >
                  Configure the user's role and
                  account status.
                </Text>
              </Stack>

              <Group
                grow
                align="flex-start"
                gap="md"
              >
                {/* Role */}
                <Select
                  label="Role"
                  placeholder={
                    loadingFilters
                      ? "Loading roles..."
                      : "Select a role"
                  }
                  description="The role determines the user's access level."
                  data={roles}
                  clearable
                  searchable
                  disabled={
                    loadingFilters ||
                    loading
                  }
                  size="md"
                  {...form.getInputProps(
                    "role_id",
                  )}
                />

                {/* Status */}
                <Stack gap={5}>
                  <Text
                    component="label"
                    size="sm"
                    fw={500}
                    c="var(--text-h)"
                  >
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
                    {...form.getInputProps(
                      "status",
                    )}
                  />

                  <Text
                    size="xs"
                    c="var(--text-muted)"
                  >
                    Inactive accounts cannot be
                    used to access the system.
                  </Text>
                </Stack>
              </Group>

              <Divider />

              {/* Actions */}
              <Group
                justify="flex-end"
                gap="sm"
              >
                <Button
                  variant="default"
                  onClick={onCancel}
                  disabled={loading}
                >
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
                      backgroundColor:
                        "var(--accent)",

                      "&:hover": {
                        backgroundColor:
                          "var(--accent-hover)",
                      },
                    },
                  }}
                >
                  {isEdit
                    ? "Save Changes"
                    : "Create User"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      )}
    </>
  );
}
