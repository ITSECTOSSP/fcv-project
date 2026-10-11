import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
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

import EquipmentTransferModal from "@/components/service/inv-fcv/assignment/equipment-transfer-modal";

import EquipmentAssignmentStatusModal from "@/components/service/inv-fcv/assignment/equipment-assignment-status-modal";

import type {
  EquipmentAssignment,
  EquipmentAssignmentAttachment,
} from "@/types/inv-fcv/equipment-assignment";

import type { Equipment } from "@/types/inv-fcv/equipment";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

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
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getEmployeeLabel = (employeeId: string | null | undefined) => {
  if (!employeeId) {
    return "No employee";
  }

  return employeeId;
};

const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

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
  onCancel,
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

  /*
   * =====================================================
   * BUILD ASSIGNMENT GROUP
   * =====================================================
   *
   * Hierarchy is based only on:
   *
   * 1. assignment_group_id
   * 2. assigned_at
   * 3. created_at
   * 4. id
   *
   * Status is NOT used to establish the hierarchy.
   */

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

      if (assignedDate !== 0) {
        return assignedDate;
      }

      const createdDate =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

      if (createdDate !== 0) {
        return createdDate;
      }

      return a.id.localeCompare(b.id);
    });
  }, [assignmentHistory, assignment]);

  /*
   * =====================================================
   * CURRENT ASSIGNMENT
   * =====================================================
   *
   * The active assignment is always the current/root
   * assignment in the thread.
   */

  const currentAssignment = useMemo(() => {
    return (
      groupedHistory.find((item) => item.status === "active") ?? assignment
    );
  }, [groupedHistory, assignment]);

  /*
   * =====================================================
   * THREAD ORDER
   * =====================================================
   *
   * Current assignment
   *      ↓
   * Previous assignment
   *      ↓
   * Previous assignment
   */

  const threadHistory = useMemo(() => {
    const activeIndex = groupedHistory.findIndex(
      (item) => item.id === currentAssignment.id,
    );

    if (activeIndex === -1) {
      return [currentAssignment];
    }

    const previousAssignments = groupedHistory.slice(0, activeIndex).reverse();

    return [currentAssignment, ...previousAssignments];
  }, [groupedHistory, currentAssignment]);

  /*
   * =====================================================
   * LOAD ATTACHMENTS
   * =====================================================
   */

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

        if (cancelled) {
          return;
        }

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

  /*
   * =====================================================
   * TRANSFER
   * =====================================================
   */

  const openTransferModal = () => {
    setTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setTransferModalOpen(false);
  };

  /*
   * =====================================================
   * RETURN
   * =====================================================
   */

  const openReturnModal = () => {
    setStatusAction("return");
    setStatusModalOpen(true);
  };

  /*
   * =====================================================
   * DISPOSE
   * =====================================================
   */

  const openDisposeModal = () => {
    setStatusAction("dispose");
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
  };

  return (
    <>
      <Stack gap="sm">
        {/* =====================================================
         * ACTIONS
         * ===================================================== */}

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

        {/* =====================================================
         * ASSIGNMENT THREAD CONTAINER
         * ===================================================== */}

        <Paper withBorder radius="md" p="sm">
          {/* THREAD HEADER */}

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

          {/* =====================================================
           * COMPACT EQUIPMENT HEADER
           * ===================================================== */}

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

              <Stack
                gap={2}
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
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

          {/* =====================================================
           * TIMELINE
           * ===================================================== */}

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
                  {/* TIMELINE LINE */}

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

                  {/* TIMELINE NODE */}

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

                  {/* ASSIGNMENT CARD */}

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
                      {/* ASSIGNMENT HEADER */}

                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        <Group
                          gap="xs"
                          wrap="nowrap"
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <ThemeIcon
                            size={25}
                            radius="sm"
                            variant="light"
                            color={isCurrent ? "green" : "gray"}
                          >
                            <UserRoundCog size={13} />
                          </ThemeIcon>

                          <div
                            style={{
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <Group gap={6} wrap="wrap">
                              <Text
                                size="sm"
                                fw={700}
                                style={{
                                  wordBreak: "break-all",
                                }}
                              >
                                {getEmployeeLabel(historyItem.user_employee_id)}
                              </Text>

                              <Badge
                                size="xs"
                                variant="light"
                                color={getStatusColor(historyItem.status)}
                              >
                                {getStatusLabel(historyItem.status)}
                              </Badge>
                            </Group>
                          </div>
                        </Group>

                        <Text
                          size="xs"
                          c="dimmed"
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          {formatDate(historyItem.assigned_at)}
                        </Text>
                      </Group>

                      {/* COMPACT DETAILS */}

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

                      {/* CARE OF */}

                      {historyItem.is_care_of &&
                        historyItem.care_of_employee_id && (
                          <Group gap={5}>
                            <UserRoundCog size={12} />

                            <Text size="xs" c="dimmed">
                              Care of:{" "}
                              <Text span fw={600} c="dark">
                                {historyItem.care_of_employee_id}
                              </Text>
                            </Text>
                          </Group>
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

                      {/* ATTACHMENT LOADING */}

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
                                  style={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <ThemeIcon
                                    size={28}
                                    radius="sm"
                                    variant="light"
                                    color="blue"
                                    style={{
                                      flexShrink: 0,
                                    }}
                                  >
                                    <FileText size={14} />
                                  </ThemeIcon>

                                  <Stack
                                    gap={1}
                                    style={{
                                      minWidth: 0,
                                      flex: 1,
                                    }}
                                  >
                                    <Text size="xs" fw={600} truncate>
                                      {attachment.name}
                                    </Text>

                                    <Group gap={5} wrap="nowrap">
                                      <Badge
                                        size="xs"
                                        variant="light"
                                        color="gray"
                                      >
                                        {attachment.attachment_type?.name ??
                                          "Attachment"}
                                      </Badge>

                                      <Text size="10px" c="dimmed" truncate>
                                        {attachment.file_name}
                                      </Text>

                                      <Text
                                        size="10px"
                                        c="dimmed"
                                        style={{
                                          flexShrink: 0,
                                        }}
                                      >
                                        •
                                      </Text>

                                      <Text
                                        size="10px"
                                        c="dimmed"
                                        style={{
                                          flexShrink: 0,
                                        }}
                                      >
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
                                    style={{
                                      flexShrink: 0,
                                    }}
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
                                  style={{
                                    whiteSpace: "pre-wrap",
                                  }}
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

                  {/* THREAD RELATIONSHIP */}

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

      {/* =====================================================
       * TRANSFER MODAL
       * ===================================================== */}

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

      {/* =====================================================
       * RETURN / DISPOSE MODAL
       * ===================================================== */}

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
