import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import UserFilters from "@/components/service/auth-fcv/user-filter";
import UserTable from "@/components/service/auth-fcv/user-table";

import { useUsers } from "@/lib/hook/auth-fcv/fetch-users";

export default function UserManagement() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

  const { users, roles, permissions, loading, loadingFilters, error } =
    useUsers({
      search,
      status: status as "active" | "inactive" | "",
      role_ids: roleIds,
      permission_ids: permissionIds,
    });

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setRoleIds([]);
    setPermissionIds([]);
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>User Management</Title>

          <Text size="sm" c="dimmed">
            Manage system users, roles, permissions, and account status.
          </Text>
        </div>

        <Button
          leftSection={<Plus size={16} />}
          onClick={() => navigate("/admin/create-user")}
        >
          Add User
        </Button>
      </Group>

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <UserFilters
          search={search}
          status={status}
          roleIds={roleIds}
          permissionIds={permissionIds}
          roles={roles}
          permissions={permissions}
          loading={loadingFilters}
          onSearchChange={setSearch}
          onStatusChange={(value) => setStatus(value ?? "")}
          onRoleChange={setRoleIds}
          onPermissionChange={setPermissionIds}
          onClear={handleClear}
        />
      </Paper>

      {/* Users */}
      <UserTable
        users={users}
        loading={loading}
        error={error}
        onEdit={(user) => navigate(`/admin/edit-user/${user.id}`)}
        onPermissions={(user) => navigate(`/admin/user-permissions/${user.id}`)}
      />
    </Stack>
  );
}
