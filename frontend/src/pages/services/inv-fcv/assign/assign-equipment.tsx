import { useEffect, useMemo, useState } from "react";

import {
  Alert,
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

import type { Equipment } from "@/types/inv-fcv/equipment";

import type { EquipmentAssignment } from "@/types/inv-fcv/equipment-assignment";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

import { getAttachmentTypes } from "@/lib/api/inv-fcv/attachment-types";

import EquipmentAssignmentForm from "@/components/service/inv-fcv/assignment/equipment-assignment-form";

import EquipmentTransferForm from "@/components/service/inv-fcv/assignment/equipment-transfer-form";

export default function AssignEquipment() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [equipment, setEquipment] =
    useState<Equipment | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * New assignment modal.
   */
  const [newAssignmentModalOpen, setNewAssignmentModalOpen] =
    useState(false);

  /*
   * Displayed assignments.
   *
   * Includes:
   * - active
   * - returned
   * - disposed
   *
   * Transferred assignments are excluded
   * from this list.
   */
  const [assignments, setAssignments] =
    useState<EquipmentAssignment[]>([]);

  /*
   * Total quantity currently disposed.
   */
  const [disposedQuantity, setDisposedQuantity] =
    useState(0);

  const [assignmentsLoading, setAssignmentsLoading] =
    useState(false);

  const [assignmentsError, setAssignmentsError] =
    useState<string | null>(null);

  /*
   * Selected assignment can be:
   * - active
   * - returned
   * - disposed
   *
   * It is selected only to view its thread.
   */
  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState<string | null>(null);

  /*
   * Complete assignment group history.
   *
   * This can contain transferred records because
   * the thread needs the complete transfer chain.
   */
  const [assignmentHistory, setAssignmentHistory] =
    useState<EquipmentAssignment[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  /*
   * Load equipment.
   */
  useEffect(() => {
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

        setEquipment(response.data);
      } catch (error) {
        console.error(
          "Failed to load equipment:",
          error,
        );

        setError(
          "Unable to load the equipment.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [id]);

  /*
   * Load assignments.
   *
   * Displayed statuses:
   * - Active
   * - Returned
   * - Disposed
   *
   * Transferred assignments are intentionally
   * excluded from this displayed list.
   */
  const loadAssignments = async (): Promise<
    EquipmentAssignment[]
  > => {
    if (!id) {
      return [];
    }

    try {
      setAssignmentsLoading(true);
      setAssignmentsError(null);

      const response =
        await getEquipmentAssignments({
          equipment_id: id,
          per_page: 100,
        });

      const displayedAssignments =
        response.data.filter(
          (assignment) =>
            assignment.status === "active" ||
            assignment.status === "returned" ||
            assignment.status === "disposed",
        );

      const disposedTotal =
        displayedAssignments
          .filter(
            (assignment) =>
              assignment.status ===
              "disposed",
          )
          .reduce(
            (sum, assignment) =>
              sum +
              Number(
                assignment.quantity ?? 0,
              ),
            0,
          );

      setAssignments(displayedAssignments);

      setDisposedQuantity(disposedTotal);

      return displayedAssignments;
    } catch (error) {
      console.error(
        "Failed to load equipment assignments:",
        error,
      );

      setAssignmentsError(
        "Unable to load the equipment assignments.",
      );

      setAssignments([]);

      setDisposedQuantity(0);

      return [];
    } finally {
      setAssignmentsLoading(false);
    }
  };

  /*
   * Load assignments when equipment is available.
   */
  useEffect(() => {
    if (equipment) {
      loadAssignments();
    }
  }, [equipment]);

  /*
   * Calculate inventory quantities.
   *
   * Available:
   *
   * Total
   * - Currently Assigned
   * - Disposed
   */
  const quantitySummary = useMemo(() => {
    const total =
      Number(equipment?.quantity ?? 0);

    const assigned =
      assignments
        .filter(
          (assignment) =>
            assignment.status === "active",
        )
        .reduce(
          (sum, assignment) =>
            sum +
            Number(
              assignment.quantity ?? 0,
            ),
          0,
        );

    const disposed = disposedQuantity;

    const available = Math.max(
      total - assigned - disposed,
      0,
    );

    let status = "Available";

    let statusColor = "green";

    if (
      available <= 0 &&
      total > 0
    ) {
      status = "Fully Allocated";
      statusColor = "red";
    } else if (
      assigned > 0 ||
      disposed > 0
    ) {
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
  }, [
    equipment,
    assignments,
    disposedQuantity,
  ]);

  /*
   * Active assignments only.
   *
   * Used for:
   * - Active quantity calculation
   * - Finding the new active assignment after transfer
   */
  const activeAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        assignment.status === "active",
    );
  }, [assignments]);

  /*
   * Group displayed assignments by
   * assignment_group_id.
   *
   * Transferred records are already excluded.
   *
   * Within each group:
   * 1. Active
   * 2. Returned / Disposed
   *
   * Then newest date first for the
   * remaining records.
   */
  const groupedAssignments = useMemo(() => {
    const groups = new Map<
      string,
      EquipmentAssignment[]
    >();

    assignments.forEach((assignment) => {
      const groupId =
        assignment.assignment_group_id;

      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }

      groups
        .get(groupId)!
        .push(assignment);
    });

    return Array.from(
      groups.entries(),
    )
      .map(
        ([
          groupId,
          groupAssignments,
        ]) => {
          const sorted =
            [...groupAssignments].sort(
              (a, b) => {
                /*
                 * Active always comes first.
                 */
                if (
                  a.status === "active" &&
                  b.status !== "active"
                ) {
                  return -1;
                }

                if (
                  a.status !== "active" &&
                  b.status === "active"
                ) {
                  return 1;
                }

                /*
                 * Returned / disposed:
                 * newest assignment first.
                 */
                const dateA =
                  new Date(
                    a.assigned_at,
                  ).getTime();

                const dateB =
                  new Date(
                    b.assigned_at,
                  ).getTime();

                if (
                  dateA !== dateB
                ) {
                  return (
                    dateB - dateA
                  );
                }

                const createdA =
                  new Date(
                    a.created_at,
                  ).getTime();

                const createdB =
                  new Date(
                    b.created_at,
                  ).getTime();

                return (
                  createdB - createdA
                );
              },
            );

          return {
            groupId,
            assignments: sorted,
          };
        },
      )
      .sort((a, b) => {
        /*
         * Groups containing an active
         * assignment come first.
         */
        const aHasActive =
          a.assignments.some(
            (assignment) =>
              assignment.status ===
              "active",
          );

        const bHasActive =
          b.assignments.some(
            (assignment) =>
              assignment.status ===
              "active",
          );

        if (
          aHasActive &&
          !bHasActive
        ) {
          return -1;
        }

        if (
          !aHasActive &&
          bHasActive
        ) {
          return 1;
        }

        /*
         * Newest group first.
         */
        const aDate =
          new Date(
            a.assignments[0]
              ?.assigned_at ?? 0,
          ).getTime();

        const bDate =
          new Date(
            b.assignments[0]
              ?.assigned_at ?? 0,
          ).getTime();

        return bDate - aDate;
      });
  }, [assignments]);

  /*
   * Load complete assignment history
   * by assignment group.
   *
   * IMPORTANT:
   * This does NOT filter transferred records.
   *
   * The displayed assignment list hides
   * transferred records, but the thread itself
   * needs the complete transfer chain.
   */
  const loadAssignmentHistory = async (
    assignment: EquipmentAssignment,
  ): Promise<EquipmentAssignment[]> => {
    try {
      setHistoryLoading(true);

      setAssignmentsError(null);

      const response =
        await getEquipmentAssignments({
          assignment_group_id:
            assignment.assignment_group_id,
          per_page: 100,
        });

      setAssignmentHistory(
        response.data,
      );

      return response.data;
    } catch (error) {
      console.error(
        "Failed to load assignment history:",
        error,
      );

      setAssignmentHistory([]);

      setAssignmentsError(
        "Unable to load the assignment history.",
      );

      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  /*
   * New assignment success.
   */
  const handleNewAssignmentSuccess =
    async () => {
      setNewAssignmentModalOpen(false);

      await loadAssignments();
    };

  /*
   * Transfer success.
   */
  const handleTransferSuccess =
    async () => {
      if (!selectedAssignmentId) {
        return;
      }

      const previousAssignment =
        activeAssignments.find(
          (item) =>
            item.id ===
            selectedAssignmentId,
        );

      const previousGroupId =
        previousAssignment?.assignment_group_id;

      if (!previousGroupId) {
        return;
      }

      try {
        const refreshedAssignments =
          await loadAssignments();

        /*
         * Find the newly-created active
         * assignment in the same group.
         */
        const newActiveAssignment =
          refreshedAssignments.find(
            (item) =>
              item.assignment_group_id ===
                previousGroupId &&
              item.status === "active",
          );

        if (!newActiveAssignment) {
          setSelectedAssignmentId(
            null,
          );

          setAssignmentHistory([]);

          return;
        }

        /*
         * Select the new active assignment.
         */
        setSelectedAssignmentId(
          newActiveAssignment.id,
        );

        /*
         * Reload complete transfer thread.
         */
        await loadAssignmentHistory(
          newActiveAssignment,
        );
      } catch (error) {
        console.error(
          "Failed to refresh assignment after transfer:",
          error,
        );
      }
    };

  /*
   * Currently selected assignment.
   *
   * Can be Active, Returned, or Disposed.
   */
  const selectedAssignment =
    assignments.find(
      (assignment) =>
        assignment.id ===
        selectedAssignmentId,
    ) ?? null;

  /*
   * Select an assignment to view its
   * complete assignment thread.
   *
   * Active, Returned, and Disposed
   * are all selectable.
   */
  const handleSelectAssignment =
    async (
      assignment: EquipmentAssignment,
    ) => {
      if (
        assignment.id ===
        selectedAssignmentId
      ) {
        return;
      }

      setSelectedAssignmentId(
        assignment.id,
      );

      setAssignmentHistory([]);

      await loadAssignmentHistory(
        assignment,
      );
    };

  /*
   * Reset selection.
   */
  const clearTransferSelection =
    () => {
      setSelectedAssignmentId(null);

      setAssignmentHistory([]);

      setAssignmentsError(null);
    };

  /*
   * Date formatting.
   *
   * Assignment dates are displayed
   * using Philippine time.
   */
  const formatDate = (
    value:
      | string
      | null
      | undefined,
  ) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        timeZone:
          "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  /*
   * Load Attachment Types.
   */
  const [
    attachmentTypes,
    setAttachmentTypes,
  ] = useState<AttachmentType[]>(
    [],
  );

  const [
    loadingAttachmentTypes,
    setLoadingAttachmentTypes,
  ] = useState(false);

  useEffect(() => {
    const loadAttachmentTypes =
      async () => {
        try {
          setLoadingAttachmentTypes(
            true,
          );

          const response =
            await getAttachmentTypes();

          setAttachmentTypes(
            response.data,
          );
        } catch (error) {
          console.error(
            "Failed to load attachment types:",
            error,
          );

          setAttachmentTypes([]);
        } finally {
          setLoadingAttachmentTypes(
            false,
          );
        }
      };

    loadAttachmentTypes();
  }, []);

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <Stack gap="lg">
        <Skeleton
          height={36}
          width={280}
        />

        <Paper
          withBorder
          p="md"
          radius="md"
        >
          <Stack gap="md">
            <Group>
              <Skeleton
                height={44}
                width={44}
                radius="md"
              />

              <Stack gap={6}>
                <Skeleton
                  height={20}
                  width={240}
                />

                <Skeleton
                  height={14}
                  width={160}
                />
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

  /*
   * Error state.
   */
  if (error || !equipment) {
    return (
      <Stack gap="md">
        <Alert
          color="red"
          icon={
            <AlertCircle size={18} />
          }
          title="Unable to load equipment"
        >
          {error ??
            "The requested equipment could not be found."}
        </Alert>

        <Button
          variant="default"
          leftSection={
            <ArrowLeft size={16} />
          }
          onClick={() =>
            navigate(
              "/inventory/manage",
            )
          }
        >
          Back to Equipment
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Stack gap="lg">
        {/* Header */}
        <Group
          justify="space-between"
          align="flex-start"
        >
          <div>
            <Group gap="xs">
              <Button
                variant="subtle"
                size="sm"
                px={6}
                onClick={() =>
                  navigate(
                    "/inventory/manage",
                  )
                }
              >
                <ArrowLeft
                  size={18}
                />
              </Button>

              <Text
                fw={700}
                size="xl"
              >
                Assign Equipment
              </Text>
            </Group>

            <Text
              c="dimmed"
              size="sm"
              mt={4}
            >
              Assign or transfer this
              equipment to an employee.
            </Text>
          </div>

          {/* New Assignment */}
          <Button
            leftSection={
              <Plus size={17} />
            }
            onClick={() =>
              setNewAssignmentModalOpen(
                true,
              )
            }
            disabled={
              quantitySummary.available <=
              0
            }
          >
            New Assignment
          </Button>
        </Group>

        {/* Equipment Information */}
        <Paper
          withBorder
          p="lg"
          radius="md"
        >
          <Stack gap="lg">
            {/* Equipment Identity */}
            <Group
              align="flex-start"
              wrap="nowrap"
            >
              <Paper
                withBorder
                radius="md"
                p="sm"
                bg="gray.0"
              >
                <Package
                  size={26}
                />
              </Paper>

              <Stack
                gap={4}
                style={{
                  flex: 1,
                }}
              >
                <Group
                  justify="space-between"
                  align="flex-start"
                  wrap="nowrap"
                >
                  <div>
                    <Text
                      fw={700}
                      size="lg"
                    >
                      {
                        equipment.description
                      }
                    </Text>

                    <Text
                      size="sm"
                      c="dimmed"
                      mt={2}
                    >
                      Equipment Information
                    </Text>
                  </div>

                  <Stack
                    gap={6}
                    align="flex-end"
                  >
                    <Badge
                      variant="light"
                      size="lg"
                    >
                      {equipment
                        .equipment_type
                        ?.name ??
                        "Equipment"}
                    </Badge>

                    {!assignmentsLoading && (
                      <Group gap="xs">
                        <Badge
                          color={
                            quantitySummary.statusColor
                          }
                          variant="light"
                          leftSection={
                            <CheckCircle2
                              size={13}
                            />
                          }
                        >
                          {
                            quantitySummary.status
                          }
                        </Badge>

                        {quantitySummary.disposed >
                          0 && (
                          <Badge
                            color="red"
                            variant="light"
                          >
                            Disposed:{" "}
                            {
                              quantitySummary.disposed
                            }
                          </Badge>
                        )}
                      </Group>
                    )}
                  </Stack>
                </Group>
              </Stack>
            </Group>

            <Divider />

            {/* Equipment Identifiers */}
            <Group
              grow
              align="flex-start"
            >
              <div>
                <Text
                  size="xs"
                  c="dimmed"
                  fw={500}
                >
                  Property Number
                </Text>

                <Text
                  size="sm"
                  fw={600}
                  mt={3}
                >
                  {
                    equipment.property_number
                  }
                </Text>
              </div>

              <div>
                <Text
                  size="xs"
                  c="dimmed"
                  fw={500}
                >
                  Serial Number
                </Text>

                <Text
                  size="sm"
                  fw={600}
                  mt={3}
                >
                  {equipment.serial_number ||
                    "N/A"}
                </Text>
              </div>
            </Group>

            {/* Quantity Summary */}
            <Stack gap="sm">
              <div>
                <Text fw={600}>
                  Quantity & Availability
                </Text>

                <Text
                  size="xs"
                  c="dimmed"
                >
                  Current inventory
                  allocation for this
                  equipment.
                </Text>
              </div>

              <Group
                grow
                align="stretch"
              >
                {/* Total */}
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    borderLeft:
                      "4px solid var(--mantine-color-gray-5)",
                  }}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={500}
                  >
                    Total Units
                  </Text>

                  {assignmentsLoading ? (
                    <Skeleton
                      height={30}
                      width={60}
                      mt={6}
                    />
                  ) : (
                    <Text
                      size="xl"
                      fw={700}
                      mt={2}
                    >
                      {
                        quantitySummary.total
                      }
                    </Text>
                  )}

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={2}
                  >
                    Equipment quantity
                  </Text>
                </Paper>

                {/* Assigned */}
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    borderLeft:
                      "4px solid var(--mantine-color-orange-5)",
                  }}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={500}
                  >
                    Assigned
                  </Text>

                  {assignmentsLoading ? (
                    <Skeleton
                      height={30}
                      width={60}
                      mt={6}
                    />
                  ) : (
                    <Text
                      size="xl"
                      fw={700}
                      c="orange.7"
                      mt={2}
                    >
                      {
                        quantitySummary.assigned
                      }
                    </Text>
                  )}

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={2}
                  >
                    Currently assigned
                  </Text>
                </Paper>

                {/* Disposed */}
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    borderLeft:
                      "4px solid var(--mantine-color-red-5)",
                  }}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={500}
                  >
                    Disposed
                  </Text>

                  {assignmentsLoading ? (
                    <Skeleton
                      height={30}
                      width={60}
                      mt={6}
                    />
                  ) : (
                    <Text
                      size="xl"
                      fw={700}
                      c="red.7"
                      mt={2}
                    >
                      {
                        quantitySummary.disposed
                      }
                    </Text>
                  )}

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={2}
                  >
                    Permanently disposed
                  </Text>
                </Paper>

                {/* Available */}
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    borderLeft:
                      "4px solid var(--mantine-color-green-5)",
                  }}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={500}
                  >
                    Available
                  </Text>

                  {assignmentsLoading ? (
                    <Skeleton
                      height={30}
                      width={60}
                      mt={6}
                    />
                  ) : (
                    <Text
                      size="xl"
                      fw={700}
                      c="green.7"
                      mt={2}
                    >
                      {
                        quantitySummary.available
                      }
                    </Text>
                  )}

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={2}
                  >
                    Available for
                    assignment
                  </Text>
                </Paper>
              </Group>
            </Stack>
          </Stack>
        </Paper>

        {/* Assignment History */}
        <Stack gap="md">
          {assignmentsError && (
            <Alert
              color="red"
              icon={
                <AlertCircle
                  size={18}
                />
              }
              title="Assignment Error"
            >
              {assignmentsError}
            </Alert>
          )}

          <Paper
            withBorder
            p="md"
            radius="md"
          >
            <Group justify="space-between">
              <div>
                <Group gap="xs">
                  <ArrowLeftRight
                    size={18}
                  />

                  <Text fw={600}>
                    Assignment History
                  </Text>
                </Group>

                <Text
                  size="sm"
                  c="dimmed"
                  mt={3}
                >
                  View active, returned,
                  and disposed assignments.
                  Select any assignment to
                  view its assignment thread.
                </Text>
              </div>

              <Badge variant="light">
                {
                  groupedAssignments.length
                }{" "}
                groups
              </Badge>
            </Group>

            <Divider my="md" />

            {assignmentsLoading ? (
              <Stack gap="sm">
                <Skeleton height={80} />
                <Skeleton height={80} />
              </Stack>
            ) : groupedAssignments.length ===
              0 ? (
              <Alert
                color="blue"
                icon={
                  <AlertCircle
                    size={18}
                  />
                }
                title="No assignment history"
              >
                This equipment currently
                has no active, returned,
                or disposed assignments.
              </Alert>
            ) : (
              <Stack gap="md">
                {groupedAssignments.map(
                  ({
                    groupId,
                    assignments:
                      groupAssignments,
                  }) => (
                    <Paper
                      key={groupId}
                      withBorder
                      p="md"
                      radius="md"
                    >
                      <Stack gap="sm">
                        {groupAssignments.map(
                          (
                            assignment,
                            index,
                          ) => {
                            const selected =
                              assignment.id ===
                              selectedAssignmentId;

                            const statusConfig =
                              {
                                active: {
                                  label:
                                    "Active",
                                  color:
                                    "green",
                                },
                                returned: {
                                  label:
                                    "Returned",
                                  color:
                                    "blue",
                                },
                                disposed: {
                                  label:
                                    "Disposed",
                                  color:
                                    "red",
                                },
                              } as const;

                            const status =
                              statusConfig[
                                assignment.status as
                                  | "active"
                                  | "returned"
                                  | "disposed"
                              ];

                            return (
                              <div
                                key={
                                  assignment.id
                                }
                              >
                                {index >
                                  0 && (
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
                                  style={{
                                    position:
                                      "relative",
                                    cursor:
                                      "pointer",
                                    borderWidth:
                                      selected
                                        ? 2
                                        : 1,
                                    borderColor:
                                      selected
                                        ? "var(--mantine-primary-color-filled)"
                                        : undefined,
                                    backgroundColor:
                                      selected
                                        ? "var(--mantine-primary-color-light)"
                                        : undefined,
                                    transition:
                                      "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
                                    boxShadow:
                                      selected
                                        ? "var(--mantine-shadow-sm)"
                                        : undefined,
                                  }}
                                  onClick={() =>
                                    handleSelectAssignment(
                                      assignment,
                                    )
                                  }
                                >
                                  <Stack gap="sm">
                                    {/* Header */}
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
                                          size={
                                            38
                                          }
                                          radius="md"
                                          variant={
                                            selected
                                              ? "filled"
                                              : "light"
                                          }
                                          color={
                                            selected
                                              ? "blue"
                                              : "gray"
                                          }
                                        >
                                          <UserRoundCog
                                            size={
                                              18
                                            }
                                          />
                                        </ThemeIcon>

                                        <Stack
                                          gap={2}
                                          style={{
                                            minWidth: 0,
                                            flex: 1,
                                          }}
                                        >
                                          <Text
                                            fw={
                                              700
                                            }
                                            size="sm"
                                            style={{
                                              wordBreak:
                                                "break-all",
                                            }}
                                          >
                                            {
                                              assignment.user_employee_id
                                            }
                                          </Text>

                                          <Group gap="xs">
                                            <Badge
                                              size="xs"
                                              color={
                                                status.color
                                              }
                                              variant="light"
                                            >
                                              {
                                                status.label
                                              }
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
                                        </Stack>
                                      </Group>

                                      {selected && (
                                        <Badge
                                          size="sm"
                                          color="yellow"
                                          variant="filled"
                                          leftSection={
                                            <Check
                                              size={
                                                12
                                              }
                                            />
                                          }
                                        >
                                          Selected
                                        </Badge>
                                      )}
                                    </Group>

                                    {/* Care Of */}
                                    {assignment.is_care_of && (
                                      <Paper
                                        withBorder
                                        radius="sm"
                                        p="xs"
                                        bg="var(--mantine-color-gray-0)"
                                      >
                                        <Group gap="xs">
                                          <UserRoundCog
                                            size={
                                              14
                                            }
                                            style={{
                                              color:
                                                "var(--mantine-color-dimmed)",
                                            }}
                                          />

                                          <Text
                                            size="xs"
                                            c="dimmed"
                                          >
                                            Care Of
                                          </Text>

                                          <Text
                                            size="xs"
                                            fw={
                                              600
                                            }
                                            style={{
                                              wordBreak:
                                                "break-all",
                                            }}
                                          >
                                            {assignment.care_of_employee_id ??
                                              "N/A"}
                                          </Text>
                                        </Group>
                                      </Paper>
                                    )}

                                    <Divider />

                                    {/* Assignment Metadata */}
                                    <Group
                                      gap="xl"
                                      wrap="wrap"
                                    >
                                      <Group gap="xs">
                                        <ThemeIcon
                                          size={
                                            28
                                          }
                                          radius="md"
                                          variant="light"
                                          color="blue"
                                        >
                                          <CalendarDays
                                            size={
                                              14
                                            }
                                          />
                                        </ThemeIcon>

                                        <div>
                                          <Text
                                            size="xs"
                                            c="dimmed"
                                          >
                                            Date Assigned
                                          </Text>

                                          <Text
                                            size="xs"
                                            fw={
                                              600
                                            }
                                            mt={
                                              1
                                            }
                                          >
                                            {formatDate(
                                              assignment.assigned_at,
                                            )}
                                          </Text>
                                        </div>
                                      </Group>

                                      <Group gap="xs">
                                        <ThemeIcon
                                          size={
                                            28
                                          }
                                          radius="md"
                                          variant="light"
                                          color="gray"
                                        >
                                          <Package
                                            size={
                                              14
                                            }
                                          />
                                        </ThemeIcon>

                                        <div>
                                          <Text
                                            size="xs"
                                            c="dimmed"
                                          >
                                            Quantity
                                          </Text>

                                          <Text
                                            size="xs"
                                            fw={
                                              600
                                            }
                                            mt={
                                              1
                                            }
                                          >
                                            {
                                              assignment.quantity
                                            }
                                          </Text>
                                        </div>
                                      </Group>

                                      <div>
                                        <Text
                                          size="xs"
                                          c="dimmed"
                                        >
                                          Property Number
                                        </Text>

                                        <Text
                                          size="xs"
                                          fw={
                                            600
                                          }
                                          mt={
                                            1
                                          }
                                          style={{
                                            wordBreak:
                                              "break-all",
                                          }}
                                        >
                                          {
                                            assignment.property_number
                                          }
                                        </Text>
                                      </div>

                                      {assignment.returned_at && (
                                        <div>
                                          <Text
                                            size="xs"
                                            c="dimmed"
                                          >
                                            End Date
                                          </Text>

                                          <Text
                                            size="xs"
                                            fw={
                                              600
                                            }
                                            mt={
                                              1
                                            }
                                          >
                                            {formatDate(
                                              assignment.returned_at,
                                            )}
                                          </Text>
                                        </div>
                                      )}
                                    </Group>
                                  </Stack>
                                </Paper>
                              </div>
                            );
                          },
                        )}
                      </Stack>
                    </Paper>
                  ),
                )}
              </Stack>
            )}
          </Paper>

          {/* Assignment Thread */}
          {selectedAssignment && (
            <>
              {historyLoading ? (
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                >
                  <Stack gap="md">
                    <Skeleton
                      height={28}
                      width={220}
                    />

                    <Skeleton height={80} />

                    <Skeleton height={80} />

                    <Skeleton height={250} />
                  </Stack>
                </Paper>
              ) : (
                <EquipmentTransferForm
                  equipment={equipment}
                  assignment={
                    selectedAssignment
                  }
                  assignmentHistory={
                    assignmentHistory
                  }
                  attachmentTypes={
                    attachmentTypes
                  }
                  loadingAttachmentTypes={
                    loadingAttachmentTypes
                  }
                  onSuccess={
                    handleTransferSuccess
                  }
                  onCancel={
                    clearTransferSelection
                  }
                />
              )}
            </>
          )}
        </Stack>
      </Stack>

      {/* New Assignment Modal */}
      <Modal
        opened={
          newAssignmentModalOpen
        }
        onClose={() =>
          setNewAssignmentModalOpen(
            false,
          )
        }
        title={
          <Group gap="sm">
            <ThemeIcon
              size={32}
              radius="md"
              variant="light"
            >
              <Package size={17} />
            </ThemeIcon>

            <div>
              <Text fw={700}>
                New Assignment
              </Text>

              <Text
                size="xs"
                c="dimmed"
              >
                Assign available equipment
                to an employee.
              </Text>
            </div>
          </Group>
        }
        size="lg"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        closeOnClickOutside={false}
      >
        <EquipmentAssignmentForm
          attachmentTypes={
            attachmentTypes
          }
          loadingAttachmentTypes={
            loadingAttachmentTypes
          }
          equipment={equipment}
          onSuccess={
            handleNewAssignmentSuccess
          }
          onCancel={() =>
            setNewAssignmentModalOpen(
              false,
            )
          }
        />
      </Modal>
    </>
  );
}
