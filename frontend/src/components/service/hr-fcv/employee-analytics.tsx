import {
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  BriefcaseBusiness,
  Building2,
  Clock3,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type {
  Employee,
  EmployeeStatus,
} from "@/types/hr-fcv/employee";

const GOLD = "#C9A227";

interface HrAnalyticsProps {
  employees?: Employee[] | null;
  divisionsCount?: number | null;
  sectionsCount?: number | null;
  loading?: boolean;
}

export default function HrAnalytics({
  employees,
  divisionsCount,
  sectionsCount,
  loading = false,
}: HrAnalyticsProps) {
  /*
   * |--------------------------------------------------------------------------
   * | LOADING STATE
   * |--------------------------------------------------------------------------
   */

  const isLoading =
    loading ||
    employees === undefined ||
    employees === null ||
    divisionsCount === undefined ||
    divisionsCount === null ||
    sectionsCount === undefined ||
    sectionsCount === null;

  /*
   * |--------------------------------------------------------------------------
   * | EMPLOYEE COUNTS
   * |--------------------------------------------------------------------------
   */

  const employeeCounts: Record<EmployeeStatus, number> = {
    active:
      employees?.filter(
        (employee) => employee.status === "active",
      ).length ?? 0,

    retired:
      employees?.filter(
        (employee) => employee.status === "retired",
      ).length ?? 0,

    resigned:
      employees?.filter(
        (employee) => employee.status === "resigned",
      ).length ?? 0,
  };

  /*
   * |--------------------------------------------------------------------------
   * | STATISTICS
   * |--------------------------------------------------------------------------
   */

  const statistics = [
    {
      label: "Total Employees",
      value: employees?.length ?? 0,
      icon: Users,
      description: "All employee records",
    },
    {
      label: "Active",
      value: employeeCounts.active,
      icon: UserCheck,
      description: "Currently employed",
    },
    {
      label: "Retired",
      value: employeeCounts.retired,
      icon: Clock3,
      description: "Retired employees",
    },
    {
      label: "Resigned",
      value: employeeCounts.resigned,
      icon: UserPlus,
      description: "Resigned employees",
    },
    {
      label: "Divisions",
      value: divisionsCount ?? 0,
      icon: Building2,
      description: "Organizational divisions",
    },
    {
      label: "Sections",
      value: sectionsCount ?? 0,
      icon: BriefcaseBusiness,
      description: "Organizational sections",
    },
  ];

  /*
   * |--------------------------------------------------------------------------
   * | RENDER
   * |--------------------------------------------------------------------------
   */

  return (
    <SimpleGrid
      cols={{
        base: 1,
        xs: 2,
        sm: 3,
        lg: 4,
      }}
      spacing="md"
    >
      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            withBorder
            radius="lg"
            padding="lg"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >
            <Group
              justify="space-between"
              align="flex-start"
            >
              {/* -------------------------------------------------------------- */}
              {/* STAT INFORMATION */}
              {/* -------------------------------------------------------------- */}

              <div>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                >
                  {stat.label}
                </Text>

                {isLoading ? (
                  <Skeleton
                    height={30}
                    width={55}
                    mt={8}
                    radius="sm"
                  />
                ) : (
                  <Title
                    order={2}
                    mt={8}
                  >
                    {stat.value.toLocaleString()}
                  </Title>
                )}

                {isLoading ? (
                  <Skeleton
                    height={12}
                    width="80%"
                    mt={8}
                    radius="sm"
                  />
                ) : (
                  <Text
                    size="xs"
                    c="dimmed"
                    mt={4}
                  >
                    {stat.description}
                  </Text>
                )}
              </div>

              {/* -------------------------------------------------------------- */}
              {/* ICON */}
              {/* -------------------------------------------------------------- */}

              <ThemeIcon
                variant="light"
                color="yellow"
                size="xl"
                radius="md"
              >
                <Icon
                  size={20}
                  color={GOLD}
                />
              </ThemeIcon>
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
