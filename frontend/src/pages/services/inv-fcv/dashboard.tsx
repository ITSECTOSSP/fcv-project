import { useEffect, useMemo, useState } from "react";

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
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  ArrowRightLeft,
  Boxes,
  ClipboardList,
  FileCheck,
  PackageCheck,
  PackageOpen,
  RotateCcw,
  Tags,
  Trash2,
  UserRound,
} from "lucide-react";

import api from "@/lib/api/api";

/*
 * |--------------------------------------------------------------------------
 * | CONSTANTS
 * |--------------------------------------------------------------------------
 */

const GOLD = "#C9A227";

const EQUIPMENT_PER_PAGE = 100;
const ASSIGNMENT_PER_PAGE = 100;

/*
 * |--------------------------------------------------------------------------
 * | TYPES
 * |--------------------------------------------------------------------------
 */

interface EquipmentType {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  equipment_type_id: string;
  property_number: string;
  serial_number: string | null;
  description: string;
  quantity: number;
  unit_cost: number;
  date_acquired: string;
  equipment_type?: EquipmentType;
}

interface AssignmentEquipment {
  id: string;
  property_number: string;
  serial_number: string | null;
  description: string;
  quantity: number;
}

interface EquipmentAssignment {
  id: string;
  assignment_group_id: string;
  equipment_id: string;
  property_number: string;
  serial_number: string | null;
  user_employee_id: string;
  quantity: number;
  assigned_at: string;
  returned_at: string | null;
  status: "active" | "returned" | "transferred" | "disposed";
  remarks: string | null;
  equipment?: AssignmentEquipment;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/*
 * |--------------------------------------------------------------------------
 * | PAGE
 * |--------------------------------------------------------------------------
 */

export default function InventoryDashboard() {
  /*
   * |--------------------------------------------------------------------------
   * | STATE
   * |--------------------------------------------------------------------------
   */

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);

  const [activeAssignments, setActiveAssignments] = useState<
    EquipmentAssignment[]
  >([]);

  const [returnedAssignments, setReturnedAssignments] = useState<
    EquipmentAssignment[]
  >([]);

  const [transferredAssignments, setTransferredAssignments] = useState<
    EquipmentAssignment[]
  >([]);

  const [disposedAssignments, setDisposedAssignments] = useState<
    EquipmentAssignment[]
  >([]);

  const [loading, setLoading] = useState(true);

  /*
   * |--------------------------------------------------------------------------
   * | LOAD DASHBOARD DATA
   * |--------------------------------------------------------------------------
   */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          equipmentsResponse,
          equipmentTypesResponse,
          activeResponse,
          returnedResponse,
          transferredResponse,
          disposedResponse,
        ] = await Promise.all([
          api.get<PaginatedResponse<Equipment>>("/api/inventory/equipments", {
            params: {
              per_page: EQUIPMENT_PER_PAGE,
            },
          }),

          api.get<PaginatedResponse<EquipmentType>>(
            "/api/inventory/equipment-types",
            {
              params: {
                per_page: EQUIPMENT_PER_PAGE,
              },
            },
          ),

          api.get<PaginatedResponse<EquipmentAssignment>>(
            "/api/inventory/equipment-assignments",
            {
              params: {
                status: "active",
                per_page: ASSIGNMENT_PER_PAGE,
              },
            },
          ),

          api.get<PaginatedResponse<EquipmentAssignment>>(
            "/api/inventory/equipment-assignments",
            {
              params: {
                status: "returned",
                per_page: ASSIGNMENT_PER_PAGE,
              },
            },
          ),

          api.get<PaginatedResponse<EquipmentAssignment>>(
            "/api/inventory/equipment-assignments",
            {
              params: {
                status: "transferred",
                per_page: ASSIGNMENT_PER_PAGE,
              },
            },
          ),

          api.get<PaginatedResponse<EquipmentAssignment>>(
            "/api/inventory/equipment-assignments",
            {
              params: {
                status: "disposed",
                per_page: ASSIGNMENT_PER_PAGE,
              },
            },
          ),
        ]);

        setEquipments(equipmentsResponse.data.data);
        setEquipmentTypes(equipmentTypesResponse.data.data);

        setActiveAssignments(activeResponse.data.data);
        setReturnedAssignments(returnedResponse.data.data);
        setTransferredAssignments(transferredResponse.data.data);
        setDisposedAssignments(disposedResponse.data.data);
      } catch (error) {
        console.error("Failed to load inventory dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /*
   * |--------------------------------------------------------------------------
   * | INVENTORY STATISTICS
   * |--------------------------------------------------------------------------
   */

  const statistics = useMemo(() => {
    const equipmentRecords = equipments.length;

    const totalQuantity = equipments.reduce(
      (total, equipment) => total + Number(equipment.quantity || 0),
      0,
    );

    const assignedQuantity = activeAssignments.reduce(
      (total, assignment) => total + Number(assignment.quantity || 0),
      0,
    );

    const availableQuantity = Math.max(totalQuantity - assignedQuantity, 0);

    return {
      equipmentRecords,
      totalQuantity,
      assignedQuantity,
      availableQuantity,
      equipmentTypes: equipmentTypes.length,

      activeAssignments: activeAssignments.length,
      returnedAssignments: returnedAssignments.length,
      transferredAssignments: transferredAssignments.length,
      disposedAssignments: disposedAssignments.length,
    };
  }, [
    equipments,
    equipmentTypes,
    activeAssignments,
    returnedAssignments,
    transferredAssignments,
    disposedAssignments,
  ]);

  /*
   * |--------------------------------------------------------------------------
   * | QUANTITY PERCENTAGES
   * |--------------------------------------------------------------------------
   */

  const assignedPercentage =
    statistics.totalQuantity > 0
      ? Math.min(
          Math.round(
            (statistics.assignedQuantity / statistics.totalQuantity) * 100,
          ),
          100,
        )
      : 0;

  const availablePercentage =
    statistics.totalQuantity > 0
      ? Math.min(
          Math.round(
            (statistics.availableQuantity / statistics.totalQuantity) * 100,
          ),
          100,
        )
      : 0;

  /*
   * |--------------------------------------------------------------------------
   * | RECENT ASSIGNMENTS
   * |--------------------------------------------------------------------------
   */

  const recentAssignments = useMemo(() => {
    return [...activeAssignments]
      .sort(
        (a, b) =>
          new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
      )
      .slice(0, 5);
  }, [activeAssignments]);

  /*
   * |--------------------------------------------------------------------------
   * | RECENT ACTIVITY
   * |--------------------------------------------------------------------------
   */

  const recentActivity = useMemo(() => {
    const activities = [
      ...activeAssignments.map((assignment) => ({
        id: `active-${assignment.id}`,
        type: "assignment" as const,
        date: assignment.assigned_at,
        title: "Equipment Assigned",
        description: assignment.property_number,
        icon: PackageCheck,
      })),

      ...returnedAssignments.map((assignment) => ({
        id: `returned-${assignment.id}`,
        type: "return" as const,
        date: assignment.returned_at ?? assignment.assigned_at,
        title: "Equipment Returned",
        description: assignment.property_number,
        icon: RotateCcw,
      })),

      ...transferredAssignments.map((assignment) => ({
        id: `transferred-${assignment.id}`,
        type: "transfer" as const,
        date: assignment.assigned_at,
        title: "Equipment Transferred",
        description: assignment.property_number,
        icon: ArrowRightLeft,
      })),

      ...disposedAssignments.map((assignment) => ({
        id: `disposed-${assignment.id}`,
        type: "dispose" as const,
        date: assignment.assigned_at,
        title: "Equipment Disposed",
        description: assignment.property_number,
        icon: Trash2,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [
    activeAssignments,
    returnedAssignments,
    transferredAssignments,
    disposedAssignments,
  ]);

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

      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Title order={2}>Inventory Dashboard</Title>

          <Text size="sm" c="dimmed">
            Overview of office equipment, quantities, assignments, and inventory
            accountability.
          </Text>
        </Stack>
      </Group>

      {/* ------------------------------------------------------------------ */}
      {/* INVENTORY ANALYTICS */}
      {/* ------------------------------------------------------------------ */}

      <SimpleGrid
        cols={{
          base: 1,
          xs: 2,
          sm: 2,
          lg: 5,
        }}
      >
        <InventoryStat
          label="Equipment Records"
          value={statistics.equipmentRecords}
          description="Registered equipment"
          icon={Boxes}
          loading={loading}
        />

        <InventoryStat
          label="Total Quantity"
          value={statistics.totalQuantity}
          description="Total equipment units"
          icon={PackageCheck}
          loading={loading}
        />

        <InventoryStat
          label="Assigned Quantity"
          value={statistics.assignedQuantity}
          description="Currently assigned units"
          icon={UserRound}
          loading={loading}
        />

        <InventoryStat
          label="Available Quantity"
          value={statistics.availableQuantity}
          description="Available for assignment"
          icon={PackageOpen}
          loading={loading}
        />

        <InventoryStat
          label="Equipment Types"
          value={statistics.equipmentTypes}
          description="Registered categories"
          icon={Tags}
          loading={loading}
        />
      </SimpleGrid>

      {/* ------------------------------------------------------------------ */}
      {/* EQUIPMENT AVAILABILITY */}
      {/* ------------------------------------------------------------------ */}

      <Grid>
        {/* ---------------------------------------------------------------- */}
        {/* AVAILABILITY */}
        {/* ---------------------------------------------------------------- */}

        <Grid.Col
          span={{
            base: 12,
            md: 7,
          }}
        >
          <Card
            withBorder
            radius="lg"
            padding="lg"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
            "
          >
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                  <PackageCheck size={18} color={GOLD} />
                </ThemeIcon>

                <div>
                  <Text fw={600}>Equipment Availability</Text>

                  <Text size="xs" c="dimmed">
                    Current inventory quantity
                  </Text>
                </div>
              </Group>

              <Divider />

              {loading ? (
                <Stack gap="md">
                  <Skeleton height={50} radius="md" />
                  <Skeleton height={50} radius="md" />
                  <Skeleton height={80} radius="md" />
                </Stack>
              ) : (
                <>
                  <InventoryQuantityRow
                    label="Assigned"
                    count={statistics.assignedQuantity}
                    total={statistics.totalQuantity}
                    percentage={assignedPercentage}
                    color="blue"
                  />

                  <InventoryQuantityRow
                    label="Available"
                    count={statistics.availableQuantity}
                    total={statistics.totalQuantity}
                    percentage={availablePercentage}
                    color="green"
                  />

                  <Paper withBorder radius="md" p="md">
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" c="dimmed">
                          Inventory utilization
                        </Text>

                        <Text size="lg" fw={700} mt={2}>
                          {assignedPercentage}%
                        </Text>
                      </div>

                      <Text size="xs" c="dimmed" ta="right">
                        {statistics.assignedQuantity.toLocaleString()} of{" "}
                        {statistics.totalQuantity.toLocaleString()} units
                        assigned
                      </Text>
                    </Group>
                  </Paper>
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* ---------------------------------------------------------------- */}
        {/* ASSIGNMENT STATUS */}
        {/* ---------------------------------------------------------------- */}

        <Grid.Col
          span={{
            base: 12,
            md: 5,
          }}
        >
          <Card
            withBorder
            radius="lg"
            padding="lg"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
            "
          >
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                  <ClipboardList size={18} color={GOLD} />
                </ThemeIcon>

                <div>
                  <Text fw={600}>Assignment Status</Text>

                  <Text size="xs" c="dimmed">
                    Equipment accountability
                  </Text>
                </div>
              </Group>

              <Divider />

              {loading ? (
                <Stack gap="md">
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                </Stack>
              ) : (
                <>
                  <AssignmentStatusItem
                    label="Active"
                    value={statistics.activeAssignments}
                    icon={UserRound}
                    color="blue"
                  />

                  <AssignmentStatusItem
                    label="Returned"
                    value={statistics.returnedAssignments}
                    icon={RotateCcw}
                    color="green"
                  />

                  <AssignmentStatusItem
                    label="Transferred"
                    value={statistics.transferredAssignments}
                    icon={ArrowRightLeft}
                    color="orange"
                  />

                  <AssignmentStatusItem
                    label="Disposed"
                    value={statistics.disposedAssignments}
                    icon={Trash2}
                    color="red"
                  />
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* ------------------------------------------------------------------ */}
      {/* ASSIGNMENT ACTIVITY */}
      {/* ------------------------------------------------------------------ */}

      <Grid>
        {/* ---------------------------------------------------------------- */}
        {/* RECENT ASSIGNMENTS */}
        {/* ---------------------------------------------------------------- */}

        <Grid.Col
          span={{
            base: 12,
            md: 7,
          }}
        >
          <Card
            withBorder
            radius="lg"
            padding="lg"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
            "
          >
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm">
                  <ThemeIcon
                    variant="light"
                    color="yellow"
                    size="lg"
                    radius="md"
                  >
                    <ClipboardList size={18} color={GOLD} />
                  </ThemeIcon>

                  <div>
                    <Text fw={600}>Recent Assignments</Text>

                    <Text size="xs" c="dimmed">
                      Latest equipment assigned to employees
                    </Text>
                  </div>
                </Group>

                <Badge variant="light" color="gray">
                  {statistics.activeAssignments}
                </Badge>
              </Group>

              <Divider />

              {loading ? (
                <Stack gap="sm">
                  <Skeleton height={55} radius="md" />
                  <Skeleton height={55} radius="md" />
                  <Skeleton height={55} radius="md" />
                  <Skeleton height={55} radius="md" />
                </Stack>
              ) : recentAssignments.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No recent assignments"
                  description="Recently assigned equipment will appear here."
                />
              ) : (
                <Stack gap="sm">
                  {recentAssignments.map((assignment) => (
                    <Paper key={assignment.id} withBorder radius="md" p="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                          <ThemeIcon
                            variant="light"
                            color="yellow"
                            size="md"
                            radius="md"
                          >
                            <PackageCheck size={15} color={GOLD} />
                          </ThemeIcon>

                          <div className="min-w-0">
                            <Text size="sm" fw={600} truncate>
                              {assignment.property_number}
                            </Text>

                            <Text size="xs" c="dimmed" truncate>
                              {assignment.quantity}{" "}
                              {assignment.quantity === 1 ? "unit" : "units"} •
                              Employee ID: {assignment.user_employee_id}
                            </Text>
                          </div>
                        </Group>

                        <Badge color="blue" variant="light">
                          Active
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* ---------------------------------------------------------------- */}
        {/* RECENT INVENTORY ACTIVITY */}
        {/* ---------------------------------------------------------------- */}

        <Grid.Col
          span={{
            base: 12,
            md: 5,
          }}
        >
          <Card
            withBorder
            radius="lg"
            padding="lg"
            className="
              !border-[var(--border)]
              !bg-[var(--surface)]
            "
          >
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                  <FileCheck size={18} color={GOLD} />
                </ThemeIcon>

                <div>
                  <Text fw={600}>Inventory Activity</Text>

                  <Text size="xs" c="dimmed">
                    Recent inventory changes
                  </Text>
                </div>
              </Group>

              <Divider />

              {loading ? (
                <Stack gap="md">
                  <Skeleton height={42} />
                  <Skeleton height={42} />
                  <Skeleton height={42} />
                  <Skeleton height={42} />
                </Stack>
              ) : recentActivity.length === 0 ? (
                <EmptyState
                  icon={FileCheck}
                  title="No recent activity"
                  description="Equipment assignments, transfers, returns, and disposals will appear here."
                />
              ) : (
                <Stack gap="md">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <Group key={activity.id} gap="sm" wrap="nowrap">
                        <ThemeIcon
                          variant="light"
                          color="yellow"
                          size="md"
                          radius="md"
                        >
                          <Icon size={15} color={GOLD} />
                        </ThemeIcon>

                        <div className="min-w-0 flex-1">
                          <Text size="sm" fw={500}>
                            {activity.title}
                          </Text>

                          <Text size="xs" c="dimmed" truncate>
                            {activity.description}
                          </Text>
                        </div>
                      </Group>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* ------------------------------------------------------------------ */}
      {/* ASSIGNMENT HISTORY */}
      {/* ------------------------------------------------------------------ */}

      <Card
        withBorder
        radius="lg"
        padding="lg"
        className="
          !border-[var(--border)]
          !bg-[var(--surface)]
        "
      >
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                <ArrowRightLeft size={18} color={GOLD} />
              </ThemeIcon>

              <div>
                <Text fw={600}>Assignment History</Text>

                <Text size="xs" c="dimmed">
                  Equipment movement and accountability history
                </Text>
              </div>
            </Group>

            <Badge variant="light" color="yellow">
              Assignment Thread
            </Badge>
          </Group>

          <Divider />

          {loading ? (
            <Stack gap="sm">
              <Skeleton height={70} radius="md" />
              <Skeleton height={70} radius="md" />
            </Stack>
          ) : (
            <Paper withBorder radius="md" p="lg" className="!border-dashed">
              <Stack align="center" gap="sm">
                <ThemeIcon variant="light" color="gray" size={48} radius="xl">
                  <ArrowRightLeft size={24} />
                </ThemeIcon>

                <Text fw={600} ta="center">
                  Assignment Thread
                </Text>

                <Text size="xs" c="dimmed" ta="center" maw={620}>
                  Equipment transfers are linked through the assignment group
                  and transfer records. Individual assignment threads can be
                  viewed from the equipment assignment details.
                </Text>

                <Group gap="xs">
                  <Badge variant="light" color="blue">
                    {statistics.activeAssignments} Active
                  </Badge>

                  <Badge variant="light" color="green">
                    {statistics.returnedAssignments} Returned
                  </Badge>

                  <Badge variant="light" color="orange">
                    {statistics.transferredAssignments} Transferred
                  </Badge>

                  <Badge variant="light" color="red">
                    {statistics.disposedAssignments} Disposed
                  </Badge>
                </Group>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* INVENTORY CLASSIFICATION */}
      {/* ------------------------------------------------------------------ */}

      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
        }}
      >
        <Card
          withBorder
          radius="lg"
          padding="lg"
          className="
            !border-[var(--border)]
            !bg-[var(--surface)]
          "
        >
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                <Tags size={18} color={GOLD} />
              </ThemeIcon>

              <div>
                <Text fw={600}>Equipment Classification</Text>

                <Text size="xs" c="dimmed">
                  Registered equipment types
                </Text>
              </div>
            </Group>

            {loading ? (
              <Skeleton height={30} width={45} radius="sm" />
            ) : (
              <Text size="xl" fw={700}>
                {statistics.equipmentTypes.toLocaleString()}
              </Text>
            )}
          </Group>

          <Divider my="md" />

          <Text size="sm" c="dimmed">
            Equipment types are used to categorize and organize inventory
            records.
          </Text>
        </Card>

        <Card
          withBorder
          radius="lg"
          padding="lg"
          className="
            !border-[var(--border)]
            !bg-[var(--surface)]
          "
        >
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                <FileCheck size={18} color={GOLD} />
              </ThemeIcon>

              <div>
                <Text fw={600}>Supporting Documents</Text>

                <Text size="xs" c="dimmed">
                  Equipment and assignment documentation
                </Text>
              </div>
            </Group>

            <Badge variant="light" color="gray">
              Attachments
            </Badge>
          </Group>

          <Divider my="md" />

          <Text size="sm" c="dimmed">
            Supporting documents are maintained against equipment records and
            assignment transactions.
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | INVENTORY STAT
 * |--------------------------------------------------------------------------
 */

interface InventoryStatProps {
  label: string;
  value: number;
  description: string;
  icon: typeof Boxes;
  loading?: boolean;
}

function InventoryStat({
  label,
  value,
  description,
  icon: Icon,
  loading = false,
}: InventoryStatProps) {
  return (
    <Card
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
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            {label}
          </Text>

          {loading ? (
            <Skeleton height={30} width={60} mt={8} radius="sm" />
          ) : (
            <Title order={2} mt={8}>
              {value.toLocaleString()}
            </Title>
          )}

          <Text size="xs" c="dimmed" mt={4}>
            {description}
          </Text>
        </div>

        <ThemeIcon variant="light" color="yellow" size="xl" radius="md">
          <Icon size={20} color={GOLD} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | INVENTORY QUANTITY ROW
 * |--------------------------------------------------------------------------
 */

interface InventoryQuantityRowProps {
  label: string;
  count: number;
  total: number;
  percentage: number;
  color: string;
}

function InventoryQuantityRow({
  label,
  count,
  total,
  percentage,
  color,
}: InventoryQuantityRowProps) {
  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Group gap="xs">
          <Badge color={color} variant="light">
            {label}
          </Badge>

          <Text size="sm" c="dimmed">
            {count.toLocaleString()} {count === 1 ? "unit" : "units"}
          </Text>
        </Group>

        <Text size="sm" fw={600}>
          {percentage}%
        </Text>
      </Group>

      <Progress value={percentage} size="sm" radius="xl" color={color} />

      <Text size="xs" c="dimmed">
        {count.toLocaleString()} of {total.toLocaleString()} total units
      </Text>
    </Stack>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | ASSIGNMENT STATUS ITEM
 * |--------------------------------------------------------------------------
 */

interface AssignmentStatusItemProps {
  label: string;
  value: number;
  icon: typeof UserRound;
  color: string;
}

function AssignmentStatusItem({
  label,
  value,
  icon: Icon,
  color,
}: AssignmentStatusItemProps) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="sm">
        <ThemeIcon variant="light" color={color} size="md" radius="md">
          <Icon size={16} />
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>

      <Text fw={700} size="sm">
        {value.toLocaleString()}
      </Text>
    </Group>
  );
}

/*
 * |--------------------------------------------------------------------------
 * | EMPTY STATE
 * |--------------------------------------------------------------------------
 */

interface EmptyStateProps {
  icon: typeof ClipboardList;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Paper withBorder radius="md" p="xl" className="!border-dashed">
      <Stack align="center" gap="sm">
        <ThemeIcon variant="light" color="gray" size={48} radius="xl">
          <Icon size={22} />
        </ThemeIcon>

        <Text fw={600} ta="center">
          {title}
        </Text>

        <Text size="xs" c="dimmed" ta="center" maw={400}>
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}
