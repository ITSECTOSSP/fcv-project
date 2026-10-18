import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Monitor, RefreshCw } from "lucide-react";
import { isAxiosError } from "axios";

import { getUserSessions } from "@/lib/api/auth/session-auth";
import type {
  PaginatedUserSessions,
  UserSession,
} from "@/types/auth-fcv/session";

type UserSessionsProps = {
  userId: string | number;
};

export default function UserSessions({ userId }: UserSessionsProps) {
  const [sessions, setSessions] = useState<PaginatedUserSessions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchSessions() {
      if (!userId) {
        setSessions(null);
        setError("A user ID is required to load session history.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getUserSessions({
          user_id: userId,
          page,
        });

        if (!cancelled) {
          setSessions(result);
        }
      } catch (err: unknown) {
        console.error("Failed to load user sessions:", err);

        if (!cancelled) {
          const message = isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message
            : undefined;

          setError(message ?? "Failed to load this user's session history.");
          setSessions(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSessions();

    return () => {
      cancelled = true;
    };
  }, [userId, page, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [userId]);

  const getSessionStatus = (session: UserSession) => {
    if (session.logged_out_at) {
      return { label: "Logged out", color: "gray" };
    }

    if (!session.last_activity_at) {
      return { label: "No activity", color: "gray" };
    }

    const lastActivity = new Date(session.last_activity_at).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    if (lastActivity >= fiveMinutesAgo) {
      return { label: "Online", color: "green" };
    }

    return { label: "Inactive", color: "yellow" };
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString();
  };

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return "Unknown device";

    if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
    if (/OPR\//i.test(userAgent)) return "Opera";
    if (/Firefox\//i.test(userAgent)) return "Mozilla Firefox";
    if (/Chrome\//i.test(userAgent)) return "Google Chrome";
    if (/Safari\//i.test(userAgent)) return "Safari";

    return "Unknown browser";
  };

  return (
    <Stack gap="md">
      {/* Header — consistent with Audit Logs */}
      <Group justify="space-between" align="center">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" color="gray" radius="md" size="xl">
            <Monitor size={20} />
          </ThemeIcon>

          <Box>
            <Title order={4}>Session History</Title>
            <Text size="sm" c="dimmed">
              Login activity and devices for user #{userId}
            </Text>
          </Box>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <Badge variant="light" color="gray" size="lg">
            {sessions?.total ?? 0} records
          </Badge>

          <Button
            variant="light"
            color="gray"
            size="sm"
            leftSection={<RefreshCw size={15} />}
            loading={loading}
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Refresh
          </Button>
        </Group>
      </Group>

      {/* Table — matching Audit Logs styling */}
      <Paper withBorder radius="md" p={0}>
        {error ? (
          <Alert color="red" m="md" title="Unable to load sessions">
            {error}
          </Alert>
        ) : (
          <>
            <ScrollArea>
              <Table
                miw={1000}
                striped
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
                styles={{
                  thead: {
                    background: "var(--mantine-color-default-hover)",
                  },
                  th: {
                    fontSize: "var(--mantine-font-size-xs)",
                    fontWeight: 600,
                    color: "var(--mantine-color-dimmed)",
                    whiteSpace: "nowrap",
                  },
                  td: {
                    borderBottom:
                      "1px solid var(--mantine-color-default-border)",
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Login Date</Table.Th>
                    <Table.Th>Last Activity</Table.Th>
                    <Table.Th>IP Address</Table.Th>
                    <Table.Th>Browser / Device</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Logout Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {loading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <Table.Tr key={index}>
                        {Array.from({ length: 6 }, (_, col) => (
                          <Table.Td key={col}>
                            <Skeleton height={16} radius="sm" />
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : sessions?.data.length ? (
                    sessions.data.map((session) => {
                      const status = getSessionStatus(session);

                      return (
                        <Table.Tr key={session.id}>
                          <Table.Td>
                            <Text
                              size="sm"
                              fw={500}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {formatDate(session.logged_in_at)}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                              {formatDate(session.last_activity_at)}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Text
                              component="span"
                              size="sm"
                              c="dimmed"
                              style={{
                                fontFamily:
                                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {session.ip_address ?? "—"}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Box maw={280}>
                              <Text size="sm" fw={500}>
                                {getBrowserInfo(session.user_agent)}
                              </Text>
                              <Text
                                size="xs"
                                c="dimmed"
                                lineClamp={2}
                                title={session.user_agent ?? undefined}
                                style={{ overflowWrap: "anywhere" }}
                              >
                                {session.user_agent ?? "No user-agent data"}
                              </Text>
                            </Box>
                          </Table.Td>

                          <Table.Td>
                            <Badge
                              color={status.color}
                              variant="light"
                              radius="sm"
                              styles={{
                                label: {
                                  textTransform: "none",
                                  fontWeight: 600,
                                },
                              }}
                            >
                              {status.label}
                            </Badge>
                          </Table.Td>

                          <Table.Td>
                            <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                              {formatDate(session.logged_out_at)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Stack align="center" gap="xs" py={40}>
                          <ThemeIcon
                            variant="light"
                            color="gray"
                            radius="xl"
                            size={48}
                          >
                            <Monitor size={24} />
                          </ThemeIcon>

                          <Text fw={600} size="sm">
                            No sessions found
                          </Text>

                          <Text size="sm" c="dimmed" ta="center" maw={320}>
                            This user has no recorded login sessions yet.
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Pagination — matching Audit Logs footer */}
            <Group
              justify="space-between"
              p="md"
              style={{
                borderTop: "1px solid var(--mantine-color-default-border)",
              }}
            >
              <Text size="sm" c="dimmed">
                {sessions?.total
                  ? `Showing ${sessions.from ?? 0}–${sessions.to ?? 0} of ${sessions.total}`
                  : "No records"}
              </Text>

              <Group gap="xs">
                <Button
                  type="button"
                  variant="default"
                  size="xs"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>

                <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                  Page {sessions?.current_page ?? page} of{" "}
                  {sessions?.last_page ?? 1}
                </Text>

                <Button
                  type="button"
                  variant="default"
                  size="xs"
                  disabled={loading || !sessions || page >= sessions.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Paper>
    </Stack>
  );
}
