import {
  Avatar,
  Alert,
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  TextInput,
  ThemeIcon,
  Tooltip,
  Modal,
  SimpleGrid,
} from "@mantine/core";

import {
  CalendarDays,
  Eye,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  Users,
  Phone,
  Mail,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { Division } from "@/types/hr-fcv/division";
import type { Section } from "@/types/hr-fcv/section";
import type { Employee, EmployeeStatus } from "@/types/hr-fcv/employee";
import { useState } from "react";

/*
 * |--------------------------------------------------------------------------
 * | STATUS CONFIG
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

/*
 * |--------------------------------------------------------------------------
 * | PROPS
 * |--------------------------------------------------------------------------
 */

interface EmployeeTableProps {
  employees: Employee[];
  divisions: Division[];
  sections: Section[];

  loading?: boolean;
  loadingDivisions?: boolean;
  loadingSections?: boolean;

  search: string;
  status: EmployeeStatus | null;
  divisionId: string | null;
  sectionId: string | null;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: EmployeeStatus | null) => void;
  onDivisionChange: (value: string | null) => void;
  onSectionChange: (value: string | null) => void;
  onClearFilters: () => void;

  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;

  onDelete?: (employee: Employee) => void | Promise<void>;
}

/*
 * |--------------------------------------------------------------------------
 * | COMPONENT
 * |--------------------------------------------------------------------------
 */

export default function EmployeeTable({
  employees,
  divisions,
  sections,

  loading = false,
  loadingDivisions = false,
  loadingSections = false,

  search,
  status,
  divisionId,
  sectionId,

  onSearchChange,
  onStatusChange,
  onDivisionChange,
  onSectionChange,
  onClearFilters,

  page,
  lastPage,
  onPageChange,

  onDelete,
}: EmployeeTableProps) {
  /*
   * |--------------------------------------------------------------------------
   * | Link Navigation
   * |--------------------------------------------------------------------------
   */
  const navigate = useNavigate();

  /*
   * |--------------------------------------------------------------------------
   * | Delete State
   * |--------------------------------------------------------------------------
   */

  /*
   * |--------------------------------------------------------------------------
   * | DELETE STATE
   * |--------------------------------------------------------------------------
   */

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCloseDeleteModal = () => {
    if (deleting) return;

    setEmployeeToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete || !onDelete || deleting) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      await onDelete(employeeToDelete);

      setEmployeeToDelete(null);
      setDeleteError(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the employee. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * |--------------------------------------------------------------------------
   * | FILTER OPTIONS
   * |--------------------------------------------------------------------------
   */

  const divisionOptions = divisions.map((division) => ({
    value: String(division.id),
    label: division.name,
  }));

  const sectionOptions = sections.map((section) => ({
    value: String(section.id),
    label: section.name,
  }));

  const hasFilters = Boolean(
    search.trim() || status || divisionId || sectionId,
  );

  return (
    <Stack gap="md">
      {/* =================================================
       * FILTERS
       * ================================================= */}

      {!loading && !loadingDivisions && !loadingSections && (
        <Paper withBorder radius="md" p="md" shadow="xs">
          <Stack gap="sm">
            <Group align="flex-end" grow>
              {/* ===========================================
               * SEARCH
               * =========================================== */}

              <TextInput
                label="Search"
                placeholder="Search name, email, contact number..."
                leftSection={<Search size={17} strokeWidth={1.8} />}
                radius="md"
                value={search}
                onChange={(event) => onSearchChange(event.currentTarget.value)}
              />

              {/* ===========================================
               * STATUS
               * =========================================== */}

              <Select
                label="Status"
                placeholder="All statuses"
                clearable
                radius="md"
                data={[
                  {
                    value: "active",
                    label: "Active",
                  },
                  {
                    value: "retired",
                    label: "Retired",
                  },
                  {
                    value: "resigned",
                    label: "Resigned",
                  },
                ]}
                value={status}
                onChange={(value) =>
                  onStatusChange(value as EmployeeStatus | null)
                }
              />

              {/* ===========================================
               * DIVISION
               * =========================================== */}

              <Select
                label="Division"
                placeholder="All divisions"
                clearable
                searchable
                radius="md"
                data={divisionOptions}
                value={divisionId}
                onChange={onDivisionChange}
              />

              {/* ===========================================
               * SECTION
               * =========================================== */}

              <Select
                label="Section"
                placeholder="All sections"
                clearable
                searchable
                radius="md"
                disabled={sections.length === 0}
                data={sectionOptions}
                value={sectionId}
                onChange={onSectionChange}
              />
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Showing
                <Text span fw={600} c="gray.7">
                  {employees.length}
                </Text>
                employee {employees.length === 1 ? "record" : "records"}
              </Text>

              {hasFilters && (
                <Button variant="subtle" size="xs" onClick={onClearFilters}>
                  Clear filters
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>
      )}
      {/* =================================================
       * TABLE CARD
       * ================================================= */}

      <Paper
        withBorder
        radius="md"
        shadow="xs"
        style={{
          overflow: "hidden",
        }}
      >
        <ScrollArea>
          <Table
            miw={1100}
            verticalSpacing={0}
            horizontalSpacing={0}
            highlightOnHover
            styles={{
              th: {
                backgroundColor: "var(--mantine-color-default)",
                borderBottom: "1px solid var(--mantine-color-default-border)",
                color: "var(--mantine-color-dimmed)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              },

              td: {
                borderBottom: "1px solid var(--mantine-color-default-border)",
              },

              tr: {
                transition: "background-color 120ms ease",
              },
            }}
          >
            {/* =================================================
             * HEADER
             * ================================================= */}

            <Table.Thead>
              <Table.Tr>
                <Table.Th px="xl" py="sm">
                  Employee
                </Table.Th>

                <Table.Th px="lg" py="sm" w={180}>
                  Division
                </Table.Th>

                <Table.Th px="lg" py="sm" w={180}>
                  Section
                </Table.Th>

                <Table.Th px="lg" py="sm" w={210}>
                  Contact
                </Table.Th>

                <Table.Th px="lg" py="sm" w={120}>
                  Status
                </Table.Th>

                <Table.Th px="lg" py="sm" w={150}>
                  Date Added
                </Table.Th>

                <Table.Th px="lg" py="sm" ta="right" w={80}>
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            {/* =================================================
             * BODY
             * ================================================= */}

            <Table.Tbody>
              {loading ? (
                <EmployeeTableSkeleton />
              ) : employees.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} py={70}>
                    <Stack align="center" gap="sm">
                      <ThemeIcon
                        size={56}
                        radius="xl"
                        variant="light"
                        color="gray"
                      >
                        <Users size={27} strokeWidth={1.5} />
                      </ThemeIcon>

                      <Stack align="center" gap={3}>
                        <Text fw={600} size="sm">
                          No employees found
                        </Text>

                        <Text size="xs" c="dimmed">
                          Try adjusting your search or filters.
                        </Text>
                      </Stack>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                employees.map((employee) => {
                  const fullName = [
                    employee.first_name,
                    employee.middle_name,
                    employee.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const initials = [employee.first_name, employee.last_name]
                    .filter(Boolean)
                    .map((name) => name.charAt(0).toUpperCase())
                    .join("");

                  const statusConfig = STATUS_CONFIG[employee.status] ?? {
                    label: employee.status,
                    color: "gray",
                  };

                  return (
                    <Table.Tr key={employee.id} className="employee-table-row">
                      <Table.Td px="xl" py="md">
                        <Group align="center" wrap="nowrap" gap="sm">
                          <Avatar
                            size={46}
                            radius="xl"
                            color="blue"
                            variant="light"
                            fw={700}
                          >
                            {initials || <Users size={20} />}
                          </Avatar>

                          <Stack gap={4} style={{ minWidth: 0 }}>
                            <Text size="sm" fw={650} lineClamp={1}>
                              {fullName || "Unnamed employee"}
                            </Text>

                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {employee.email || "No email provided"}
                            </Text>

                            <Group gap={6} wrap="nowrap">
                              <CalendarDays
                                size={13}
                                strokeWidth={1.8}
                                color="var(--mantine-color-dimmed)"
                              />

                              <Text size="xs" c="dimmed">
                                Born{" "}
                                {employee.date_birth
                                  ? formatDate(employee.date_birth)
                                  : "Not provided"}
                              </Text>
                            </Group>
                          </Stack>
                        </Group>
                      </Table.Td>

                      {/* DIVISION */}
                      <Table.Td px="lg" py="md">
                        <Badge
                          variant="light"
                          color="violet"
                          radius="sm"
                          size="lg"
                          fw={500}
                          styles={{
                            root: {
                              height: "auto",
                              maxWidth: "100%",
                              whiteSpace: "normal",
                              textAlign: "left",
                            },
                            label: {
                              whiteSpace: "normal",
                              overflow: "visible",
                              textOverflow: "unset",
                              overflowWrap: "anywhere",
                              lineHeight: 1.4,
                            },
                          }}
                        >
                          {employee.section?.division?.name ?? "No division"}
                        </Badge>
                      </Table.Td>

                      {/* SECTION */}
                      <Table.Td px="lg" py="md">
                        <Badge
                          variant="light"
                          color="blue"
                          radius="sm"
                          size="lg"
                          fw={500}
                          styles={{
                            root: {
                              height: "auto",
                              maxWidth: "100%",
                              whiteSpace: "normal",
                              textAlign: "left",
                            },
                            label: {
                              whiteSpace: "normal",
                              overflow: "visible",
                              textOverflow: "unset",
                              overflowWrap: "anywhere",
                              lineHeight: 1.4,
                            },
                          }}
                        >
                          {employee.section?.name ?? "No section"}
                        </Badge>
                      </Table.Td>

                      {/* CONTACT */}
                      <Table.Td px="lg" py="md">
                        <Stack gap={8}>
                          {/* Phone number */}
                          <Group gap="xs" wrap="nowrap">
                            <ThemeIcon
                              variant="light"
                              color="gray"
                              size={28}
                              radius="md"
                            >
                              <Phone size={14} strokeWidth={1.8} />
                            </ThemeIcon>

                            <Text size="sm" fw={500} lineClamp={1}>
                              {employee.contact_number || "No contact number"}
                            </Text>
                          </Group>

                          {/* Email */}
                          <Group gap="xs" wrap="nowrap">
                            <ThemeIcon
                              variant="light"
                              color="gray"
                              size={28}
                              radius="md"
                            >
                              <Mail size={14} strokeWidth={1.8} />
                            </ThemeIcon>

                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {employee.email || "No email provided"}
                            </Text>
                          </Group>
                        </Stack>
                      </Table.Td>
                      <Table.Td px="lg" py="md">
                        <Badge
                          size="sm"
                          variant="light"
                          color={statusConfig.color}
                          radius="sm"
                          fw={600}
                        >
                          {statusConfig.label}
                        </Badge>
                      </Table.Td>

                      <Table.Td px="lg" py="md">
                        <Group gap={8} wrap="nowrap">
                          <CalendarDays
                            size={15}
                            strokeWidth={1.8}
                            color="var(--mantine-color-dimmed)"
                          />

                          <Text
                            size="sm"
                            c="dimmed"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {formatDate(employee.created_at)}
                          </Text>
                        </Group>
                      </Table.Td>

                      <Table.Td px="lg" py="md">
                        <Group justify="flex-end">
                          <Menu
                            shadow="md"
                            width={180}
                            position="bottom-end"
                            withinPortal
                          >
                            <Menu.Target>
                              <Tooltip label="More actions">
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="lg"
                                  radius="md"
                                  aria-label={`Actions for ${fullName}`}
                                >
                                  <MoreVertical size={18} strokeWidth={1.8} />
                                </ActionIcon>
                              </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<Eye size={16} />}
                                onClick={() => {
                                  // Add employee view navigation here.
                                }}
                              >
                                View employee
                              </Menu.Item>

                              <Menu.Item
                                leftSection={<Pencil size={16} />}
                                onClick={() =>
                                  navigate(
                                    `/human-resource/edit-employee/${employee.id}`,
                                  )
                                }
                              >
                                Edit employee
                              </Menu.Item>

                              <Divider my={4} />

                              <Menu.Item
                                color="red"
                                leftSection={<Trash2 size={16} />}
                                onClick={() => {
                                  setDeleteError(null);
                                  setEmployeeToDelete(employee);
                                }}
                                disabled={!onDelete}
                              >
                                Delete employee
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* =================================================
         * FOOTER
         * ================================================= */}

        {!loading && employees.length > 0 && (
          <>
            <Divider />

            <Group justify="space-between" px="xl" py="sm">
              <Text size="xs" c="dimmed">
                Page
                <Text span fw={600} c="gray.7">
                  {page}
                </Text>
                of
                <Text span fw={600} c="gray.7">
                  {lastPage}
                </Text>
              </Text>

              <Group gap="xs">
                <Button
                  variant="default"
                  size="xs"
                  radius="md"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="default"
                  size="xs"
                  radius="md"
                  disabled={page >= lastPage}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Paper>

      {/* -------------------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* -------------------------------------------------------------------------- */}

      <Modal
        opened={employeeToDelete !== null}
        onClose={handleCloseDeleteModal}
        centered
        size="md"
        radius="lg"
        withCloseButton={!deleting}
        closeOnClickOutside={!deleting}
        closeOnEscape={!deleting}
        title={null}
        padding="lg"
      >
        {employeeToDelete && (
          <Stack gap="lg">
            {/* -------------------------------------------------------------------- */}
            {/* HEADER */}
            {/* -------------------------------------------------------------------- */}

            <Group align="flex-start" gap="md" wrap="nowrap">
              <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
                <Trash2 size={22} />
              </Box>

              <Stack gap={3}>
                <Title order={3} className="!text-[var(--text-h)]">
                  Delete Employee
                </Title>

                <Text size="sm" c="dimmed">
                  This action will permanently remove this employee record.
                  Please review the employee information before proceeding.
                </Text>
              </Stack>
            </Group>

            {/* -------------------------------------------------------------------- */}
            {/* EMPLOYEE INFORMATION */}
            {/* -------------------------------------------------------------------- */}

            <Paper
              withBorder
              radius="md"
              p="md"
              className="bg-[var(--mantine-color-body)]"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" className="min-w-0">
                  {/* Employee Avatar */}

                  <Avatar size={42} radius="xl" color="gray">
                    {[
                      employeeToDelete.first_name,
                      employeeToDelete.middle_name,
                      employeeToDelete.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>

                  {/* Employee Details */}

                  <Stack gap={1} className="min-w-0">
                    <Text size="sm" fw={700} truncate>
                      {[
                        employeeToDelete.first_name,
                        employeeToDelete.middle_name,
                        employeeToDelete.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>

                    <Text size="xs" c="dimmed" truncate>
                      {employeeToDelete.email || "No email provided"}
                    </Text>

                    <Text size="xs" c="dimmed" truncate>
                      Employee ID: {employeeToDelete.id}
                    </Text>
                  </Stack>
                </Group>

                {/* Current Status */}
                <Badge
                  size="md"
                  variant="light"
                  color={
                    STATUS_CONFIG[employeeToDelete.status]?.color ?? "gray"
                  }
                  style={{
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {STATUS_CONFIG[employeeToDelete.status]?.label ?? "Unknown"}
                </Badge>
              </Group>

              {/* Department Information */}

              <Divider my="sm" />

              <SimpleGrid cols={2} spacing="sm">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Section
                  </Text>

                  <Text size="xs" fw={600} truncate>
                    {employeeToDelete.section?.name || "—"}
                  </Text>
                </Stack>

                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    Division
                  </Text>

                  <Text size="xs" fw={600} truncate>
                    {employeeToDelete.section?.division?.name || "—"}
                  </Text>
                </Stack>
              </SimpleGrid>
            </Paper>

            {/* -------------------------------------------------------------------- */}
            {/* DELETE WARNING */}
            {/* -------------------------------------------------------------------- */}

            <Alert
              variant="light"
              color="red"
              radius="md"
              icon={<Trash2 size={18} />}
            >
              <Text size="sm" fw={600} mb={2}>
                This employee will be deleted
              </Text>

              <Text size="xs">
                You are about to delete this employee record. Make sure this is
                the correct employee before continuing. If the record is linked
                to other records, the server may prevent deletion.
              </Text>
            </Alert>

            {/* -------------------------------------------------------------------- */}
            {/* ERROR */}
            {/* -------------------------------------------------------------------- */}

            {deleteError && (
              <Alert
                color="red"
                variant="light"
                radius="md"
                title="Unable to delete employee"
              >
                {deleteError}
              </Alert>
            )}

            {/* -------------------------------------------------------------------- */}
            {/* ACTIONS */}
            {/* -------------------------------------------------------------------- */}

            <Group justify="flex-end" gap="sm" mt="xs">
              <Button
                variant="default"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                color="red"
                variant="filled"
                leftSection={<Trash2 size={16} />}
                loading={deleting}
                onClick={handleConfirmDelete}
              >
                Delete Employee
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | TABLE SKELETON
 * |--------------------------------------------------------------------------
 */

function EmployeeTableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Table.Tr key={index}>
          {/* =============================================
           * EMPLOYEE
           * ============================================= */}

          <Table.Td px="xl" py="lg">
            <Group align="flex-start" wrap="nowrap" gap="md">
              <Skeleton height={54} width={54} radius="md" />

              <Stack gap={6}>
                <Skeleton height={15} width={180} radius="sm" />

                <Skeleton height={12} width={210} radius="sm" />

                <Skeleton height={10} width={130} radius="sm" />
              </Stack>
            </Group>
          </Table.Td>

          {/* =============================================
           * DIVISION
           * ============================================= */}

          <Table.Td px="lg" py="lg">
            <Skeleton height={14} width={120} radius="sm" />
          </Table.Td>

          {/* =============================================
           * SECTION
           * ============================================= */}

          <Table.Td px="lg" py="lg">
            <Skeleton height={14} width={120} radius="sm" />
          </Table.Td>

          {/* =============================================
           * CONTACT
           * ============================================= */}

          <Table.Td px="lg" py="lg">
            <Stack gap={6}>
              <Skeleton height={14} width={130} radius="sm" />

              <Skeleton height={11} width={150} radius="sm" />
            </Stack>
          </Table.Td>

          {/* =============================================
           * STATUS
           * ============================================= */}

          <Table.Td px="lg" py="lg">
            <Skeleton height={24} width={70} radius="xl" />
          </Table.Td>

          {/* =============================================
           * DATE
           * ============================================= */}

          <Table.Td px="lg" py="lg">
            <Skeleton height={14} width={100} radius="sm" />
          </Table.Td>

          {/* =============================================
           * ACTIONS
           * ============================================= */}

          <Table.Td px="lg" py="lg">
            <Group justify="flex-end">
              <Skeleton height={34} width={34} radius="md" />
            </Group>
          </Table.Td>
        </Table.Tr>
      ))}
    </>
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

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
