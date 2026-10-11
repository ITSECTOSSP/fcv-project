import {
  Badge,
  Card,
  Divider,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  Building2,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { divisionApi } from "@/lib/api/hr-fcv/division";
import { employeeApi } from "@/lib/api/hr-fcv/employee";
import { sectionApi } from "@/lib/api/hr-fcv/section";

import EmployeeAnalytics from "@/components/service/hr-fcv/employee-analytics";

import type {
  Employee,
  EmployeeStatus,
} from "@/types/hr-fcv/employee";

import type { Division } from "@/types/hr-fcv/division";
import type { Section } from "@/types/hr-fcv/section";

/*
 * |--------------------------------------------------------------------------
 * | STATUS CONFIGURATION
 * |--------------------------------------------------------------------------
 */

const STATUS_CONFIG: Record<
  EmployeeStatus,
  {
    label: string;
    color: string;
  }
> = {
  active: {
    label: "Active",
    color: "green",
  },

  retired: {
    label: "Retired",
    color: "blue",
  },

  resigned: {
    label: "Resigned",
    color: "orange",
  },
};

export default function HrDashboard() {
  /*
   * |--------------------------------------------------------------------------
   * | STATE
   * |--------------------------------------------------------------------------
   */

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  /*
   * |--------------------------------------------------------------------------
   * | LOAD DASHBOARD
   * |--------------------------------------------------------------------------
   */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        employeesResponse,
        divisionsResponse,
        sectionsResponse,
      ] = await Promise.all([
        employeeApi.index({
          per_page: 100,
        }),

        divisionApi.index({
          per_page: 100,
        }),

        sectionApi.index({
          per_page: 100,
        }),
      ]);

      setEmployees(employeesResponse.data.data);
      setDivisions(divisionsResponse.data.data);
      setSections(sectionsResponse.data.data);
    } catch (error) {
      console.error(
        "Failed to load HR dashboard:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * |--------------------------------------------------------------------------
   * | EMPLOYEE STATUS COUNTS
   * |--------------------------------------------------------------------------
   */

  const employeeStatusCounts = useMemo(() => {
    const active = employees.filter(
      (employee) => employee.status === "active",
    ).length;

    const retired = employees.filter(
      (employee) => employee.status === "retired",
    ).length;

    const resigned = employees.filter(
      (employee) => employee.status === "resigned",
    ).length;

    return {
      total: employees.length,
      active,
      retired,
      resigned,
    };
  }, [employees]);

  /*
   * |--------------------------------------------------------------------------
   * | STATUS PERCENTAGES
   * |--------------------------------------------------------------------------
   */

  const statusPercentages = useMemo(() => {
    if (!employeeStatusCounts.total) {
      return {
        active: 0,
        retired: 0,
        resigned: 0,
      };
    }

    return {
      active:
        (employeeStatusCounts.active /
          employeeStatusCounts.total) *
        100,

      retired:
        (employeeStatusCounts.retired /
          employeeStatusCounts.total) *
        100,

      resigned:
        (employeeStatusCounts.resigned /
          employeeStatusCounts.total) *
        100,
    };
  }, [employeeStatusCounts]);

  /*
   * |--------------------------------------------------------------------------
   * | RECENT EMPLOYEES
   * |--------------------------------------------------------------------------
   */

  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )
      .slice(0, 8);
  }, [employees]);

  /*
   * |--------------------------------------------------------------------------
   * | RENDER
   * |--------------------------------------------------------------------------
   */

  return (
    <Stack gap="xl">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------------------ */}

      <Group
        justify="space-between"
        align="flex-end"
      >
        <Stack gap={4}>
          <Title order={2}>
            Human Resources
          </Title>

          <Text c="dimmed">
            Overview of employee records and
            organizational information.
          </Text>
        </Stack>
      </Group>

      {/* ------------------------------------------------------------------ */}
      {/* EMPLOYEE ANALYTICS */}
      {/* ------------------------------------------------------------------ */}

      <EmployeeAnalytics
        employees={employees}
        divisionsCount={divisions.length}
        sectionsCount={sections.length}
        loading={loading}
      />

      {/* ------------------------------------------------------------------ */}
      {/* OVERVIEW */}
      {/* ------------------------------------------------------------------ */}

      <Grid>
        {/* -------------------------------------------------------------- */}
        {/* EMPLOYEE STATUS */}
        {/* -------------------------------------------------------------- */}

        <Grid.Col
          span={{
            base: 12,
            md: 5,
          }}
        >
          <Card
            withBorder
            radius="md"
            padding="lg"
          >
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon
                  variant="light"
                  size="lg"
                  radius="md"
                  color="blue"
                >
                  <UsersRound size={18} />
                </ThemeIcon>

                <div>
                  <Text fw={600}>
                    Employee Status
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Current employee distribution
                  </Text>
                </div>
              </Group>

              <Stack gap="md">
                <StatusRow
                  status="active"
                  count={employeeStatusCounts.active}
                  percentage={statusPercentages.active}
                />

                <StatusRow
                  status="retired"
                  count={employeeStatusCounts.retired}
                  percentage={statusPercentages.retired}
                />

                <StatusRow
                  status="resigned"
                  count={employeeStatusCounts.resigned}
                  percentage={statusPercentages.resigned}
                />
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* -------------------------------------------------------------- */}
        {/* ORGANIZATION SUMMARY */}
        {/* -------------------------------------------------------------- */}

        <Grid.Col
          span={{
            base: 12,
            md: 7,
          }}
        >
          <Card
            withBorder
            radius="md"
            padding="lg"
          >
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon
                  variant="light"
                  size="lg"
                  radius="md"
                  color="violet"
                >
                  <Building2 size={18} />
                </ThemeIcon>

                <div>
                  <Text fw={600}>
                    Organization
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Human resources structure
                  </Text>
                </div>
              </Group>

              <SimpleGrid cols={2}>
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                >
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Divisions
                  </Text>

                  <Text
                    size="xl"
                    fw={700}
                    mt={4}
                  >
                    {loading ? (
                      <Skeleton
                        height={28}
                        width={40}
                      />
                    ) : (
                      divisions.length
                    )}
                  </Text>
                </Paper>

                <Paper
                  withBorder
                  p="md"
                  radius="md"
                >
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Sections
                  </Text>

                  <Text
                    size="xl"
                    fw={700}
                    mt={4}
                  >
                    {loading ? (
                      <Skeleton
                        height={28}
                        width={40}
                      />
                    ) : (
                      sections.length
                    )}
                  </Text>
                </Paper>
              </SimpleGrid>

              <Divider />

              <Group justify="space-between">
                <Text size="sm">
                  Active workforce
                </Text>

                <Text
                  size="sm"
                  fw={600}
                >
                  {employeeStatusCounts.total
                    ? Math.round(
                        statusPercentages.active,
                      )
                    : 0}
                  %
                </Text>
              </Group>

              <Progress
                value={statusPercentages.active}
                size="md"
                radius="xl"
                color="green"
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* ------------------------------------------------------------------ */}
      {/* RECENT EMPLOYEES */}
      {/* ------------------------------------------------------------------ */}

      <Card
        withBorder
        radius="md"
        padding={0}
      >
        <Group
          justify="space-between"
          p="lg"
        >
          <Group gap="sm">
            <ThemeIcon
              variant="light"
              size="lg"
              radius="md"
              color="blue"
            >
              <UserPlus size={18} />
            </ThemeIcon>

            <div>
              <Text fw={600}>
                Recently Added Employees
              </Text>

              <Text
                size="xs"
                c="dimmed"
              >
                Latest employee records
              </Text>
            </div>
          </Group>
        </Group>

        <Divider />

        {loading ? (
          <Stack
            p="lg"
            gap="sm"
          >
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <Skeleton
                key={index}
                height={42}
              />
            ))}
          </Stack>
        ) : recentEmployees.length === 0 ? (
          <Text
            ta="center"
            c="dimmed"
            py="xl"
          >
            No employee records found.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={700}>
            <Table
              verticalSpacing="sm"
              highlightOnHover
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    Employee
                  </Table.Th>

                  <Table.Th>
                    Division
                  </Table.Th>

                  <Table.Th>
                    Section
                  </Table.Th>

                  <Table.Th>
                    Status
                  </Table.Th>

                  <Table.Th>
                    Date Added
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {recentEmployees.map(
                  (employee) => {
                    const fullName = [
                      employee.first_name,
                      employee.middle_name,
                      employee.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const status =
                      STATUS_CONFIG[
                        employee.status
                      ];

                    return (
                      <Table.Tr
                        key={employee.id}
                      >
                        <Table.Td>
                          <Stack gap={0}>
                            <Text fw={500}>
                              {fullName}
                            </Text>

                            <Text
                              size="xs"
                              c="dimmed"
                            >
                              {employee.email}
                            </Text>
                          </Stack>
                        </Table.Td>

                        <Table.Td>
                          <Text size="sm">
                            {employee.section
                              ?.division?.name ??
                              "—"}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Text size="sm">
                            {employee.section
                              ?.name ?? "—"}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Badge
                            color={status.color}
                            variant="light"
                          >
                            {status.label}
                          </Badge>
                        </Table.Td>

                        <Table.Td>
                          <Text
                            size="sm"
                            c="dimmed"
                          >
                            {formatDate(
                              employee.created_at,
                            )}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  },
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </Stack>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | STATUS ROW
 * |--------------------------------------------------------------------------
 */

interface StatusRowProps {
  status: EmployeeStatus;
  count: number;
  percentage: number;
}

function StatusRow({
  status,
  count,
  percentage,
}: StatusRowProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Group gap="xs">
          <Badge
            size="sm"
            color={config.color}
            variant="light"
          >
            {config.label}
          </Badge>

          <Text
            size="sm"
            c="dimmed"
          >
            {count}{" "}
            {count === 1
              ? "employee"
              : "employees"}
          </Text>
        </Group>

        <Text
          size="sm"
          fw={600}
        >
          {Math.round(percentage)}%
        </Text>
      </Group>

      <Progress
        value={percentage}
        size="sm"
        radius="xl"
        color={config.color}
      />
    </Stack>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | DATE FORMAT
 * |--------------------------------------------------------------------------
 */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}
