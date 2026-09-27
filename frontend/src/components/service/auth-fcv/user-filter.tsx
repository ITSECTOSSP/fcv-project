import {
  Button,
  Group,
  MultiSelect,
  Select,
  Skeleton,
  TextInput,
} from "@mantine/core";

import {
  RotateCcw,
  Search,
} from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
};

type UserFiltersProps = {
  search: string;
  status: string;

  roleIds: string[];
  permissionIds: string[];

  roles: FilterOption[];
  permissions: FilterOption[];

  loading?: boolean;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | null) => void;
  onRoleChange: (value: string[]) => void;
  onPermissionChange: (value: string[]) => void;
  onClear: () => void;
};

export default function UserFilters({
  search,
  status,

  roleIds,
  permissionIds,

  roles,
  permissions,

  loading = false,

  onSearchChange,
  onStatusChange,
  onRoleChange,
  onPermissionChange,
  onClear,
}: UserFiltersProps) {
  const hasFilters =
    search !== "" ||
    status !== "" ||
    roleIds.length > 0 ||
    permissionIds.length > 0;

  if (loading) {
    return (
      <Group
        align="flex-end"
        wrap="wrap"
        gap="sm"
      >
        <Skeleton
          height={36}
          radius="sm"
          style={{
            flex: 1,
            minWidth: 240,
          }}
        />

        <Skeleton
          height={36}
          width={160}
          radius="sm"
        />

        <Skeleton
          height={36}
          width={220}
          radius="sm"
        />

        <Skeleton
          height={36}
          width={240}
          radius="sm"
        />

        <Skeleton
          height={36}
          width={80}
          radius="sm"
        />
      </Group>
    );
  }

  return (
    <Group
      align="flex-end"
      wrap="wrap"
      gap="sm"
    >
      <TextInput
        label="Search"
        placeholder="Search name or email..."
        leftSection={
          <Search size={16} />
        }
        value={search}
        onChange={(event) =>
          onSearchChange(
            event.currentTarget.value
          )
        }
        style={{
          flex: 1,
          minWidth: 240,
        }}
      />

      <Select
        label="Status"
        placeholder="All statuses"
        clearable
        value={status || null}
        onChange={onStatusChange}
        data={[
          {
            value: "active",
            label: "Active",
          },
          {
            value: "inactive",
            label: "Inactive",
          },
        ]}
        w={160}
      />

      <MultiSelect
        label="Role"
        placeholder="All roles"
        clearable
        searchable
        value={roleIds}
        onChange={onRoleChange}
        data={roles}
        w={220}
        maxDropdownHeight={300}
      />

      <MultiSelect
        label="Permission"
        placeholder="All permissions"
        clearable
        searchable
        value={permissionIds}
        onChange={onPermissionChange}
        data={permissions}
        w={240}
        maxDropdownHeight={300}
      />

      <Button
        variant="subtle"
        leftSection={
          <RotateCcw size={16} />
        }
        disabled={!hasFilters}
        onClick={onClear}
      >
        Clear
      </Button>
    </Group>
  );
}