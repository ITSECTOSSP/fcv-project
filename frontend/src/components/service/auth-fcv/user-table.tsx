import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@mantine/core";

import { Edit, KeyRound, MoreVertical, Power, UserRound } from "lucide-react";

import { useState } from "react";

import UserPermissionsModal from "@/components/service/auth-fcv/permission/permission-user";

import type { User } from "@/types/auth-fcv/user";

type UserTableProps = {
  users: User[];
  loading: boolean;
  error: string | null;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onPermissions?: (user: User) => void;
  onStatusChange?: (user: User) => void;
};

export default function UserTable({
  users,
  loading,
  error,
  onView,
  onEdit,
  onPermissions,
  onStatusChange,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [permissionsModalOpened, setPermissionsModalOpened] = useState(false);

  const handleShowPermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionsModalOpened(true);
  };

  const handleClosePermissions = () => {
    setPermissionsModalOpened(false);
    setSelectedUser(null);
  };

  const skeletonRows = Array.from({ length: 8 }, (_, index) => (
    <Table.Tr key={`skeleton-${index}`}>
      <Table.Td>
        <Stack gap={5}>
          <Group gap="xs">
            <Skeleton height={15} width={140} />

            <Skeleton height={20} width={60} radius="xl" />
          </Group>

          <Skeleton height={11} width={190} />

          <Skeleton height={10} width={90} />
        </Stack>
      </Table.Td>

      <Table.Td>
        <Skeleton height={24} width={105} radius="xl" />
      </Table.Td>

      <Table.Td>
        <Skeleton height={30} width={30} radius="sm" />
      </Table.Td>
    </Table.Tr>
  ));

  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      {/* User */}
      <Table.Td>
        <Stack gap={3}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} size="sm">
              {user.name}
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

          <Text size="xs" c="dimmed">
            {user.email}
          </Text>

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

      {/* Permissions */}
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

      {/* Actions */}
      <Table.Td>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label="User actions">
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

            {/* This still navigates to the
                permission management page */}
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
              onClick={() => onStatusChange?.(user)}
            >
              {user.status === "active" ? "Deactivate User" : "Activate User"}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Paper withBorder radius="md" className="overflow-hidden">
        <ScrollArea>
          <Table
            highlightOnHover={!loading}
            verticalSpacing="md"
            horizontalSpacing="lg"
            striped={false}
            miw={650}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>

                <Table.Th w={160}>Permissions</Table.Th>

                <Table.Th w={60}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                skeletonRows
              ) : error ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="red" py="xl">
                      {error}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : users.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
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

      {/* View-only permissions modal */}
      <UserPermissionsModal
        user={selectedUser}
        opened={permissionsModalOpened}
        onClose={handleClosePermissions}
      />
    </>
  );
}
