import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import { Check, KeyRound, ListChecks } from "lucide-react";

import type { Permission } from "@/types/auth-fcv/permission";

type PermissionSelectorProps = {
  permissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  selectedPermissionIds: string[];
  setSelectedPermissionIds: React.Dispatch<React.SetStateAction<string[]>>;
  loading?: boolean;
};

function PermissionSkeleton() {
  return (
    <Stack gap="xl">
      {Array.from({ length: 3 }, (_, groupIndex) => (
        <Stack key={groupIndex} gap="md">
          <Group justify="space-between" align="center">
            <Stack gap={5}>
              <Skeleton height={17} width={150} />

              <Skeleton height={11} width={100} />
            </Stack>

            <Skeleton height={24} width={90} radius="sm" />
          </Group>

          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              md: 3,
            }}
            spacing="md"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index} withBorder padding="md" radius="md">
                <Group align="flex-start" wrap="nowrap" gap="sm">
                  <Skeleton height={20} width={20} />

                  <Stack
                    gap={5}
                    style={{
                      flex: 1,
                    }}
                  >
                    <Skeleton height={14} width="65%" />

                    <Skeleton height={11} width="85%" />
                  </Stack>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      ))}
    </Stack>
  );
}

export default function PermissionSelector({
  permissions,
  groupedPermissions,
  selectedPermissionIds,
  setSelectedPermissionIds,
  loading = false,
}: PermissionSelectorProps) {
  const selectedCount = selectedPermissionIds.length;

  const totalCount = permissions.length;

  const allSelected = totalCount > 0 && selectedCount === totalCount;

  const selectionPercentage =
    totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedPermissionIds([]);
      return;
    }

    setSelectedPermissionIds(permissions.map((permission) => permission.id));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, permissionId]));
      }

      return current.filter((id) => id !== permissionId);
    });
  };

  const handleGroupSelectAll = (groupPermissions: Permission[]) => {
    const groupPermissionIds = groupPermissions.map(
      (permission) => permission.id,
    );

    const selectedInGroup = groupPermissionIds.filter((permissionId) =>
      selectedPermissionIds.includes(permissionId),
    ).length;

    const groupAllSelected =
      groupPermissions.length > 0 &&
      selectedInGroup === groupPermissions.length;

    setSelectedPermissionIds((current) => {
      if (groupAllSelected) {
        return current.filter((id) => !groupPermissionIds.includes(id));
      }

      return Array.from(new Set([...current, ...groupPermissionIds]));
    });
  };

  if (loading) {
    return <PermissionSkeleton />;
  }

  if (permissions.length === 0) {
    return (
      <Box py={50} ta="center">
        <ThemeIcon size={48} radius="xl" variant="light" color="gray" mx="auto">
          <KeyRound size={22} />
        </ThemeIcon>

        <Stack gap={4} mt="md">
          <Text fw={600} size="sm">
            No permissions available
          </Text>

          <Text size="xs" c="dimmed">
            There are currently no permissions configured for the system.
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack gap="xl">
      {/* Selection Summary */}
      <Card withBorder radius="md" padding="md">
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon size={38} radius="md" variant="light">
                <ListChecks size={20} />
              </ThemeIcon>

              <Stack gap={2}>
                <Text size="sm" fw={600}>
                  Permission Access
                </Text>

                <Text size="xs" c="dimmed">
                  Select the permissions that should be assigned directly to
                  this user.
                </Text>
              </Stack>
            </Group>

            <Badge size="lg" variant="light" radius="sm">
              {selectedCount} / {totalCount}
            </Badge>
          </Group>

          <Progress value={selectionPercentage} size="sm" radius="xl" />

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {selectionPercentage}% of available permissions selected
            </Text>

            <Button
              variant={allSelected ? "subtle" : "light"}
              size="xs"
              onClick={handleSelectAll}
              leftSection={allSelected ? undefined : <Check size={14} />}
            >
              {allSelected ? "Clear All" : "Select All"}
            </Button>
          </Group>
        </Stack>
      </Card>

      <Divider />

      {/* Permission Groups */}
      <Stack gap="xl">
        {Object.entries(groupedPermissions).map(([group, groupPermissions]) => {
          const groupPermissionIds = groupPermissions.map(
            (permission) => permission.id,
          );

          const selectedInGroup = groupPermissionIds.filter((permissionId) =>
            selectedPermissionIds.includes(permissionId),
          ).length;

          const groupAllSelected =
            groupPermissions.length > 0 &&
            selectedInGroup === groupPermissions.length;

          const groupPartiallySelected =
            selectedInGroup > 0 && !groupAllSelected;

          return (
            <Stack key={group} gap="md">
              {/* Group Header */}
              <Group justify="space-between" align="center">
                <Group gap="sm" wrap="nowrap">
                  <Box
                    w={3}
                    h={22}
                    style={{
                      borderRadius: "999px",
                      background: "var(--mantine-primary-color-filled)",
                    }}
                  />

                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={650} size="md">
                        {group}
                      </Text>

                      <Badge size="xs" variant="light" radius="sm">
                        {groupPermissions.length}
                      </Badge>
                    </Group>

                    <Text size="xs" c="dimmed">
                      {selectedInGroup} of {groupPermissions.length} selected
                    </Text>
                  </Stack>
                </Group>

                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => handleGroupSelectAll(groupPermissions)}
                >
                  {groupAllSelected ? "Clear Group" : "Select Group"}
                </Button>
              </Group>

              {/* Group Permissions */}
              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                  md: 3,
                }}
                spacing="md"
              >
                {groupPermissions.map((permission) => {
                  const checked = selectedPermissionIds.includes(permission.id);

                  return (
                    <Card
                      key={permission.id}
                      withBorder
                      padding="md"
                      radius="md"
                      component="label"
                      style={{
                        cursor: "pointer",
                        borderColor: checked
                          ? "var(--mantine-primary-color-filled)"
                          : undefined,
                        background: checked
                          ? "var(--mantine-primary-color-light)"
                          : undefined,
                        transition:
                          "border-color 120ms ease, background-color 120ms ease",
                      }}
                    >
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        <Checkbox
                          checked={checked}
                          indeterminate={groupPartiallySelected && false}
                          onChange={(event) =>
                            handlePermissionChange(
                              permission.id,
                              event.currentTarget.checked,
                            )
                          }
                          mt={1}
                          aria-label={`Select ${permission.name}`}
                        />

                        <Stack
                          gap={4}
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Text size="sm" fw={600} lh={1.3}>
                            {permission.name}
                          </Text>

                          <Text
                            size="xs"
                            c="dimmed"
                            ff="monospace"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={permission.key}
                          >
                            {permission.key}
                          </Text>
                        </Stack>

                        {checked && (
                          <ThemeIcon size={22} radius="xl" variant="light">
                            <Check size={13} />
                          </ThemeIcon>
                        )}
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
