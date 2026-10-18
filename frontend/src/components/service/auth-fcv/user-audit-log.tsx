import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
  ThemeIcon,
} from "@mantine/core";
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  FileJson,
  X,
} from "lucide-react";

import { getAuditLogs } from "@/lib/api/auth/audit-log-auth";
import type {
  AuditLog,
  AuditLogFilters,
  PaginatedAuditLogs,
} from "@/types/auth-fcv/audit-log";

type UserAuditLogsProps = {
  userId: string;
};

export default function UserAuditLogs({ userId }: UserAuditLogsProps) {
  const [logs, setLogs] = useState<PaginatedAuditLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);

        const filters: AuditLogFilters = {
          user_id: userId,
          page,
        };

        const result = await getAuditLogs(filters);

        if (!cancelled) {
          setLogs(result);
        }
      } catch (err: unknown) {
        const requestError = err as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
          message?: string;
        };

        console.error(
          "Audit logs request failed:",
          requestError.response?.status,
          requestError.response?.data ?? requestError.message,
        );

        if (!cancelled) {
          setError(
            requestError.response?.data?.message ??
              "Failed to load this user's audit logs.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchLogs();

    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  const actionColor = (action: AuditLog["action"]) => {
    switch (action) {
      case "CREATE":
        return "green";
      case "UPDATE":
        return "blue";
      case "DELETE":
        return "red";
      default:
        return "gray";
    }
  };

  const formatValues = (values: unknown): string => {
    if (values === null || values === undefined) {
      return "No values recorded.";
    }

    if (
      typeof values === "object" &&
      !Array.isArray(values) &&
      Object.keys(values).length === 0
    ) {
      return "No values recorded.";
    }

    if (Array.isArray(values) && values.length === 0) {
      return "No values recorded.";
    }

    return JSON.stringify(values, null, 2);
  };

  const renderValues = (values: unknown) => {
    const formatted = formatValues(values);
    const hasValues = formatted !== "No values recorded.";

    return (
      <Paper withBorder radius="md" p="sm" style={{ overflow: "hidden" }}>
        <ScrollArea h={280} type="auto">
          <Box
            component="pre"
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              color: hasValues
                ? "var(--mantine-color-text)"
                : "var(--mantine-color-dimmed)",
            }}
          >
            {formatted}
          </Box>
        </ScrollArea>
      </Paper>
    );
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Group gap="sm" wrap="nowrap">
          <ClipboardList size={20} />

          <Box>
            <Title order={4}>Audit Logs</Title>
            <Text size="xs" c="dimmed">
              Click a record to inspect its changes
            </Text>
          </Box>
        </Group>

        <Badge variant="light" color="gray">
          {logs?.total ?? 0} records
        </Badge>
      </Group>

      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        {error ? (
          <Alert color="red" m="md" title="Unable to load audit logs">
            {error}
          </Alert>
        ) : (
          <>
            <ScrollArea type="auto">
              <Stack gap={0} miw={650}>
                {loading ? (
                  Array.from({ length: 4 }, (_, index) => (
                    <Box key={index} p="sm">
                      <Group gap="sm" wrap="nowrap">
                        <Skeleton height={24} width={70} radius="sm" />

                        <Box style={{ flex: 1 }}>
                          <Skeleton height={12} width="35%" mb={8} />
                          <Skeleton height={12} width="75%" />
                        </Box>

                        <Skeleton height={12} width={110} />
                      </Group>
                    </Box>
                  ))
                ) : logs?.data.length ? (
                  logs.data.map((log) => (
                    <Box key={log.id}>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        aria-label={`View ${log.action} audit log for ${log.module}`}
                        style={{
                          display: "block",
                          width: "100%",
                          border: 0,
                          background: "transparent",
                          color: "inherit",
                          textAlign: "left",
                          cursor: "pointer",
                          font: "inherit",
                        }}
                      >
                        <Group
                          px="md"
                          py="sm"
                          gap="sm"
                          wrap="nowrap"
                          align="center"
                          style={{
                            minWidth: 650,
                            transition: "background-color 150ms ease",
                          }}
                        >
                          <Badge
                            color={actionColor(log.action)}
                            variant="light"
                            radius="sm"
                            size="sm"
                            style={{ flexShrink: 0 }}
                          >
                            {log.action}
                          </Badge>

                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group gap={6} wrap="nowrap" mb={3}>
                              <Text size="sm" fw={600} truncate>
                                {log.module || "Unknown module"}
                              </Text>
                            </Group>

                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {log.description || "No description provided"}
                            </Text>
                          </Box>

                          {log.service && (
                            <Badge
                              variant="outline"
                              color="gray"
                              size="xs"
                              radius="sm"
                              style={{ flexShrink: 0 }}
                            >
                              {log.service}
                            </Badge>
                          )}

                          <Tooltip
                            label={new Date(log.created_at).toLocaleString()}
                            withArrow
                          >
                            <Group
                              gap={5}
                              wrap="nowrap"
                              style={{ flexShrink: 0 }}
                            >
                              <Clock3 size={13} />

                              <Text
                                size="xs"
                                c="dimmed"
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {new Date(log.created_at).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Tooltip>
                        </Group>
                      </Box>

                      <Divider color="var(--mantine-color-default-border)" />
                    </Box>
                  ))
                ) : (
                  <Stack align="center" gap="xs" py="xl" px="md">
                    <ClipboardList size={28} />

                    <Text size="sm" fw={600}>
                      No audit logs found
                    </Text>

                    <Text size="xs" c="dimmed" ta="center">
                      This user has no recorded activity yet.
                    </Text>
                  </Stack>
                )}
              </Stack>
            </ScrollArea>

            <Divider />

            <Group
              justify="space-between"
              align="center"
              p="sm"
              gap="sm"
              wrap="wrap"
            >
              <Text size="xs" c="dimmed">
                {logs?.total
                  ? `Showing ${logs.from ?? 0}–${logs.to ?? 0} of ${logs.total}`
                  : "No records"}
              </Text>

              <Group gap="xs">
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<ChevronLeft size={14} />}
                  disabled={loading || page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>

                <Text size="xs" c="dimmed">
                  Page {logs?.current_page ?? page} of {logs?.last_page ?? 1}
                </Text>

                <Button
                  variant="default"
                  size="xs"
                  rightSection={<ChevronRight size={14} />}
                  disabled={loading || !logs || page >= logs.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Paper>

      <Modal
        opened={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={null}
        size="min(920px, 95vw)"
        centered
        padding={0}
        radius="lg"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        styles={{
          content: {
            maxHeight: "90dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
          },
          body: {
            padding: 0,
            minHeight: 0,
            overflowY: "auto",
            flex: 1,
          },
        }}
      >
        {selectedLog && (
          <Stack gap={0}>
            {/* Themed header */}
            <Box
              p="lg"
              style={{
                background: "var(--mantine-primary-color-filled)",
                color: "var(--mantine-color-white)",
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <Box
                    p="sm"
                    style={{
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      display: "flex",
                    }}
                  >
                    <FileJson size={25} />
                  </Box>

                  <Box style={{ minWidth: 0 }}>
                    <Group gap="xs" mb={6} wrap="wrap">
                      <Title order={3} c="white">
                        Audit Log Details
                      </Title>

                      <Badge
                        variant="white"
                        color={actionColor(selectedLog.action)}
                        size="lg"
                      >
                        {selectedLog.action}
                      </Badge>
                    </Group>

                    <Text size="sm" c="white" style={{ opacity: 0.88 }}>
                      Review recorded activity and value changes
                    </Text>

                    <Group gap={6} mt="sm" wrap="wrap">
                      <Badge
                        variant="light"
                        color="gray"
                        styles={{
                          root: {
                            background: "rgba(255,255,255,0.16)",
                            color: "white",
                            borderColor: "rgba(255,255,255,0.25)",
                          },
                        }}
                      >
                        {selectedLog.service || "Unknown service"}
                      </Badge>

                      <Text size="xs" c="white" style={{ opacity: 0.9 }}>
                        / {selectedLog.module || "Unknown module"}
                      </Text>
                    </Group>
                  </Box>
                </Group>

                <Tooltip label="Close details">
                  <Button
                    variant="subtle"
                    color="gray"
                    aria-label="Close audit log details"
                    onClick={() => setSelectedLog(null)}
                    p={0}
                    w={36}
                    h={36}
                    miw={36}
                    radius="md"
                    styles={{
                      root: {
                        background: "rgba(255,255,255,0.14)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.22)",
                        "&:hover": {
                          background: "rgba(255,255,255,0.25)",
                        },
                      },
                    }}
                  >
                    <X size={18} />
                  </Button>
                </Tooltip>
              </Group>
            </Box>

            {/* Modal content */}
            <Stack p={{ base: "md", sm: "lg" }} gap="lg">
              <Box>
                <Group gap="xs" mb="sm">
                  <Database
                    size={17}
                    color="var(--mantine-primary-color-filled)"
                  />
                  <Title order={5}>Record Information</Title>
                </Group>

                <Paper withBorder radius="md" p="sm">
                  <Grid>
                    <Grid.Col span={{ base: 6, sm: 4 }}>
                      <Text size="xs" c="dimmed" mb={4}>
                        Date & Time
                      </Text>
                      <Group gap={6} wrap="nowrap">
                        <Clock3 size={14} color="var(--mantine-color-dimmed)" />
                        <Box>
                          <Text size="sm" fw={500}>
                            {new Date(
                              selectedLog.created_at,
                            ).toLocaleDateString()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(
                              selectedLog.created_at,
                            ).toLocaleTimeString()}
                          </Text>
                        </Box>
                      </Group>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, sm: 4 }}>
                      <Text size="xs" c="dimmed" mb={4}>
                        Action
                      </Text>
                      <Badge
                        color={actionColor(selectedLog.action)}
                        variant="light"
                        size="md"
                      >
                        {selectedLog.action}
                      </Badge>
                    </Grid.Col>

                    <Grid.Col span={12}>
                      <Divider />
                      <Text size="xs" c="dimmed" mt="sm" mb={4}>
                        Description
                      </Text>
                      <Text size="sm" lh={1.5}>
                        {selectedLog.description || "No description provided"}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Box>

              <Divider />

              {/* Old and new values */}
              <Box>
                <Group justify="space-between" align="center" mb="sm">
                  <Box>
                    <Title order={5}>Value Changes</Title>
                    <Text size="xs" c="dimmed" mt={3}>
                      Compare the data before and after this action.
                    </Text>
                  </Box>

                  <ThemeIcon
                    variant="light"
                    color="var(--mantine-primary-color-filled)"
                    radius="xl"
                    size="lg"
                  >
                    <FileJson size={17} />
                  </ThemeIcon>
                </Group>

                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Paper
                      withBorder
                      radius="md"
                      style={{
                        overflow: "hidden",
                        borderColor: "var(--mantine-color-red-4)",
                      }}
                    >
                      <Group
                        justify="space-between"
                        px="sm"
                        py="sm"
                        style={{
                          background: "var(--mantine-color-red-light)",
                          borderBottom:
                            "1px solid var(--mantine-color-default-border)",
                        }}
                      >
                        <Group gap="xs">
                          <ThemeIcon
                            color="red"
                            variant="light"
                            radius="md"
                            size="sm"
                          >
                            <ChevronLeft size={15} />
                          </ThemeIcon>
                          <Text size="sm" fw={700}>
                            Old Values
                          </Text>
                        </Group>

                        <Badge color="red" variant="light" size="sm">
                          Before
                        </Badge>
                      </Group>

                      <Box p="sm">{renderValues(selectedLog.old_values)}</Box>
                    </Paper>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Paper
                      withBorder
                      radius="md"
                      style={{
                        overflow: "hidden",
                        borderColor: "var(--mantine-color-green-4)",
                      }}
                    >
                      <Group
                        justify="space-between"
                        px="sm"
                        py="sm"
                        style={{
                          background: "var(--mantine-color-green-light)",
                          borderBottom:
                            "1px solid var(--mantine-color-default-border)",
                        }}
                      >
                        <Group gap="xs">
                          <ThemeIcon
                            color="green"
                            variant="light"
                            radius="md"
                            size="sm"
                          >
                            <ChevronRight size={15} />
                          </ThemeIcon>
                          <Text size="sm" fw={700}>
                            New Values
                          </Text>
                        </Group>

                        <Badge color="green" variant="light" size="sm">
                          After
                        </Badge>
                      </Group>

                      <Box p="sm">{renderValues(selectedLog.new_values)}</Box>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Box>
      
            </Stack>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
