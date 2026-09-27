import {
  Badge,
  Box,
  Divider,
  Group,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import { Check, KeyRound, ShieldCheck } from "lucide-react";

import type { User } from "@/types/auth-fcv/user";

type UserPermissionsModalProps = {
  user: User | null;
  opened: boolean;
  onClose: () => void;
};

export default function UserPermissionsModal({
  user,
  opened,
  onClose,
}: UserPermissionsModalProps) {
  if (!user) {
    return null;
  }

  const groupedPermissions = user.permissions.reduce(
    (groups, permission) => {
      if (!groups[permission.group]) {
        groups[permission.group] = [];
      }

      groups[permission.group].push(permission);

      return groups;
    },
    {} as Record<string, typeof user.permissions>,
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" size={38} radius="md">
            <ShieldCheck size={20} />
          </ThemeIcon>

          <Stack gap={1}>
            <Text fw={700} size="md">
              User Permissions
            </Text>

            <Text size="xs" c="dimmed" fw={400}>
              View assigned access
            </Text>
          </Stack>
        </Group>
      }
      size={720}
      centered
      padding="lg"
      radius="md"
    >
      <Stack gap="lg">
        {/* User summary */}
        <Box
          p="md"
          style={{
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-md)",
            background: "var(--mantine-color-gray-0)",
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" size={42} radius="xl">
                <KeyRound size={20} />
              </ThemeIcon>

              <Stack gap={2}>
                <Text fw={600} size="sm">
                  {user.name}
                </Text>

                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              </Stack>
            </Group>

            <Stack gap={2} align="flex-end">
              <Text size="xs" c="dimmed">
                Total Access
              </Text>

              <Badge size="lg" variant="light" radius="sm">
                {user.permissions.length}
              </Badge>
            </Stack>
          </Group>
        </Box>

        {/* Section heading */}
        <Group justify="space-between" align="flex-end">
          <Stack gap={2}>
            <Text fw={600} size="sm">
              Assigned Permissions
            </Text>

            <Text size="xs" c="dimmed">
              Direct permissions assigned to this user account.
            </Text>
          </Stack>

          <Text size="xs" c="dimmed">
            {Object.keys(groupedPermissions).length}{" "}
            {Object.keys(groupedPermissions).length === 1 ? "group" : "groups"}
          </Text>
        </Group>

        <Divider />

        {/* Empty state */}
        {user.permissions.length === 0 ? (
          <Box py={50} ta="center">
            <ThemeIcon
              size={48}
              radius="xl"
              variant="light"
              color="gray"
              mx="auto"
            >
              <KeyRound size={22} />
            </ThemeIcon>

            <Stack gap={4} mt="md">
              <Text fw={600} size="sm">
                No permissions assigned
              </Text>

              <Text size="xs" c="dimmed">
                This user currently has no direct permissions.
              </Text>
            </Stack>
          </Box>
        ) : (
          <ScrollArea mah={460} offsetScrollbars scrollbarSize={6}>
            <Stack gap="xl" pr="sm">
              {Object.entries(groupedPermissions).map(
                ([group, permissions]) => (
                  <Stack key={group} gap="sm">
                    {/* Permission group */}
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <Box
                          w={3}
                          h={18}
                          style={{
                            borderRadius: "999px",
                            background: "var(--mantine-primary-color-filled)",
                          }}
                        />

                        <Text fw={650} size="sm">
                          {group}
                        </Text>
                      </Group>

                      <Badge size="sm" variant="light" radius="sm">
                        {permissions.length}{" "}
                        {permissions.length === 1
                          ? "permission"
                          : "permissions"}
                      </Badge>
                    </Group>

                    {/* Permission cards */}
                    <SimpleGrid
                      cols={{
                        base: 1,
                        sm: 2,
                      }}
                      spacing="sm"
                    >
                      {permissions.map((permission) => (
                        <Box
                          key={permission.id}
                          p="sm"
                          style={{
                            border:
                              "1px solid var(--mantine-color-default-border)",
                            borderRadius: "var(--mantine-radius-md)",
                          }}
                        >
                          <Group align="flex-start" gap="sm" wrap="nowrap">
                            <ThemeIcon size={30} radius="sm" variant="light">
                              <Check size={15} />
                            </ThemeIcon>

                            <Stack
                              gap={3}
                              style={{
                                minWidth: 0,
                              }}
                            >
                              <Text size="sm" fw={550} lh={1.3}>
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
                          </Group>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Stack>
                ),
              )}
            </Stack>
          </ScrollArea>
        )}

        <Divider />

        {/* Footer */}
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            View-only access summary
          </Text>

          <Badge
            variant="dot"
            color={user.status === "active" ? "green" : "gray"}
            radius="sm"
          >
            {user.status === "active" ? "Active User" : "Inactive User"}
          </Badge>
        </Group>
      </Stack>
    </Modal>
  );
}
