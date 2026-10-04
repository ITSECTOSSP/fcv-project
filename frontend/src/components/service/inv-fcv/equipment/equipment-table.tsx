import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  MultiSelect,
  Paper,
  Progress,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMemo, useState } from "react";

import {
  CalendarDays,
  Edit,
  MoreVertical,
  PackageOpen,
  Search,
  Tag,
  Trash2,
  UserPlus,
} from "lucide-react";

import type { Equipment } from "@/types/inv-fcv/equipment";
import type { EquipmentType } from "@/types/inv-fcv/equipment-types";

/* =====================================================
 * PROPS
 * ===================================================== */

type EquipmentTableProps = {
  equipments: Equipment[];
  equipmentTypes: EquipmentType[];
  loading?: boolean;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
  onView?: (equipment: Equipment) => void;
  onAssign?: (equipment: Equipment) => void;
};

/* =====================================================
 * HELPERS
 * ===================================================== */

function getAssignmentStatus(equipment: Equipment) {
  const total = Number(equipment.quantity ?? 0);
  const assigned = Number(equipment.assigned_quantity ?? 0);

  const available = Number(equipment.available_quantity ?? 0);

  const disposed = Number(
    (
      equipment as Equipment & {
        disposed_quantity?: number;
      }
    ).disposed_quantity ?? 0,
  );

  if (total <= 0) {
    return {
      label: "No Quantity",
      color: "gray",
    };
  }

  if (disposed >= total) {
    return {
      label: "Fully Disposed",
      color: "red",
    };
  }

  if (available <= 0) {
    return {
      label: "Fully Assigned",
      color: "red",
    };
  }

  if (assigned <= 0 && disposed <= 0) {
    return {
      label: "Available",
      color: "green",
    };
  }

  return {
    label: "Partially Assigned",
    color: "yellow",
  };
}

function formatCurrency(value: string | number) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "₱0.00";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/*
 * Quantity information.
 *
 * IMPORTANT:
 *
 * Returned units are historical information.
 * They do NOT reduce current available stock.
 *
 * Disposed units DO reduce current available stock.
 */
function getQuantitySummary(equipment: Equipment) {
  const total = Number(equipment.quantity ?? 0);

  const assigned = Number(equipment.assigned_quantity ?? 0);

  const disposed = Number(
    (
      equipment as Equipment & {
        disposed_quantity?: number;
      }
    ).disposed_quantity ?? 0,
  );

  /*
   * Returned quantity is informational.
   *
   * It represents units that were previously
   * assigned and subsequently returned.
   *
   * It should not be subtracted from available.
   */
  const returned = Number(
    (
      equipment as Equipment & {
        returned_quantity?: number;
      }
    ).returned_quantity ?? 0,
  );

  /*
   * Current inventory availability.
   *
   * Returned units are available again.
   *
   * Disposed units are permanently removed.
   */
  const available = Math.max(total - assigned - disposed, 0);

  return {
    total,
    assigned,
    returned,
    disposed,
    available,
  };
}

/* =====================================================
 * COMPONENT
 * ===================================================== */

export default function EquipmentTable({
  equipments,
  equipmentTypes,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAssign,
}: EquipmentTableProps) {
  /* =====================================================
   * FILTER STATE
   * ===================================================== */

  const [search, setSearch] = useState("");

  const [equipmentTypeIds, setEquipmentTypeIds] = useState<string[]>([]);

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  /* =====================================================
   * EQUIPMENT TYPE OPTIONS
   * ===================================================== */

  const equipmentTypeOptions = useMemo(() => {
    return equipmentTypes.map((type) => ({
      value: type.id,
      label: type.name,
    }));
  }, [equipmentTypes]);

  /* =====================================================
   * FILTERED EQUIPMENTS
   * ===================================================== */

  const filteredEquipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipments.filter((equipment) => {
      const matchesSearch =
        !query ||
        [
          equipment.equipment_type?.name,
          equipment.description,
          equipment.property_number,
          equipment.serial_number,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesEquipmentType =
        equipmentTypeIds.length === 0 ||
        equipmentTypeIds.includes(equipment.equipment_type_id);

      const acquiredDate = equipment.date_acquired
        ? new Date(equipment.date_acquired)
        : null;

      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;

      const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

      const matchesDateFrom =
        !fromDate || (acquiredDate !== null && acquiredDate >= fromDate);

      const matchesDateTo =
        !toDate || (acquiredDate !== null && acquiredDate <= toDate);

      return (
        matchesSearch &&
        matchesEquipmentType &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [equipments, search, equipmentTypeIds, dateFrom, dateTo]);

  /* =====================================================
   * FILTER STATE
   * ===================================================== */

  const hasFilters =
    search.trim() !== "" ||
    equipmentTypeIds.length > 0 ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = () => {
    setSearch("");
    setEquipmentTypeIds([]);
    setDateFrom("");
    setDateTo("");
  };

  /* =====================================================
   * LOADING ROWS
   * ===================================================== */

  if (loading) {
    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        style={{
          overflow: "hidden",
        }}
      >
        <Table.ScrollContainer minWidth={1180}>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Equipment</Table.Th>

                <Table.Th>Date Acquired</Table.Th>

                <Table.Th>Quantity</Table.Th>

                <Table.Th>Unit Cost</Table.Th>

                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Group wrap="nowrap" gap="md">
                      <Skeleton height={52} width={52} radius="md" />

                      <Stack gap={6}>
                        <Skeleton height={15} width={180} />

                        <Skeleton height={12} width={250} />

                        <Skeleton height={10} width={210} />
                      </Stack>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Skeleton height={14} width={100} />
                  </Table.Td>

                  <Table.Td>
                    <Stack gap={8}>
                      <Skeleton height={22} width={100} radius="xl" />

                      <Skeleton height={8} width={220} radius="xl" />

                      <Group gap="xs">
                        <Skeleton height={12} width={70} />

                        <Skeleton height={12} width={70} />

                        <Skeleton height={12} width={70} />
                      </Group>
                    </Stack>
                  </Table.Td>

                  <Table.Td>
                    <Skeleton height={14} width={90} />
                  </Table.Td>

                  <Table.Td>
                    <Group justify="flex-end">
                      <Skeleton height={34} width={34} radius="md" />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    );
  }

  /* =====================================================
   * TABLE
   * ===================================================== */

  return (
    <Stack gap="md">
      {/* =================================================
       * FILTERS
       * ================================================= */}

      <Paper withBorder radius="md" p="md" shadow="xs">
        <Stack gap="sm">
          <Group align="flex-end" grow>
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search property number, serial number, description..."
              label="Search"
              leftSection={<Search size={17} strokeWidth={1.8} />}
              radius="md"
            />

            <MultiSelect
              label="Equipment Type"
              placeholder="Select equipment types"
              data={equipmentTypeOptions}
              value={equipmentTypeIds}
              onChange={setEquipmentTypeIds}
              clearable
              searchable
              hidePickedOptions
              radius="md"
            />

            <DateInput
              label="Date Acquired From"
              placeholder="Select start date"
              value={dateFrom}
              onChange={(value) => setDateFrom(value ?? "")}
              leftSection={<CalendarDays size={17} />}
              valueFormat="YYYY-MM-DD"
              clearable
              radius="md"
            />

            <DateInput
              label="Date Acquired To"
              placeholder="Select end date"
              value={dateTo}
              onChange={(value) => setDateTo(value ?? "")}
              leftSection={<CalendarDays size={17} />}
              valueFormat="YYYY-MM-DD"
              clearable
              radius="md"
            />
          </Group>

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Showing{" "}
              <Text span fw={600} c="gray.7">
                {filteredEquipments.length}
              </Text>{" "}
              of{" "}
              <Text span fw={600} c="gray.7">
                {equipments.length}
              </Text>{" "}
              equipment
            </Text>

            {hasFilters && (
              <Button variant="subtle" size="xs" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>

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
            miw={1180}
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
                  Equipment
                </Table.Th>

                <Table.Th px="lg" py="sm" w={150}>
                  Date Acquired
                </Table.Th>

                <Table.Th px="lg" py="sm" w={390}>
                  Inventory
                </Table.Th>

                <Table.Th px="lg" py="sm" w={150}>
                  Unit Cost
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
              {filteredEquipments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} py={70}>
                    <Stack align="center" gap="sm">
                      <ThemeIcon
                        size={56}
                        radius="xl"
                        variant="light"
                        color="gray"
                      >
                        <PackageOpen size={27} strokeWidth={1.5} />
                      </ThemeIcon>

                      <Stack align="center" gap={3}>
                        <Text fw={600} size="sm">
                          No equipment found
                        </Text>

                        <Text size="xs" c="dimmed">
                          {hasFilters
                            ? "Try adjusting your filters."
                            : "No equipment records available."}
                        </Text>
                      </Stack>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredEquipments.map((equipment) => {
                  const quantity = getQuantitySummary(equipment);

                  const status = getAssignmentStatus(equipment);

                  /*
                   * Progress represents CURRENT
                   * inventory allocation.
                   *
                   * Returned units are available,
                   * therefore they are not displayed
                   * as a separate occupied segment.
                   */
                  const assignedPercentage =
                    quantity.total > 0
                      ? Math.min(
                          100,
                          (quantity.assigned / quantity.total) * 100,
                        )
                      : 0;

                  const disposedPercentage =
                    quantity.total > 0
                      ? Math.min(
                          100,
                          (quantity.disposed / quantity.total) * 100,
                        )
                      : 0;

                  const availablePercentage =
                    quantity.total > 0
                      ? Math.min(
                          100,
                          (quantity.available / quantity.total) * 100,
                        )
                      : 0;

                  return (
                    <Table.Tr key={equipment.id}>
                      {/* =====================================
                       * EQUIPMENT
                       * ===================================== */}

                      <Table.Td px="xl" py="lg">
                        <Group align="flex-start" wrap="nowrap" gap="md">
                          <ThemeIcon
                            size={54}
                            radius="md"
                            variant="light"
                            color="blue"
                            style={{
                              flexShrink: 0,
                            }}
                          >
                            <PackageOpen size={26} strokeWidth={1.7} />
                          </ThemeIcon>

                          <Stack
                            gap={5}
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <Text fw={700} size="sm" c="dark" truncate>
                              {equipment.equipment_type?.name ?? "Unknown Type"}
                            </Text>

                            <Text size="sm" c="dimmed" lineClamp={1} maw={410}>
                              {equipment.description || "No description"}
                            </Text>

                            <Group gap="xs" wrap="wrap">
                              <Group gap={5} wrap="nowrap">
                                <Tag size={13} strokeWidth={1.8} />

                                <Text size="xs" c="dimmed" fw={500}>
                                  Property No.:
                                </Text>

                                <Text size="xs" c="gray.7" fw={600}>
                                  {equipment.property_number}
                                </Text>
                              </Group>

                              <Text size="xs" c="gray.4">
                                •
                              </Text>

                              <Text size="xs" c="dimmed">
                                Serial:
                              </Text>

                              <Text size="xs" c="gray.7" fw={500}>
                                {equipment.serial_number || "None"}
                              </Text>
                            </Group>
                          </Stack>
                        </Group>
                      </Table.Td>

                      {/* =====================================
                       * DATE ACQUIRED
                       * ===================================== */}

                      <Table.Td px="lg" py="lg">
                        <Text size="sm" fw={500} c="gray.8">
                          {formatDate(equipment.date_acquired)}
                        </Text>
                      </Table.Td>

                      {/* =====================================
                       * INVENTORY
                       * ===================================== */}

                      <Table.Td px="lg" py="lg">
                        <Stack gap="sm">
                          {/* Status + Main Count */}

                          <Group
                            justify="space-between"
                            align="center"
                            wrap="nowrap"
                          >
                            <Badge
                              size="sm"
                              variant="light"
                              color={status.color}
                              radius="xl"
                            >
                              {status.label}
                            </Badge>

                            <Text
                              size="sm"
                              fw={700}
                              c="dark"
                              style={{
                                whiteSpace: "nowrap",
                              }}
                            >
                              {quantity.available}{" "}
                              <Text span c="dimmed" fw={500}>
                                available
                              </Text>
                            </Text>
                          </Group>

                          {/* Inventory Progress */}

                          <Box>
                            <Progress.Root size={8} radius="xl">
                              <Progress.Section
                                value={availablePercentage}
                                color="green"
                              />

                              <Progress.Section
                                value={assignedPercentage}
                                color="orange"
                              />

                              <Progress.Section
                                value={disposedPercentage}
                                color="red"
                              />
                            </Progress.Root>
                          </Box>

                          {/* Quantity Breakdown */}

                          <Group gap="md" wrap="wrap">
                            {/* Available */}

                            <Group gap={6} wrap="nowrap">
                              <Box
                                w={7}
                                h={7}
                                bg="green"
                                style={{
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                }}
                              />

                              <Text size="xs" c="dimmed">
                                Available
                              </Text>

                              <Text size="xs" fw={700}>
                                {quantity.available}
                              </Text>
                            </Group>

                            {/* Assigned */}

                            <Group gap={6} wrap="nowrap">
                              <Box
                                w={7}
                                h={7}
                                bg="orange"
                                style={{
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                }}
                              />

                              <Text size="xs" c="dimmed">
                                Assigned
                              </Text>

                              <Text size="xs" fw={700}>
                                {quantity.assigned}
                              </Text>
                            </Group>

                            {/* Returned */}

                            <Group gap={6} wrap="nowrap">
                              <Box
                                w={7}
                                h={7}
                                bg="blue"
                                style={{
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                }}
                              />

                              <Text size="xs" c="dimmed">
                                Returned
                              </Text>

                              <Text size="xs" fw={700}>
                                {quantity.returned}
                              </Text>
                            </Group>

                            {/* Disposed */}

                            <Group gap={6} wrap="nowrap">
                              <Box
                                w={7}
                                h={7}
                                bg="red"
                                style={{
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                }}
                              />

                              <Text size="xs" c="dimmed">
                                Disposed
                              </Text>

                              <Text size="xs" fw={700}>
                                {quantity.disposed}
                              </Text>
                            </Group>

                            {/* Total */}

                            <Group gap={6} wrap="nowrap">
                              <Box
                                w={7}
                                h={7}
                                bg="gray.4"
                                style={{
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                }}
                              />

                              <Text size="xs" c="dimmed">
                                Total
                              </Text>

                              <Text size="xs" fw={700}>
                                {quantity.total}
                              </Text>
                            </Group>
                          </Group>
                        </Stack>
                      </Table.Td>

                      {/* =====================================
                       * UNIT COST
                       * ===================================== */}

                      <Table.Td px="lg" py="lg">
                        <Text
                          size="sm"
                          fw={700}
                          c="dark"
                          style={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatCurrency(equipment.unit_cost)}
                        </Text>
                      </Table.Td>

                      {/* =====================================
                       * ACTIONS
                       * ===================================== */}

                      <Table.Td px="lg" py="lg">
                        <Group justify="flex-end">
                          <Menu
                            shadow="md"
                            width={170}
                            position="bottom-end"
                            withinPortal
                          >
                            <Menu.Target>
                              <Tooltip label="More actions">
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="md"
                                  radius="md"
                                  aria-label="Equipment actions"
                                >
                                  <MoreVertical size={18} strokeWidth={1.8} />
                                </ActionIcon>
                              </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>
                              {onView && (
                                <Menu.Item
                                  leftSection={<PackageOpen size={16} />}
                                  onClick={() => onView(equipment)}
                                >
                                  View
                                </Menu.Item>
                              )}

                              {onEdit && (
                                <Menu.Item
                                  leftSection={<Edit size={16} />}
                                  onClick={() => onEdit(equipment)}
                                >
                                  Edit
                                </Menu.Item>
                              )}

                              {onAssign && (
                                <Menu.Item
                                  leftSection={<UserPlus size={16} />}
                                  disabled={quantity.available <= 0}
                                  onClick={() => onAssign(equipment)}
                                >
                                  Assign
                                </Menu.Item>
                              )}

                              {onDelete && (
                                <>
                                  <Divider my={4} />

                                  <Menu.Item
                                    color="red"
                                    leftSection={<Trash2 size={16} />}
                                    onClick={() => onDelete(equipment)}
                                  >
                                    Delete
                                  </Menu.Item>
                                </>
                              )}
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

        {filteredEquipments.length > 0 && (
          <>
            <Divider />

            <Group justify="space-between" px="xl" py="sm">
              <Text size="xs" c="dimmed">
                Showing{" "}
                <Text span fw={600} c="gray.7">
                  {filteredEquipments.length}
                </Text>{" "}
                of{" "}
                <Text span fw={600} c="gray.7">
                  {equipments.length}
                </Text>{" "}
                equipment
              </Text>
            </Group>
          </>
        )}
      </Paper>
    </Stack>
  );
}
