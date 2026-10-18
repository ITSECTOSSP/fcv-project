import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";

import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Package,
  Plus,
  UserRoundCog,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { getEquipment } from "@/lib/api/inv-fcv/equipment";
import { getEquipmentAssignments } from "@/lib/api/inv-fcv/equipment-assignment";
import { employeeApi } from "@/lib/api/hr-fcv/employee";
import { getAttachmentTypes } from "@/lib/api/inv-fcv/attachment-types";

import type { Equipment } from "@/types/inv-fcv/equipment";
import type { EquipmentAssignment } from "@/types/inv-fcv/equipment-assignment";
import type { AttachmentType } from "@/types/inv-fcv/attachment-type";
import type { Employee } from "@/types/hr-fcv/employee";

import EquipmentAssignmentForm from "@/components/service/inv-fcv/assignment/equipment-assignment-form";
import EquipmentTransferForm from "@/components/service/inv-fcv/assignment/equipment-transfer-form";

export default function AssignEquipment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAssignmentModalOpen, setNewAssignmentModalOpen] = useState(false);

  const [assignments, setAssignments] = useState<EquipmentAssignment[]>([]);
  const [disposedQuantity, setDisposedQuantity] = useState(0);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  const [assignmentHistory, setAssignmentHistory] = useState<
    EquipmentAssignment[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
  const [loadingAttachmentTypes, setLoadingAttachmentTypes] = useState(false);

  /*
   * Resolve an employee UUID to its HR employee record.
   */
  const employeeById = useMemo(() => {
    return new Map(employees.map((employee) => [employee.id, employee]));
  }, [employees]);

  const getEmployee = useCallback(
    (employeeId: string | null | undefined) => {
      if (!employeeId) return undefined;
      return employeeById.get(employeeId);
    },
    [employeeById],
  );

  const getEmployeeName = useCallback(
    (employeeId: string | null | undefined) => {
      const employee = getEmployee(employeeId);

      if (!employee) {
        return employeeId ? "Employee information unavailable" : "Not assigned";
      }

      return [employee.first_name, employee.middle_name, employee.last_name]
        .filter(Boolean)
        .join(" ");
    },
    [getEmployee],
  );

  /*
   * Load employee records from the HR microservice.
   *
   * Fetch multiple pages if the HR API returns pagination.
   */
  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);

        const firstResponse = await employeeApi.index({ per_page: 100 });
        const firstPage = firstResponse.data;

        let allEmployees = [...(firstPage.data ?? [])];
        const lastPage = Number(firstPage.last_page ?? 1);

        for (let page = 2; page <= lastPage; page++) {
          const pageResponse = await employeeApi.index({
            per_page: 100,
            page,
          });

          allEmployees = allEmployees.concat(pageResponse.data.data ?? []);
        }

        if (!cancelled) {
          setEmployees(allEmployees);
        }
      } catch (err) {
        console.error("Failed to load HR employees:", err);

        if (!cancelled) {
          setEmployees([]);
        }
      } finally {
        if (!cancelled) {
          setEmployeesLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load equipment.
   */
  useEffect(() => {
    let cancelled = false;

    const loadEquipment = async () => {
      if (!id) {
        setError("Equipment ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getEquipment(id);

        if (!cancelled) {
          setEquipment(response.data);
        }
      } catch (err) {
        console.error("Failed to load equipment:", err);

        if (!cancelled) {
          setError("Unable to load the equipment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEquipment();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * Load displayed assignments.
   */
  const loadAssignments = useCallback(async (): Promise<
    EquipmentAssignment[]
  > => {
    if (!id) return [];

    try {
      setAssignmentsLoading(true);
      setAssignmentsError(null);

      const response = await getEquipmentAssignments({
        equipment_id: id,
        per_page: 100,
      });

      const displayedAssignments = response.data.filter(
        (assignment) =>
          assignment.status === "active" ||
          assignment.status === "returned" ||
          assignment.status === "disposed",
      );

      const disposedTotal = displayedAssignments
        .filter((assignment) => assignment.status === "disposed")
        .reduce((sum, assignment) => sum + Number(assignment.quantity ?? 0), 0);

      setAssignments(displayedAssignments);
      setDisposedQuantity(disposedTotal);

      return displayedAssignments;
    } catch (err) {
      console.error("Failed to load equipment assignments:", err);

      setAssignmentsError("Unable to load the equipment assignments.");
      setAssignments([]);
      setDisposedQuantity(0);

      return [];
    } finally {
      setAssignmentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (equipment) {
      void loadAssignments();
    }
  }, [equipment, loadAssignments]);

  /*
   * Inventory quantity summary.
   */
  const quantitySummary = useMemo(() => {
    const total = Number(equipment?.quantity ?? 0);

    const assigned = assignments
      .filter((assignment) => assignment.status === "active")
      .reduce((sum, assignment) => sum + Number(assignment.quantity ?? 0), 0);

    const disposed = disposedQuantity;
    const available = Math.max(total - assigned - disposed, 0);

    let status = "Available";
    let statusColor = "green";

    if (available <= 0 && total > 0) {
      status = "Fully Allocated";
      statusColor = "red";
    } else if (assigned > 0 || disposed > 0) {
      status = "Partially Allocated";
      statusColor = "orange";
    }

    return {
      total,
      assigned,
      disposed,
      available,
      status,
      statusColor,
    };
  }, [equipment, assignments, disposedQuantity]);

  const activeAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === "active"),
    [assignments],
  );

  /*
   * Group assignments for display.
   */
  const groupedAssignments = useMemo(() => {
    const groups = new Map<string, EquipmentAssignment[]>();

    assignments.forEach((assignment) => {
      const groupId = assignment.assignment_group_id;

      if (!groups.has(groupId)) groups.set(groupId, []);
      groups.get(groupId)!.push(assignment);
    });

    return Array.from(groups.entries())
      .map(([groupId, groupAssignments]) => {
        const sorted = [...groupAssignments].sort((a, b) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;

          const dateDifference =
            new Date(b.assigned_at).getTime() -
            new Date(a.assigned_at).getTime();

          if (dateDifference !== 0) return dateDifference;

          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        return { groupId, assignments: sorted };
      })
      .sort((a, b) => {
        const aHasActive = a.assignments.some(
          (item) => item.status === "active",
        );
        const bHasActive = b.assignments.some(
          (item) => item.status === "active",
        );

        if (aHasActive && !bHasActive) return -1;
        if (!aHasActive && bHasActive) return 1;

        return (
          new Date(b.assignments[0]?.assigned_at ?? 0).getTime() -
          new Date(a.assignments[0]?.assigned_at ?? 0).getTime()
        );
      });
  }, [assignments]);

  /*
   * Load the complete transfer history for an assignment group.
   */
  const loadAssignmentHistory = async (
    assignment: EquipmentAssignment,
  ): Promise<EquipmentAssignment[]> => {
    try {
      setHistoryLoading(true);
      setAssignmentsError(null);

      const response = await getEquipmentAssignments({
        assignment_group_id: assignment.assignment_group_id,
        per_page: 100,
      });

      setAssignmentHistory(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to load assignment history:", err);

      setAssignmentHistory([]);
      setAssignmentsError("Unable to load the assignment history.");

      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  const selectedAssignment =
    assignments.find((assignment) => assignment.id === selectedAssignmentId) ??
    null;

  const handleSelectAssignment = async (assignment: EquipmentAssignment) => {
    if (assignment.id === selectedAssignmentId) return;

    setSelectedAssignmentId(assignment.id);
    setAssignmentHistory([]);

    await loadAssignmentHistory(assignment);
  };

  const clearTransferSelection = () => {
    setSelectedAssignmentId(null);
    setAssignmentHistory([]);
    setAssignmentsError(null);
  };

  const handleNewAssignmentSuccess = async () => {
    setNewAssignmentModalOpen(false);
    await loadAssignments();
  };

  const handleTransferSuccess = async () => {
    if (!selectedAssignmentId) return;

    const previousAssignment = activeAssignments.find(
      (item) => item.id === selectedAssignmentId,
    );

    const previousGroupId = previousAssignment?.assignment_group_id;

    if (!previousGroupId) return;

    const refreshedAssignments = await loadAssignments();

    const newActiveAssignment = refreshedAssignments.find(
      (item) =>
        item.assignment_group_id === previousGroupId &&
        item.status === "active",
    );

    if (!newActiveAssignment) {
      setSelectedAssignmentId(null);
      setAssignmentHistory([]);
      return;
    }

    setSelectedAssignmentId(newActiveAssignment.id);
    await loadAssignmentHistory(newActiveAssignment);
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /*
   * Load attachment types.
   */
  useEffect(() => {
    let cancelled = false;

    const loadTypes = async () => {
      try {
        setLoadingAttachmentTypes(true);

        const response = await getAttachmentTypes();

        if (!cancelled) {
          setAttachmentTypes(response.data);
        }
      } catch (err) {
        console.error("Failed to load attachment types:", err);

        if (!cancelled) setAttachmentTypes([]);
      } finally {
        if (!cancelled) setLoadingAttachmentTypes(false);
      }
    };

    loadTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <Stack gap="lg">
        <Skeleton height={36} width={280} />

        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group>
              <Skeleton height={44} width={44} radius="md" />
              <Stack gap={6}>
                <Skeleton height={20} width={240} />
                <Skeleton height={14} width={160} />
              </Stack>
            </Group>

            <Divider />

            <Group grow>
              <Skeleton height={76} />
              <Skeleton height={76} />
              <Skeleton height={76} />
              <Skeleton height={76} />
            </Group>
          </Stack>
        </Paper>

        <Skeleton height={400} />
      </Stack>
    );
  }

  if (error || !equipment) {
    return (
      <Stack gap="md">
        <Alert
          color="red"
          icon={<AlertCircle size={18} />}
          title="Unable to load equipment"
        >
          {error ?? "The requested equipment could not be found."}
        </Alert>

        <Button
          variant="default"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate("/inventory/manage")}
        >
          Back to Equipment
        </Button>
      </Stack>
    );
  }

  const renderEmployee = (employeeId: string | null | undefined) => {
    const employee = getEmployee(employeeId);

    if (!employee) {
      return (
        <Group gap="sm" wrap="nowrap">
          <Avatar color="gray" radius="xl" size="md">
            <UserRoundCog size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text size="sm" fw={500}>
              {employeeId ? "Employee information unavailable" : "Unassigned"}
            </Text>
            {employeeId && (
              <Text size="xs" c="dimmed">
                ID: {employeeId}
              </Text>
            )}
          </Stack>
        </Group>
      );
    }

    const employeeName = [
      employee.first_name,
      employee.middle_name,
      employee.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const sectionName = employee.section?.name ?? "No section assigned";
    const divisionName =
      employee.section?.division?.name ?? "No division assigned";

    return (
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Avatar color="blue" radius="xl" size="md">
          {`${employee.first_name?.[0] ?? ""}${employee.last_name?.[0] ?? ""}`}
        </Avatar>

        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text size="sm" fw={600} style={{ overflowWrap: "anywhere" }}>
            {employeeName}
          </Text>

          <Text size="xs" c="dimmed" style={{ overflowWrap: "anywhere" }}>
            {employee.email}
          </Text>

          <Group gap={6} wrap="wrap">
            <Badge variant="light" color="blue" size="sm">
              Section: {sectionName}
            </Badge>

            <Badge variant="light" color="grape" size="sm">
              Division: {divisionName}
            </Badge>
          </Group>
        </Stack>
      </Group>
    );
  };

  return (
    <>
      <Stack gap="lg">
        {/* Page header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="xl" fw={700}>
              Assign Equipment
            </Text>

            <Text size="sm" c="dimmed">
              Assign or transfer this equipment to an employee.
            </Text>
          </div>

          <Group gap="xs">
            <Button
              leftSection={<Plus size={17} />}
              onClick={() => setNewAssignmentModalOpen(true)}
              disabled={quantitySummary.available <= 0}
            >
              New Assignment
            </Button>

            <Button
              variant="default"
              leftSection={<ArrowLeft size={17} />}
              onClick={() => navigate("/inventory/manage")}
            >
              Back to Equipments
            </Button>
          </Group>
        </Group>

        {/* Equipment information */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={40} radius="md" variant="light" color="gray">
                  <Package size={21} />
                </ThemeIcon>

                <div>
                  <Text fw={700} size="md" lh={1.2}>
                    {equipment.description}
                  </Text>

                  <Group gap="xs" mt={4}>
                    <Text size="xs" c="dimmed">
                      {equipment.equipment_type?.name ?? "Equipment"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      •
                    </Text>
                    <Text size="xs" c="dimmed">
                      Property No. {equipment.property_number}
                    </Text>
                  </Group>
                </div>
              </Group>

              {!assignmentsLoading && (
                <Group gap="xs" wrap="nowrap">
                  <Badge
                    color={quantitySummary.statusColor}
                    variant="light"
                    size="sm"
                    leftSection={<CheckCircle2 size={12} />}
                  >
                    {quantitySummary.status}
                  </Badge>

                  {quantitySummary.disposed > 0 && (
                    <Badge color="red" variant="light" size="sm">
                      Disposed: {quantitySummary.disposed}
                    </Badge>
                  )}
                </Group>
              )}
            </Group>

            <Divider />

            <Group gap="xl" wrap="wrap">
              <div>
                <Text size="xs" c="dimmed">
                  Property Number
                </Text>
                <Text size="sm" fw={600}>
                  {equipment.property_number}
                </Text>
              </div>

              <div>
                <Text size="xs" c="dimmed">
                  Serial Number
                </Text>
                <Text size="sm" fw={600}>
                  {equipment.serial_number || "N/A"}
                </Text>
              </div>

              <div>
                <Text size="xs" c="dimmed">
                  Equipment Type
                </Text>
                <Text size="sm" fw={600}>
                  {equipment.equipment_type?.name ?? "Equipment"}
                </Text>
              </div>
            </Group>

            <div>
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" fw={600}>
                  Quantity & Availability
                </Text>
                <Text size="xs" c="dimmed">
                  Current inventory allocation
                </Text>
              </Group>

              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                {[
                  {
                    label: "Total",
                    value: quantitySummary.total,
                    description: "Units",
                    color: "gray",
                  },
                  {
                    label: "Assigned",
                    value: quantitySummary.assigned,
                    description: "Currently assigned",
                    color: "orange",
                  },
                  {
                    label: "Disposed",
                    value: quantitySummary.disposed,
                    description: "Permanently disposed",
                    color: "red",
                  },
                  {
                    label: "Available",
                    value: quantitySummary.available,
                    description: "Available for assignment",
                    color: "green",
                  },
                ].map((item) => (
                  <Paper
                    key={item.label}
                    withBorder
                    p="sm"
                    radius="sm"
                    style={{
                      borderLeft: `3px solid var(--mantine-color-${item.color}-5)`,
                    }}
                  >
                    <Text size="xs" c="dimmed">
                      {item.label}
                    </Text>

                    {assignmentsLoading ? (
                      <Skeleton height={24} width={45} mt={4} />
                    ) : (
                      <Text
                        size="lg"
                        fw={700}
                        mt={2}
                        c={
                          item.color === "gray" ? undefined : `${item.color}.7`
                        }
                      >
                        {item.value}
                      </Text>
                    )}

                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>
            </div>
          </Stack>
        </Paper>

        {/* Assignment history */}
        <Stack gap="md">
          {assignmentsError && (
            <Alert
              color="red"
              icon={<AlertCircle size={18} />}
              title="Assignment Error"
            >
              {assignmentsError}
            </Alert>
          )}

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Group gap="xs">
                  <ArrowLeftRight size={18} />
                  <Text fw={600}>Assignment History</Text>
                </Group>

                <Text size="sm" c="dimmed" mt={3}>
                  View active, returned, and disposed assignments. Select an
                  assignment to view its complete assignment thread.
                </Text>
              </div>

              <Group gap="xs">
                {employeesLoading && (
                  <Badge variant="light">Loading employees…</Badge>
                )}
                <Badge variant="light">
                  {groupedAssignments.length} groups
                </Badge>
              </Group>
            </Group>

            <Divider my="md" />

            {assignmentsLoading ? (
              <Stack gap="sm">
                <Skeleton height={80} />
                <Skeleton height={80} />
              </Stack>
            ) : groupedAssignments.length === 0 ? (
              <Alert
                color="blue"
                icon={<AlertCircle size={18} />}
                title="No assignment history"
              >
                This equipment currently has no active, returned, or disposed
                assignments.
              </Alert>
            ) : (
              <Stack gap="md">
                {groupedAssignments.map(
                  ({ groupId, assignments: groupAssignments }) => (
                    <Paper key={groupId} withBorder p="md" radius="md">
                      <Stack gap="sm">
                        {groupAssignments.map((assignment, index) => {
                          const selected =
                            assignment.id === selectedAssignmentId;

                          const statusConfig = {
                            active: { label: "Active", color: "green" },
                            returned: { label: "Returned", color: "blue" },
                            disposed: { label: "Disposed", color: "red" },
                          } as const;

                          const status =
                            statusConfig[
                              assignment.status as keyof typeof statusConfig
                            ];

                          return (
                            <div key={assignment.id}>
                              {index > 0 && (
                                <Divider
                                  my="sm"
                                  label="Previous Assignment"
                                  labelPosition="left"
                                />
                              )}

                              <Paper
                                withBorder
                                p="md"
                                radius="md"
                                onClick={() =>
                                  void handleSelectAssignment(assignment)
                                }
                                style={{
                                  position: "relative",
                                  cursor: "pointer",
                                  borderWidth: selected ? 2 : 1,
                                  borderColor: selected
                                    ? "var(--mantine-primary-color-filled)"
                                    : undefined,
                                  backgroundColor: selected
                                    ? "var(--mantine-primary-color-light)"
                                    : undefined,
                                  transition:
                                    "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
                                  boxShadow: selected
                                    ? "var(--mantine-shadow-sm)"
                                    : undefined,
                                }}
                              >
                                <Stack gap="sm">
                                  {/* Assigned employee */}
                                  <Group
                                    justify="space-between"
                                    align="flex-start"
                                    wrap="nowrap"
                                  >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      {renderEmployee(
                                        assignment.user_employee_id,
                                      )}

                                      <Group gap="xs" mt="xs">
                                        <Badge
                                          size="xs"
                                          color={status.color}
                                          variant="light"
                                        >
                                          {status.label}
                                        </Badge>

                                        {assignment.is_care_of && (
                                          <Badge
                                            size="xs"
                                            color="blue"
                                            variant="light"
                                          >
                                            Care Of
                                          </Badge>
                                        )}
                                      </Group>
                                    </div>

                                    {selected && (
                                      <Badge
                                        size="sm"
                                        color="yellow"
                                        variant="filled"
                                        leftSection={<Check size={12} />}
                                      >
                                        Selected
                                      </Badge>
                                    )}
                                  </Group>

                                  {/* Care-of employee */}
                                  {assignment.is_care_of && (
                                    <Paper
                                      withBorder
                                      radius="sm"
                                      p="sm"
                                      bg="var(--mantine-color-gray-0)"
                                    >
                                      <Text size="xs" c="dimmed" mb="xs">
                                        Care-of employee
                                      </Text>

                                      {renderEmployee(
                                        assignment.care_of_employee_id,
                                      )}
                                    </Paper>
                                  )}

                                  <Divider />

                                  {/* Assignment metadata */}
                                  <Group gap="xl" wrap="wrap">
                                    <Group gap="xs">
                                      <ThemeIcon
                                        size={28}
                                        radius="md"
                                        variant="light"
                                        color="blue"
                                      >
                                        <CalendarDays size={14} />
                                      </ThemeIcon>

                                      <div>
                                        <Text size="xs" c="dimmed">
                                          Date Assigned
                                        </Text>
                                        <Text size="xs" fw={600} mt={1}>
                                          {formatDate(assignment.assigned_at)}
                                        </Text>
                                      </div>
                                    </Group>

                                    <Group gap="xs">
                                      <ThemeIcon
                                        size={28}
                                        radius="md"
                                        variant="light"
                                        color="gray"
                                      >
                                        <Package size={14} />
                                      </ThemeIcon>

                                      <div>
                                        <Text size="xs" c="dimmed">
                                          Quantity
                                        </Text>
                                        <Text size="xs" fw={600} mt={1}>
                                          {assignment.quantity}
                                        </Text>
                                      </div>
                                    </Group>

                                    <div>
                                      <Text size="xs" c="dimmed">
                                        Property Number
                                      </Text>
                                      <Text size="xs" fw={600} mt={1}>
                                        {assignment.property_number}
                                      </Text>
                                    </div>

                                    {assignment.returned_at && (
                                      <div>
                                        <Text size="xs" c="dimmed">
                                          End Date
                                        </Text>
                                        <Text size="xs" fw={600} mt={1}>
                                          {formatDate(assignment.returned_at)}
                                        </Text>
                                      </div>
                                    )}
                                  </Group>
                                </Stack>
                              </Paper>
                            </div>
                          );
                        })}
                      </Stack>
                    </Paper>
                  ),
                )}
              </Stack>
            )}
          </Paper>

          {/* Selected assignment thread */}
          {selectedAssignment &&
            (historyLoading ? (
              <Paper withBorder p="md" radius="md">
                <Stack gap="md">
                  <Skeleton height={28} width={220} />
                  <Skeleton height={80} />
                  <Skeleton height={80} />
                  <Skeleton height={250} />
                </Stack>
              </Paper>
            ) : (
              <EquipmentTransferForm
                equipment={equipment}
                assignment={selectedAssignment}
                assignmentHistory={assignmentHistory}
                attachmentTypes={attachmentTypes}
                loadingAttachmentTypes={loadingAttachmentTypes}
                onSuccess={handleTransferSuccess}
                onCancel={clearTransferSelection}
              />
            ))}
        </Stack>
      </Stack>

      {/* New assignment modal */}
      <Modal
        opened={newAssignmentModalOpen}
        onClose={() => setNewAssignmentModalOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon size={32} radius="md" variant="light">
              <Package size={17} />
            </ThemeIcon>

            <div>
              <Text fw={700}>New Assignment</Text>
              <Text size="xs" c="dimmed">
                Assign available equipment to an employee.
              </Text>
            </div>
          </Group>
        }
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        closeOnClickOutside={false}
      >
        <EquipmentAssignmentForm
          attachmentTypes={attachmentTypes}
          loadingAttachmentTypes={loadingAttachmentTypes}
          equipment={equipment}
          onSuccess={handleNewAssignmentSuccess}
          onCancel={() => setNewAssignmentModalOpen(false)}
        />
      </Modal>
    </>
  );
}
