import {
  ActionIcon,
  Badge,
  Box,
  Alert,
  Avatar,
  Button,
  Group,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  Divider,
  Title,
  SimpleGrid,
} from "@mantine/core";

import {
  Edit,
  KeyRound,
  MoreVertical,
  Power,
  UserRound,
  PowerOff,
} from "lucide-react";

import { useState } from "react";

import UserPermissionsModal from "@/components/service/auth-fcv/permission/permission-user";
import { updateUserStatus } from "@/lib/api/auth/update-auth-status";
import { useOnlineUsers } from "@/lib/hook/auth-fcv/online-users";

import type { UserStatus, UserWithEmployee } from "@/types/auth-fcv/user";

type UserTableProps = {
  users: UserWithEmployee[];
  loading: boolean;
  error: string | null;

  onView?: (user: UserWithEmployee) => void;
  onEdit?: (user: UserWithEmployee) => void;
  onPermissions?: (user: UserWithEmployee) => void;
  onStatusChange?: (user: UserWithEmployee) => void;
  onUserUpdated?: (user: UserWithEmployee) => void;
  onRefresh?: () => void | Promise<void>;
};

export default function UserTable({
  users,
  loading,
  error,
  onView,
  onEdit,
  onPermissions,
  onStatusChange,
  onUserUpdated,
  onRefresh,
}: UserTableProps) {
  /*
  |--------------------------------------------------------------------------
  | ONLINE USERS
  |--------------------------------------------------------------------------
  */

  const { onlineUserIds } = useOnlineUsers();

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [selectedUser, setSelectedUser] = useState<UserWithEmployee | null>(
    null,
  );

  const [permissionsModalOpened, setPermissionsModalOpened] = useState(false);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [statusUser, setStatusUser] = useState<UserWithEmployee | null>(null);

  const [statusModalOpened, setStatusModalOpened] = useState(false);

  const [statusError, setStatusError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | PERMISSIONS MODAL
  |--------------------------------------------------------------------------
  */

  const handleShowPermissions = (user: UserWithEmployee) => {
    setSelectedUser(user);
    setPermissionsModalOpened(true);
  };

  const handleClosePermissions = () => {
    setPermissionsModalOpened(false);
    setSelectedUser(null);
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS MODAL
  |--------------------------------------------------------------------------
  */

  const handleOpenStatusModal = (user: UserWithEmployee) => {
    setStatusUser(user);
    setStatusError(null);
    setStatusModalOpened(true);
  };

  const handleCloseStatusModal = () => {
    if (statusUser && updatingUserId === statusUser.id) {
      return;
    }

    setStatusModalOpened(false);
    setStatusUser(null);
    setStatusError(null);
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE USER STATUS
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = async () => {
    if (!statusUser) {
      return;
    }

    const nextStatus: UserStatus =
      statusUser.status === "active" ? "inactive" : "active";

    try {
      setUpdatingUserId(statusUser.id);
      setStatusError(null);

      const response = await updateUserStatus(statusUser.id, nextStatus);

      const updatedUser: UserWithEmployee = {
        ...statusUser,
        status: response.data.status,
        employee_id: response.data.employee_id,
      };

      onUserUpdated?.(updatedUser);
      onStatusChange?.(updatedUser);

      await onRefresh?.();

      setStatusModalOpened(false);
      setStatusUser(null);
      setStatusError(null);
    } catch (error: any) {
      console.error("Failed to update user status.", error);

      setStatusError(
        error.response?.data?.message ||
          "Failed to update the user status. Please try again.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SKELETON ROWS
  |--------------------------------------------------------------------------
  */

  const skeletonRows = Array.from({ length: 8 }, (_, index) => (
    <Table.Tr key={`skeleton-${index}`}>
      {/* User */}
      <Table.Td>
        <Stack gap={5}>
          <Group gap="xs">
            <Skeleton height={15} width={140} />
            <Skeleton height={20} width={60} radius="xl" />
          </Group>

          <Skeleton height={11} width={190} />
          <Skeleton height={10} width={150} />
        </Stack>
      </Table.Td>

      {/* Online status */}
      <Table.Td>
        <Skeleton height={24} width={75} radius="xl" />
      </Table.Td>

      {/* Permissions */}
      <Table.Td>
        <Skeleton height={24} width={105} radius="xl" />
      </Table.Td>

      {/* Actions */}
      <Table.Td>
        <Skeleton height={30} width={30} radius="sm" />
      </Table.Td>
    </Table.Tr>
  ));

  /*
  |--------------------------------------------------------------------------
  | USER ROWS
  |--------------------------------------------------------------------------
  */

  const rows = users.map((user) => {
    const employeeName = user.employee
      ? [
          user.employee.first_name,
          user.employee.middle_name,
          user.employee.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : null;

    const sectionName = user.employee?.section?.name ?? null;

    const displayName = employeeName || user.name || user.email || "User";

    const isUpdating = updatingUserId === user.id;

    // Presence status is independent of account activation status.
    const isOnline = onlineUserIds.has(String(user.id));

    return (
      <Table.Tr key={user.id}>
        {/* USER */}
        <Table.Td>
          <Stack gap={3}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={600} size="sm" truncate>
                {displayName}
              </Text>

              <Badge
                size="xs"
                variant="light"
                color={user.status === "active" ? "green" : "gray"}
                radius="sm"
              >
                {user.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </Group>

            {employeeName ? (
              <>
                <Text size="xs" c="dimmed" truncate>
                  Account: {user.name}
                </Text>

                <Text size="xs" c="dimmed" fw={500} truncate>
                  {sectionName || "No section assigned"}
                </Text>
              </>
            ) : (
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
            )}

            {user.role ? (
              <Text size="xs" c="dimmed" fw={500}>
                {user.role.name}
              </Text>
            ) : (
              <Text size="xs" c="dimmed" fs="italic">
                No role assigned
              </Text>
            )}
          </Stack>
        </Table.Td>

        {/* ONLINE STATUS */}
        <Table.Td>
          <Badge
            size="sm"
            variant="light"
            color={isOnline ? "green" : "gray"}
            radius="sm"
            leftSection={
              <Box
                component="span"
                className={`inline-block h-2 w-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            }
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </Table.Td>

        {/* PERMISSIONS */}
        <Table.Td>
          <Badge
            component="button"
            type="button"
            variant="light"
            color="gray"
            radius="sm"
            style={{
              cursor: "pointer",
              border: 0,
            }}
            onClick={() => handleShowPermissions(user)}
          >
            {user.permissions.length}{" "}
            {user.permissions.length === 1 ? "permission" : "permissions"}
          </Badge>
        </Table.Td>

        {/* ACTIONS */}
        <Table.Td>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="User actions"
                disabled={isUpdating}
              >
                <MoreVertical size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>User</Menu.Label>

              <Menu.Item
                leftSection={<UserRound size={16} />}
                onClick={() => onView?.(user)}
              >
                View User
              </Menu.Item>

              <Menu.Item
                leftSection={<Edit size={16} />}
                onClick={() => onEdit?.(user)}
              >
                Edit User
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Access</Menu.Label>

              <Menu.Item
                leftSection={<KeyRound size={16} />}
                onClick={() => onPermissions?.(user)}
              >
                Manage Permissions
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color={user.status === "active" ? "red" : "green"}
                leftSection={<Power size={16} />}
                disabled={isUpdating}
                onClick={() => handleOpenStatusModal(user)}
              >
                {user.status === "active" ? "Deactivate User" : "Activate User"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <Paper withBorder radius="md" className="overflow-hidden">
        <ScrollArea>
          <Table
            highlightOnHover={!loading}
            verticalSpacing="md"
            horizontalSpacing="lg"
            striped={false}
            miw={800}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th w={140}>Online Status</Table.Th>
                <Table.Th w={160}>Permissions</Table.Th>
                <Table.Th w={60}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                skeletonRows
              ) : error ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="red" py="xl">
                      {error}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : users.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed" py="xl">
                      No users found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* STATUS CONFIRMATION MODAL */}
      <Modal
        opened={statusModalOpened}
        onClose={handleCloseStatusModal}
        centered
        size="md"
        radius="lg"
        withCloseButton={!(statusUser && updatingUserId === statusUser.id)}
        closeOnClickOutside={!(statusUser && updatingUserId === statusUser.id)}
        closeOnEscape={!(statusUser && updatingUserId === statusUser.id)}
        title={null}
        padding="lg"
      >
        {statusUser && (
          <Stack gap="lg">
            {/* HEADER */}
            <Group align="flex-start" gap="md" wrap="nowrap">
              <Box
                className={
                  statusUser.status === "active"
                    ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40"
                    : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/40"
                }
              >
                {statusUser.status === "active" ? (
                  <PowerOff size={22} />
                ) : (
                  <Power size={22} />
                )}
              </Box>

              <Stack gap={3}>
                <Title order={3} className="!text-[var(--text-h)]">
                  {statusUser.status === "active"
                    ? "Deactivate User"
                    : "Activate User"}
                </Title>

                <Text size="sm" c="dimmed">
                  {statusUser.status === "active"
                    ? "This account will no longer be able to access FCV."
                    : "This account will be allowed to access FCV again."}
                </Text>
              </Stack>
            </Group>

            {/* USER INFORMATION */}
            <Paper
              withBorder
              radius="md"
              p="md"
              className="bg-[var(--mantine-color-body)]"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" className="min-w-0">
                  <Avatar size={42} radius="xl" color="gray">
                    {(statusUser.employee
                      ? [
                          statusUser.employee.first_name,
                          statusUser.employee.middle_name,
                          statusUser.employee.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ")
                      : statusUser.name || statusUser.email || "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>

                  <Stack gap={2} className="min-w-0">
                    <Text size="sm" fw={700} truncate>
                      {statusUser.employee
                        ? [
                            statusUser.employee.first_name,
                            statusUser.employee.middle_name,
                            statusUser.employee.last_name,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : statusUser.name}
                    </Text>

                    <Text size="xs" c="dimmed" truncate>
                      {statusUser.email}
                    </Text>
                  </Stack>
                </Group>

                <Badge
                  size="sm"
                  variant="light"
                  color={statusUser.status === "active" ? "green" : "gray"}
                  leftSection={
                    <Box
                      component="span"
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        statusUser.status === "active"
                          ? "bg-green-600"
                          : "bg-gray-500"
                      }`}
                    />
                  }
                >
                  {statusUser.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </Group>

              {statusUser.employee && (
                <>
                  <Divider my="sm" />

                  <SimpleGrid cols={2} spacing="sm">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Section
                      </Text>

                      <Text size="xs" fw={600} truncate>
                        {statusUser.employee.section?.name || "—"}
                      </Text>
                    </Stack>

                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Division
                      </Text>

                      <Text size="xs" fw={600} truncate>
                        {statusUser.employee.section?.division?.name || "—"}
                      </Text>
                    </Stack>
                  </SimpleGrid>
                </>
              )}
            </Paper>

            {/* STATUS CHANGE INFORMATION */}
            <Alert
              variant="light"
              color={statusUser.status === "active" ? "red" : "green"}
              radius="md"
              icon={
                statusUser.status === "active" ? (
                  <PowerOff size={18} />
                ) : (
                  <Power size={18} />
                )
              }
            >
              <Text size="sm" fw={600} mb={2}>
                {statusUser.status === "active"
                  ? "Access will be disabled"
                  : "Access will be restored"}
              </Text>

              <Text size="xs">
                {statusUser.status === "active"
                  ? "The user will be unable to sign in to FCV. Any existing authentication tokens will also be revoked."
                  : "The user will be able to sign in to FCV again using their existing account credentials."}
              </Text>
            </Alert>

            {/* ERROR */}
            {statusError && (
              <Alert
                color="red"
                variant="light"
                radius="md"
                title="Unable to update user status"
              >
                {statusError}
              </Alert>
            )}

            {/* ACTIONS */}
            <Group justify="flex-end" gap="sm" mt="xs">
              <Button
                variant="default"
                onClick={handleCloseStatusModal}
                disabled={updatingUserId === statusUser.id}
              >
                Cancel
              </Button>

              <Button
                color={statusUser.status === "active" ? "red" : "green"}
                variant="filled"
                leftSection={
                  statusUser.status === "active" ? (
                    <PowerOff size={16} />
                  ) : (
                    <Power size={16} />
                  )
                }
                loading={updatingUserId === statusUser.id}
                onClick={handleStatusChange}
              >
                {statusUser.status === "active"
                  ? "Deactivate User"
                  : "Activate User"}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* VIEW-ONLY PERMISSIONS MODAL */}
      <UserPermissionsModal
        user={selectedUser}
        opened={permissionsModalOpened}
        onClose={handleClosePermissions}
      />
    </>
  );
}
