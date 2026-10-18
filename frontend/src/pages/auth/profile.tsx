import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  ArrowLeft,
  Building2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import api from "@/lib/api/api";

import { useAuth } from "@/lib/api/auth/use-auth";

import type { Employee } from "@/types/hr-fcv/employee";

import UserAuditLogs from "@/components/service/auth-fcv/user-audit-log";
import UserSessions from "@/components/service/auth-fcv/user-session";
import PageTitle from "@/pages/settings/page-title";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={5}>
      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
        {label}
      </Text>

      <Text size="sm" fw={500} style={{ overflowWrap: "anywhere" }}>
        {value || "—"}
      </Text>
    </Stack>
  );
}

function ProfileSkeleton() {
  return (
    <Card withBorder radius="lg" p={{ base: "md", sm: "xl" }}>
      <Stack gap="xl">
        <Group align="center" gap="md">
          <Skeleton circle height={64} width={64} />

          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={20} width="45%" radius="sm" />
            <Skeleton height={14} width="60%" radius="sm" />

            <Group gap="xs">
              <Skeleton height={22} width={65} radius="xl" />
              <Skeleton height={22} width={85} radius="xl" />
            </Group>
          </Stack>
        </Group>

        <Divider />

        <Group gap="sm">
          <Skeleton height={34} width={34} radius="md" />
          <Skeleton height={18} width={180} radius="sm" />
        </Group>

        <Grid>
          {Array.from({ length: 5 }, (_, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Skeleton height={11} width="35%" radius="sm" />
                <Skeleton height={16} width="75%" radius="sm" />
              </Stack>
            </Grid.Col>
          ))}
        </Grid>

        <Divider />

        <Group gap="sm">
          <Skeleton height={34} width={34} radius="md" />
          <Skeleton height={18} width={180} radius="sm" />
        </Group>

        <Grid>
          {Array.from({ length: 3 }, (_, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Skeleton height={11} width="35%" radius="sm" />
                <Skeleton height={16} width="75%" radius="sm" />
              </Stack>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Card>
  );
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(
    user?.employee ?? null,
  );

  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const displayName = user?.name?.trim();

  const pageTitle = displayName ? `My Profile — ${displayName}` : "My Profile";

  useEffect(() => {
    let cancelled = false;

    async function fetchEmployee() {
      if (!user?.employee_id) {
        setEmployee(null);
        setEmployeeLoading(false);
        setEmployeeError(null);
        return;
      }

      // Reuse the employee already loaded by AuthProvider when available.
      if (user.employee) {
        setEmployee(user.employee);
        setEmployeeLoading(false);
        setEmployeeError(null);
        return;
      }

      setEmployeeLoading(true);
      setEmployeeError(null);

      try {
        // Fetch only the employee linked to the authenticated account.
        const response = await api.get<{ data: Employee | null }>(
          "/api/hr/employees/me",
        );

        if (!cancelled) {
          setEmployee(response.data.data ?? null);
        }
      } catch {
        if (!cancelled) {
          setEmployeeError("Unable to load employee information.");
          setEmployee(null);
        }
      } finally {
        if (!cancelled) {
          setEmployeeLoading(false);
        }
      }
    }

    void fetchEmployee();

    return () => {
      cancelled = true;
    };
  }, [user?.employee_id, user?.employee]);

  if (isCheckingAuth) {
    return (
      <Stack gap="xl">
        <PageTitle title="My Profile" />
        <ProfileSkeleton />
      </Stack>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Alert color="red" title="Authentication required">
        Please sign in to view your profile.
      </Alert>
    );
  }

  const roleName =
    typeof user.role === "object"
      ? (user.role?.name ?? "No role assigned")
      : (user.role ?? "No role assigned");

  const employeeName = employee
    ? `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() || "—"
    : "—";

  const sectionName = employee?.section?.name ?? "—";
  const divisionName = employee?.section?.division?.name ?? "—";

  return (
    <Stack gap="xl">
      <PageTitle title={pageTitle} />

      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Title order={2}>My Profile</Title>

          <Text size="sm" c="dimmed">
            View your account information and employee details.
          </Text>
        </Stack>
      </Group>

      <Card withBorder radius="lg" p={{ base: "md", sm: "xl" }}>
        <Stack gap="xl">
          {/* Profile header */}

          <Group align="center" gap="md">
            <Avatar size={64} radius="xl" color="blue" variant="light">
              {user.name?.trim().charAt(0).toUpperCase() || (
                <UserRound size={30} />
              )}
            </Avatar>

            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Title order={3} style={{ overflowWrap: "anywhere" }}>
                {user.name || "Unnamed User"}
              </Title>

              <Group gap={6} wrap="wrap">
                <Mail size={15} />

                <Text size="sm" c="dimmed" style={{ overflowWrap: "anywhere" }}>
                  {user.email || "No email available"}
                </Text>
              </Group>

              <Group gap="xs">
                <Badge
                  color={user.status === "active" ? "green" : "gray"}
                  variant="light"
                >
                  {user.status ?? "Unknown"}
                </Badge>

                <Badge
                  color="blue"
                  variant="light"
                  leftSection={<ShieldCheck size={12} />}
                >
                  {roleName}
                </Badge>
              </Group>
            </Stack>
          </Group>
          <Divider />

          {/* Employee information */}

          <Stack gap="md">
            <Group gap="sm">
              <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                <Building2 size={18} />
              </ThemeIcon>

              <Stack gap={2}>
                <Title order={4}>Employee Information</Title>

                <Text size="xs" c="dimmed">
                  Your organizational assignment and department details
                </Text>
              </Stack>
            </Group>

            {employeeLoading ? (
              <Grid>
                {Array.from({ length: 3 }, (_, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                    <Stack gap="xs">
                      <Skeleton height={11} width="40%" radius="sm" />
                      <Skeleton height={16} width="75%" radius="sm" />
                    </Stack>
                  </Grid.Col>
                ))}
              </Grid>
            ) : employeeError ? (
              <Alert color="red" title="Employee information unavailable">
                {employeeError}
              </Alert>
            ) : !employee ? (
              <Text size="sm" c="dimmed">
                No employee record is linked to your account.
              </Text>
            ) : (
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <DetailItem label="Employee Name" value={employeeName} />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <DetailItem label="Section" value={sectionName} />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <DetailItem label="Division" value={divisionName} />
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Own account history */}

      <Card withBorder radius="lg" p={{ base: "md", sm: "xl" }}>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon variant="light" color="violet" size="lg" radius="md">
              <ShieldCheck size={18} />
            </ThemeIcon>

            <Stack gap={2}>
              <Title order={4}>My Account History</Title>

              <Text size="sm" c="dimmed">
                Review activity and sessions associated with your account.
              </Text>
            </Stack>
          </Group>

          <Divider />

          <UserAuditLogs userId={String(user.id)} />

          <UserSessions userId={String(user.id)} />
        </Stack>
      </Card>
    </Stack>
  );
}
