import { useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import {
  ArrowLeftRight,
  CircleCheck,
  Download,
  FileText,
  Package,
  PackageCheck,
  Paperclip,
  Trash2,
  User,
  UserRoundCog,
} from "lucide-react";

import { getEquipmentAssignmentAttachments } from "@/lib/api/inv-fcv/equipment-attachment";
import { employeeApi } from "@/lib/api/hr-fcv/employee";

import EquipmentTransferModal from "@/components/service/inv-fcv/assignment/equipment-transfer-modal";
import EquipmentAssignmentStatusModal from "@/components/service/inv-fcv/assignment/equipment-assignment-status-modal";

import type {
  EquipmentAssignment,
  EquipmentAssignmentAttachment,
} from "@/types/inv-fcv/equipment-assignment";

import type { Equipment } from "@/types/inv-fcv/equipment";
import type { AttachmentType } from "@/types/inv-fcv/attachment-type";
import type { Employee } from "@/types/hr-fcv/employee";

interface EquipmentTransferFormProps {
  equipment: Equipment;
  assignment: EquipmentAssignment;
  assignmentHistory: EquipmentAssignment[];
  attachmentTypes: AttachmentType[];
  loadingAttachmentTypes?: boolean;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatFileSize = (bytes: number | null | undefined) => {
  if (bytes == null || bytes <= 0) return "Unknown size";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getStatusColor = (status: EquipmentAssignment["status"]) => {
  switch (status) {
    case "active":
      return "green";
    case "transferred":
      return "gray";
    case "returned":
      return "blue";
    case "disposed":
      return "red";
    default:
      return "gray";
  }
};

const getStatusLabel = (status: EquipmentAssignment["status"]) => {
  switch (status) {
    case "active":
      return "Active";
    case "transferred":
      return "Transferred";
    case "returned":
      return "Returned";
    case "disposed":
      return "Disposed";
    default:
      return status;
  }
};

export default function EquipmentTransferForm({
  equipment,
  assignment,
  assignmentHistory,
  attachmentTypes,
  loadingAttachmentTypes = false,
  onSuccess,
  // onCancel,
}: EquipmentTransferFormProps) {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [statusAction, setStatusAction] = useState<"return" | "dispose">(
    "return",
  );

  const [assignmentAttachments, setAssignmentAttachments] = useState<
    Record<string, EquipmentAssignmentAttachment[]>
  >({});

  const [loadingAssignmentAttachments, setLoadingAssignmentAttachments] =
    useState(false);

  // =====================================================
  // LOAD HR EMPLOYEES
  // =====================================================

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const employeeById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);

        const firstResponse = await employeeApi.index({
          page: 1,
          per_page: 100,
        });

        const firstPage = firstResponse.data;
        const allEmployees: Employee[] = [...(firstPage.data ?? [])];
        const lastPage = Number(firstPage.last_page ?? 1);

        if (lastPage > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: lastPage - 1 }, (_, index) =>
              employeeApi.index({
                page: index + 2,
                per_page: 100,
              }),
            ),
          );

          for (const response of remainingPages) {
            allEmployees.push(...(response.data.data ?? []));
          }
        }

        if (!cancelled) {
          setEmployees(allEmployees);
        }
      } catch (error) {
        console.error("Failed to load HR employees:", error);

        if (!cancelled) {
          setEmployees([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // BUILD ASSIGNMENT GROUP
  // =====================================================

  const groupedHistory = useMemo(() => {
    const groupId = assignment.assignment_group_id;

    const records = assignmentHistory.filter(
      (item) => item.assignment_group_id === groupId,
    );

    if (!records.some((item) => item.id === assignment.id)) {
      records.push(assignment);
    }

    return [...records].sort((a, b) => {
      const assignedDate =
        new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime();

      if (assignedDate !== 0) return assignedDate;

      const createdDate =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

      if (createdDate !== 0) return createdDate;

      return a.id.localeCompare(b.id);
    });
  }, [assignmentHistory, assignment]);

  // =====================================================
  // CURRENT ASSIGNMENT
  // =====================================================

  const currentAssignment = useMemo(
    () => groupedHistory.find((item) => item.status === "active") ?? assignment,
    [groupedHistory, assignment],
  );

  // =====================================================
  // THREAD ORDER
  // =====================================================

  const threadHistory = useMemo(() => {
    const activeIndex = groupedHistory.findIndex(
      (item) => item.id === currentAssignment.id,
    );

    if (activeIndex === -1) return [currentAssignment];

    const previousAssignments = groupedHistory.slice(0, activeIndex).reverse();

    return [currentAssignment, ...previousAssignments];
  }, [groupedHistory, currentAssignment]);

  // =====================================================
  // EMPLOYEE DETAILS RENDERER
  // =====================================================

  const renderEmployeeDetails = (employeeId: string | null | undefined) => {
    if (!employeeId) {
      return (
        <Group gap="xs" wrap="nowrap">
          <Avatar size="sm" color="gray" radius="xl">
            <User size={14} />
          </Avatar>

          <Text size="sm" c="dimmed">
            No employee assigned
          </Text>
        </Group>
      );
    }

    const employee = employeeById.get(employeeId);

    if (!employee) {
      return (
        <Group gap="xs" wrap="nowrap">
          <Avatar size="sm" color="gray" radius="xl">
            <UserRoundCog size={14} />
          </Avatar>

          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size="sm" fw={500}>
              {loadingEmployees
                ? "Loading employee..."
                : "Employee information unavailable"}
            </Text>

            {!loadingEmployees && (
              <Text size="xs" c="dimmed" style={{ overflowWrap: "anywhere" }}>
                Employee ID: {employeeId}
              </Text>
            )}
          </Stack>
        </Group>
      );
    }

    const fullName = [
      employee.first_name,
      employee.middle_name,
      employee.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const sectionName = employee.section?.name ?? "No section";
    const divisionName = employee.section?.division?.name ?? "No division";

    return (
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Avatar color="blue" radius="xl" size="md">
          {`${employee.first_name?.[0] ?? ""}${employee.last_name?.[0] ?? ""}`}
        </Avatar>

        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text size="sm" fw={600} style={{ overflowWrap: "anywhere" }}>
            {fullName}
          </Text>

          <Text size="xs" c="dimmed" style={{ overflowWrap: "anywhere" }}>
            {employee.email}
          </Text>

          <Group gap={6} wrap="wrap">
            <Badge size="sm" variant="light" color="blue">
              Section: {sectionName}
            </Badge>

            <Badge size="sm" variant="light" color="grape">
              Division: {divisionName}
            </Badge>
          </Group>
        </Stack>
      </Group>
    );
  };

  // =====================================================
  // LOAD ATTACHMENTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadAssignmentAttachments = async () => {
      if (!threadHistory.length) {
        setAssignmentAttachments({});
        return;
      }

      try {
        setLoadingAssignmentAttachments(true);

        const results = await Promise.all(
          threadHistory.map(async (item) => {
            try {
              const response = await getEquipmentAssignmentAttachments(item.id);

              return {
                id: item.id,
                attachments: response?.data ?? [],
              };
            } catch (error) {
              console.error(
                `Failed to load attachments for assignment ${item.id}:`,
                error,
              );

              return {
                id: item.id,
                attachments: [],
              };
            }
          }),
        );

        if (cancelled) return;

        const grouped: Record<string, EquipmentAssignmentAttachment[]> = {};

        for (const result of results) {
          grouped[result.id] = result.attachments;
        }

        setAssignmentAttachments(grouped);
      } finally {
        if (!cancelled) {
          setLoadingAssignmentAttachments(false);
        }
      }
    };

    void loadAssignmentAttachments();

    return () => {
      cancelled = true;
    };
  }, [threadHistory]);

  // =====================================================
  // TRANSFER / RETURN / DISPOSE ACTIONS
  // =====================================================

  const openTransferModal = () => setTransferModalOpen(true);
  const closeTransferModal = () => setTransferModalOpen(false);

  const openReturnModal = () => {
    setStatusAction("return");
    setStatusModalOpen(true);
  };

  const openDisposeModal = () => {
    setStatusAction("dispose");
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => setStatusModalOpen(false);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <Stack gap="sm">
        {/* ACTIONS */}

        {currentAssignment.status === "active" && (
          <Group justify="flex-end" gap="xs">
            <Button
              size="sm"
              variant="light"
              color="blue"
              leftSection={<ArrowLeftRight size={15} />}
              onClick={openTransferModal}
            >
              Transfer Equipment
            </Button>

            <Button
              size="sm"
              variant="light"
              color="green"
              leftSection={<PackageCheck size={15} />}
              onClick={openReturnModal}
            >
              Return Equipment
            </Button>

            <Button
              size="sm"
              variant="light"
              color="red"
              leftSection={<Trash2 size={15} />}
              onClick={openDisposeModal}
            >
              Dispose Equipment
            </Button>
          </Group>
        )}

        {/* ASSIGNMENT THREAD */}

        <Paper withBorder radius="md" p="sm">
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <ThemeIcon size={28} radius="sm" variant="light" color="blue">
                <ArrowLeftRight size={15} />
              </ThemeIcon>

              <div>
                <Text fw={700} size="sm">
                  Assignment Thread
                </Text>

                <Text size="xs" c="dimmed">
                  Current assignment and transfer history
                </Text>
              </div>
            </Group>

            <Badge size="sm" variant="light" color="gray">
              {threadHistory.length}{" "}
              {threadHistory.length === 1 ? "assignment" : "assignments"}
            </Badge>
          </Group>

          {/* EQUIPMENT HEADER */}

          <Paper
            withBorder
            radius="sm"
            p="xs"
            mb="sm"
            bg="var(--mantine-color-gray-0)"
          >
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={30} radius="sm" variant="light" color="blue">
                <Package size={15} />
              </ThemeIcon>

              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={700} truncate>
                  {equipment.description}
                </Text>

                <Group gap="md" wrap="wrap">
                  <Text size="xs" c="dimmed">
                    Property:{" "}
                    <Text span fw={600} c="dark">
                      {currentAssignment.property_number}
                    </Text>
                  </Text>

                  <Text size="xs" c="dimmed">
                    Serial:{" "}
                    <Text span fw={600} c="dark">
                      {currentAssignment.serial_number || "—"}
                    </Text>
                  </Text>

                  <Text size="xs" c="dimmed">
                    Qty:{" "}
                    <Text span fw={600} c="dark">
                      {currentAssignment.quantity}
                    </Text>
                  </Text>
                </Group>
              </Stack>

              <Badge
                size="xs"
                variant="light"
                color={getStatusColor(currentAssignment.status)}
              >
                {getStatusLabel(currentAssignment.status)}
              </Badge>
            </Group>
          </Paper>

          {/* TIMELINE */}

          <Stack gap={0}>
            {threadHistory.map((historyItem, index) => {
              const isCurrent = historyItem.id === currentAssignment.id;
              const isLast = index === threadHistory.length - 1;

              const attachmentsForAssignment =
                assignmentAttachments[historyItem.id] ?? [];

              return (
                <div
                  key={historyItem.id}
                  style={{
                    position: "relative",
                    paddingLeft: 30,
                    paddingBottom: isLast ? 0 : 12,
                  }}
                >
                  {!isLast && (
                    <div
                      style={{
                        position: "absolute",
                        left: 10,
                        top: 22,
                        bottom: 0,
                        width: 2,
                        backgroundColor: "var(--mantine-color-gray-3)",
                      }}
                    />
                  )}

                  <ThemeIcon
                    size={22}
                    radius="xl"
                    variant={isCurrent ? "filled" : "light"}
                    color={isCurrent ? "green" : "gray"}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      zIndex: 1,
                    }}
                  >
                    {isCurrent ? <CircleCheck size={12} /> : <User size={12} />}
                  </ThemeIcon>

                  <Paper
                    withBorder
                    radius="sm"
                    p="xs"
                    style={{
                      borderColor: isCurrent
                        ? "var(--mantine-color-green-4)"
                        : "var(--mantine-color-gray-3)",
                    }}
                  >
                    <Stack gap={7}>
                      {/* EMPLOYEE AND STATUS */}

                      <Group
                        justify="space-between"
                        align="flex-start"
                        wrap="wrap"
                      >
                        <Group
                          gap="xs"
                          align="flex-start"
                          wrap="nowrap"
                          style={{ minWidth: 0, flex: 1 }}
                        >
                          <ThemeIcon
                            size={25}
                            radius="sm"
                            variant="light"
                            color={isCurrent ? "green" : "gray"}
                          >
                            <UserRoundCog size={13} />
                          </ThemeIcon>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            {renderEmployeeDetails(
                              historyItem.user_employee_id,
                            )}
                          </div>
                        </Group>

                        <Stack gap={4} align="flex-end">
                          <Badge
                            size="xs"
                            variant="light"
                            color={getStatusColor(historyItem.status)}
                          >
                            {getStatusLabel(historyItem.status)}
                          </Badge>

                          <Text size="xs" c="dimmed">
                            {formatDate(historyItem.assigned_at)}
                          </Text>
                        </Stack>
                      </Group>

                      {/* ASSIGNMENT DETAILS */}

                      <Group gap="lg" wrap="wrap">
                        <Text size="xs" c="dimmed">
                          Property:{" "}
                          <Text span fw={600} c="dark">
                            {historyItem.property_number}
                          </Text>
                        </Text>

                        <Text size="xs" c="dimmed">
                          Serial:{" "}
                          <Text span fw={600} c="dark">
                            {historyItem.serial_number ?? "—"}
                          </Text>
                        </Text>

                        <Text size="xs" c="dimmed">
                          Qty:{" "}
                          <Text span fw={600} c="dark">
                            {historyItem.quantity}
                          </Text>
                        </Text>

                        {historyItem.returned_at && (
                          <Text size="xs" c="dimmed">
                            Ended:{" "}
                            <Text span fw={600} c="dark">
                              {formatDate(historyItem.returned_at)}
                            </Text>
                          </Text>
                        )}
                      </Group>

                      {/* CARE OF EMPLOYEE */}

                      {historyItem.is_care_of &&
                        historyItem.care_of_employee_id && (
                          <Paper
                            withBorder
                            radius="sm"
                            p="xs"
                            bg="var(--mantine-color-gray-0)"
                          >
                            <Stack gap="xs">
                              <Group gap={5}>
                                <UserRoundCog size={13} />

                                <Text size="xs" fw={600}>
                                  Care of employee
                                </Text>
                              </Group>

                              {renderEmployeeDetails(
                                historyItem.care_of_employee_id,
                              )}
                            </Stack>
                          </Paper>
                        )}

                      {/* REMARKS */}

                      {historyItem.remarks && (
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.45,
                          }}
                        >
                          {historyItem.remarks}
                        </Text>
                      )}

                      {/* ATTACHMENTS */}

                      <Divider my={2} />

                      <Group justify="space-between" align="center">
                        <Group gap={5}>
                          <Paperclip size={13} />

                          <Text size="xs" fw={600}>
                            Attachments
                          </Text>

                          {loadingAssignmentAttachments ? (
                            <Skeleton height={16} width={25} radius="xl" />
                          ) : (
                            <Badge
                              size="xs"
                              variant="light"
                              color={
                                attachmentsForAssignment.length > 0
                                  ? "blue"
                                  : "gray"
                              }
                            >
                              {attachmentsForAssignment.length}
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      {loadingAssignmentAttachments &&
                      !assignmentAttachments[historyItem.id] ? (
                        <Stack gap={5}>
                          <Skeleton height={34} radius="sm" />
                          <Skeleton height={34} radius="sm" />
                        </Stack>
                      ) : attachmentsForAssignment.length === 0 ? (
                        <Text size="xs" c="dimmed">
                          No attachments for this assignment.
                        </Text>
                      ) : (
                        <Stack gap={5}>
                          {attachmentsForAssignment.map((attachment) => (
                            <Paper
                              key={attachment.id}
                              withBorder
                              radius="sm"
                              p={6}
                            >
                              <Group
                                justify="space-between"
                                align="center"
                                wrap="nowrap"
                              >
                                <Group
                                  gap="xs"
                                  wrap="nowrap"
                                  style={{ minWidth: 0, flex: 1 }}
                                >
                                  <ThemeIcon
                                    size={28}
                                    radius="sm"
                                    variant="light"
                                    color="blue"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <FileText size={14} />
                                  </ThemeIcon>

                                  <Stack
                                    gap={1}
                                    style={{ minWidth: 0, flex: 1 }}
                                  >
                                    <Text size="xs" fw={600} truncate>
                                      {attachment.name}
                                    </Text>

                                    <Group gap={5} wrap="wrap">
                                      <Badge
                                        size="xs"
                                        variant="light"
                                        color="gray"
                                      >
                                        {attachment.attachment_type?.name ??
                                          "Attachment"}
                                      </Badge>

                                      <Text size="10px" c="dimmed">
                                        {attachment.file_name}
                                      </Text>

                                      <Text size="10px" c="dimmed">
                                        {formatFileSize(attachment.file_size)}
                                      </Text>
                                    </Group>
                                  </Stack>
                                </Group>

                                {attachment.file_url && (
                                  <Button
                                    component="a"
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="subtle"
                                    color="blue"
                                    size="compact-xs"
                                    leftSection={<Download size={12} />}
                                    style={{ flexShrink: 0 }}
                                  >
                                    View
                                  </Button>
                                )}
                              </Group>

                              {attachment.description && (
                                <Text
                                  size="10px"
                                  c="dimmed"
                                  mt={5}
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  {attachment.description}
                                </Text>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>

                  {!isLast && (
                    <Group gap={4} mt={3} ml={3}>
                      <ArrowLeftRight
                        size={11}
                        style={{
                          color: "var(--mantine-color-gray-5)",
                        }}
                      />

                      <Text size="10px" c="dimmed">
                        Previous assignment
                      </Text>
                    </Group>
                  )}
                </div>
              );
            })}
          </Stack>
        </Paper>
      </Stack>

      {/* TRANSFER MODAL */}

      <EquipmentTransferModal
        opened={transferModalOpen}
        equipment={equipment}
        assignment={currentAssignment}
        attachmentTypes={attachmentTypes}
        loadingAttachmentTypes={loadingAttachmentTypes}
        onSuccess={async () => {
          setTransferModalOpen(false);
          await onSuccess();
        }}
        onClose={closeTransferModal}
      />

      {/* RETURN / DISPOSE MODAL */}

      <EquipmentAssignmentStatusModal
        opened={statusModalOpen}
        action={statusAction}
        equipment={equipment}
        assignment={currentAssignment}
        attachmentTypes={attachmentTypes}
        loadingAttachmentTypes={loadingAttachmentTypes}
        onSuccess={async () => {
          setStatusModalOpen(false);
          await onSuccess();
        }}
        onClose={closeStatusModal}
      />
    </>
  );
}
