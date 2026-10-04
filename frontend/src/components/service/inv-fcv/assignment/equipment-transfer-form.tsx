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
    month: "long",
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
   * Build the complete assignment group.
   *
   * Hierarchy is based only on:
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
   * The active assignment is always the current/top-level
   * assignment in the thread.
   */
  const currentAssignment = useMemo(() => {
    return (
      groupedHistory.find((item) => item.status === "active") ?? assignment
    );
  }, [groupedHistory, assignment]);

  /*
   * Display order:
   *
   * Current
   *   ↓
   * Previous
   *   ↓
   * Previous
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
   * Load attachments for every assignment in the
   * current assignment thread.
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

    loadAssignmentAttachments();

    return () => {
      cancelled = true;
    };
  }, [threadHistory]);

  /*
   * TRANSFER
   */
  const openTransferModal = () => {
    setTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setTransferModalOpen(false);
  };

  /*
   * RETURN
   */
  const openReturnModal = () => {
    setStatusAction("return");
    setStatusModalOpen(true);
  };

  /*
   * DISPOSE
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
      <Stack gap="md">
        {/* HEADER */}
        <Group justify="flex-end" align="flex-end">
          {/* ACTIONS */}
          {currentAssignment.status === "active" && (
            <Group gap="xs">
              <Button
                variant="light"
                color="blue"
                leftSection={<ArrowLeftRight size={16} />}
                onClick={openTransferModal}
              >
                Transfer Equipment
              </Button>

              <Button
                variant="light"
                color="green"
                leftSection={<PackageCheck size={16} />}
                onClick={openReturnModal}
              >
                Return Equipment
              </Button>

              <Button
                variant="light"
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={openDisposeModal}
              >
                Dispose Equipment
              </Button>
            </Group>
          )}
        </Group>

        {/* ASSIGNMENT THREAD */}
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between">
            <div>
              <Text fw={700} size="lg">
                Assignment Thread
              </Text>

              <Text size="sm" c="dimmed">
                Current assignment and transfer history
              </Text>
            </div>

            <Badge variant="light">
              {threadHistory.length}{" "}
              {threadHistory.length === 1 ? "assignment" : "assignments"}
            </Badge>
          </Group>

          {/* EQUIPMENT HEADER */}
          <Paper
            withBorder
            radius="md"
            p="md"
            mb="md"
            bg="var(--mantine-color-gray-0)"
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <Package size={20} />
              </ThemeIcon>

              <Stack
                gap={2}
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Equipment Assignment
                </Text>

                <Text fw={700}>{equipment.description}</Text>

                <Group gap="lg" mt={6} wrap="wrap">
                  <Group gap={5}>
                    <Text size="xs" c="dimmed">
                      Property:
                    </Text>

                    <Text
                      size="xs"
                      fw={600}
                      style={{
                        wordBreak: "break-all",
                      }}
                    >
                      {currentAssignment.property_number}
                    </Text>
                  </Group>

                  <Group gap={5}>
                    <Text size="xs" c="dimmed">
                      Serial:
                    </Text>

                    <Text
                      size="xs"
                      fw={600}
                      style={{
                        wordBreak: "break-all",
                      }}
                    >
                      {currentAssignment.serial_number || "—"}
                    </Text>
                  </Group>

                  <Group gap={5}>
                    <Text size="xs" c="dimmed">
                      Quantity:
                    </Text>

                    <Text size="xs" fw={600}>
                      {currentAssignment.quantity}
                    </Text>
                  </Group>
                </Group>
              </Stack>
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
                    paddingLeft: 38,
                    paddingBottom: isLast ? 0 : 24,
                  }}
                >
                  {/* TIMELINE LINE */}
                  {!isLast && (
                    <div
                      style={{
                        position: "absolute",
                        left: 14,
                        top: 30,
                        bottom: 0,
                        width: 2,
                        backgroundColor: "var(--mantine-color-gray-3)",
                      }}
                    />
                  )}

                  {/* TIMELINE NODE */}
                  <ThemeIcon
                    size={30}
                    radius="xl"
                    variant={isCurrent ? "filled" : "light"}
                    color={isCurrent ? "green" : "gray"}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {isCurrent ? <CircleCheck size={16} /> : <User size={15} />}
                  </ThemeIcon>

                  {/* ASSIGNMENT CARD */}
                  <Paper
                    withBorder
                    radius="md"
                    p="sm"
                    style={{
                      borderColor: isCurrent
                        ? "var(--mantine-color-green-4)"
                        : "var(--mantine-color-gray-3)",
                    }}
                  >
                    {/* ASSIGNMENT HEADER */}
                    <Group
                      justify="space-between"
                      align="flex-start"
                      wrap="nowrap"
                    >
                      <Group
                        gap="sm"
                        align="flex-start"
                        wrap="nowrap"
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <ThemeIcon
                          size={30}
                          radius="md"
                          variant="light"
                          color={isCurrent ? "green" : "gray"}
                        >
                          <UserRoundCog size={15} />
                        </ThemeIcon>

                        <div
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Group gap="xs" align="center" wrap="wrap">
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
                              color={isCurrent ? "green" : "gray"}
                              variant="light"
                            >
                              {isCurrent ? "CURRENT" : "TRANSFERRED"}
                            </Badge>
                          </Group>

                          <Group gap="xs" mt={3} wrap="wrap">
                            <Text size="xs" c="dimmed">
                              Assigned {formatDate(historyItem.assigned_at)}
                            </Text>

                            {historyItem.returned_at && (
                              <>
                                <Text size="xs" c="dimmed">
                                  •
                                </Text>

                                <Text size="xs" c="dimmed">
                                  Ended {formatDate(historyItem.returned_at)}
                                </Text>
                              </>
                            )}
                          </Group>
                        </div>
                      </Group>

                      <Badge
                        size="xs"
                        color={
                          historyItem.status === "active"
                            ? "green"
                            : historyItem.status === "transferred"
                              ? "gray"
                              : historyItem.status === "returned"
                                ? "blue"
                                : "red"
                        }
                        variant="light"
                      >
                        {historyItem.status.charAt(0).toUpperCase() +
                          historyItem.status.slice(1)}
                      </Badge>
                    </Group>

                    <Divider my="sm" />

                    {/* ASSIGNMENT DETAILS */}
                    <SimpleGrid
                      cols={{
                        base: 1,
                        sm: 2,
                      }}
                      spacing="sm"
                    >
                      <div>
                        <Text size="xs" c="dimmed" fw={500}>
                          EMPLOYEE
                        </Text>

                        <Text
                          size="xs"
                          fw={600}
                          mt={2}
                          style={{
                            wordBreak: "break-all",
                          }}
                        >
                          {getEmployeeLabel(historyItem.user_employee_id)}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="dimmed" fw={500}>
                          DATE ASSIGNED
                        </Text>

                        <Text size="xs" fw={600} mt={2}>
                          {formatDate(historyItem.assigned_at)}
                        </Text>
                      </div>

                      {historyItem.is_care_of && (
                        <div>
                          <Text size="xs" c="dimmed" fw={500}>
                            CARE OF
                          </Text>

                          <Text
                            size="xs"
                            fw={600}
                            mt={2}
                            style={{
                              wordBreak: "break-all",
                            }}
                          >
                            {historyItem.care_of_employee_id ?? "—"}
                          </Text>
                        </div>
                      )}

                      {historyItem.returned_at && (
                        <div>
                          <Text size="xs" c="dimmed" fw={500}>
                            DATE ENDED
                          </Text>

                          <Text size="xs" fw={600} mt={2}>
                            {formatDate(historyItem.returned_at)}
                          </Text>
                        </div>
                      )}

                      {historyItem.remarks && (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                          }}
                        >
                          <Text size="xs" c="dimmed" fw={500}>
                            REMARKS
                          </Text>

                          <Text
                            size="xs"
                            mt={2}
                            style={{
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {historyItem.remarks}
                          </Text>
                        </div>
                      )}
                    </SimpleGrid>

                    {/* ATTACHMENTS */}
                    <Divider my="md" />

                    <Group justify="space-between" align="center" mb="sm">
                      <Group gap="xs">
                        <ThemeIcon
                          size={28}
                          radius="sm"
                          variant="light"
                          color="blue"
                        >
                          <Paperclip size={14} />
                        </ThemeIcon>

                        <div>
                          <Text size="sm" fw={600}>
                            Attachments
                          </Text>

                          <Text size="xs" c="dimmed">
                            Files associated with this assignment
                          </Text>
                        </div>
                      </Group>

                      {loadingAssignmentAttachments ? (
                        <Skeleton height={20} width={34} radius="xl" />
                      ) : (
                        <Badge
                          size="sm"
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

                    {/* ATTACHMENT LOADING */}
                    {loadingAssignmentAttachments &&
                    !assignmentAttachments[historyItem.id] ? (
                      <Stack gap="xs">
                        {[1, 2].map((item) => (
                          <Paper key={item} withBorder radius="md" p="sm">
                            <Group
                              justify="space-between"
                              align="center"
                              wrap="nowrap"
                            >
                              <Group
                                gap="sm"
                                wrap="nowrap"
                                style={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <Skeleton
                                  height={38}
                                  width={38}
                                  radius="sm"
                                  style={{
                                    flexShrink: 0,
                                  }}
                                />

                                <Stack
                                  gap={6}
                                  style={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <Skeleton height={11} width="55%" />

                                  <Skeleton height={9} width="75%" />
                                </Stack>
                              </Group>

                              <Skeleton height={26} width={52} radius="sm" />
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    ) : attachmentsForAssignment.length === 0 ? (
                      <Paper
                        withBorder
                        radius="md"
                        p="md"
                        bg="var(--mantine-color-gray-0)"
                      >
                        <Stack align="center" gap={6}>
                          <ThemeIcon
                            size={36}
                            radius="xl"
                            variant="light"
                            color="gray"
                          >
                            <Paperclip size={17} />
                          </ThemeIcon>

                          <Text size="xs" fw={500} c="dimmed">
                            No attachments
                          </Text>

                          <Text size="xs" c="dimmed" ta="center">
                            No files have been added to this assignment.
                          </Text>
                        </Stack>
                      </Paper>
                    ) : (
                      <Stack gap="xs">
                        {attachmentsForAssignment.map((attachment) => (
                          <Paper
                            key={attachment.id}
                            withBorder
                            radius="md"
                            p="sm"
                            style={{
                              transition:
                                "border-color 150ms ease, box-shadow 150ms ease",
                            }}
                          >
                            <Group
                              justify="space-between"
                              align="center"
                              wrap="nowrap"
                            >
                              {/* FILE INFORMATION */}
                              <Group
                                gap="sm"
                                wrap="nowrap"
                                style={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <ThemeIcon
                                  size={38}
                                  radius="sm"
                                  variant="light"
                                  color="blue"
                                  style={{
                                    flexShrink: 0,
                                  }}
                                >
                                  <FileText size={17} />
                                </ThemeIcon>

                                <Stack
                                  gap={3}
                                  style={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <Text size="sm" fw={600} truncate>
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

                                    <Text size="xs" c="dimmed" truncate>
                                      {attachment.file_name}
                                    </Text>

                                    <Text
                                      size="xs"
                                      c="dimmed"
                                      style={{
                                        flexShrink: 0,
                                      }}
                                    >
                                      •
                                    </Text>

                                    <Text
                                      size="xs"
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

                              {/* VIEW BUTTON */}
                              {attachment.file_url && (
                                <Button
                                  component="a"
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="light"
                                  color="blue"
                                  size="compact-sm"
                                  leftSection={<Download size={14} />}
                                  style={{
                                    flexShrink: 0,
                                  }}
                                >
                                  View
                                </Button>
                              )}
                            </Group>

                            {/* DESCRIPTION */}
                            {attachment.description && (
                              <>
                                <Divider my="xs" />

                                <Text
                                  size="xs"
                                  c="dimmed"
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {attachment.description}
                                </Text>
                              </>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Paper>

                  {/* TRANSFER RELATIONSHIP */}
                  {!isLast && (
                    <Group gap={5} mt={5} ml={4}>
                      <ArrowLeftRight
                        size={12}
                        style={{
                          color: "var(--mantine-color-gray-5)",
                        }}
                      />

                      <Text size="xs" c="dimmed">
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
