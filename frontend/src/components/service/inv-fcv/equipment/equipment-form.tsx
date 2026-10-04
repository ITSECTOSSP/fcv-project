import {
  Button,
  Card,
  Divider,
  Grid,
  Group,
  NumberInput,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";

import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";

import { Save, CalendarDays } from "lucide-react";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";
import type { EquipmentAttachment } from "@/types/inv-fcv/equipment";
import type { EquipmentType } from "@/types/inv-fcv/equipment-types";

import EquipmentAttachmentUpload, {
  type EquipmentAttachmentFormValue,
} from "./equipment-attachment-form";

/* =====================================================
 * CONSTANTS
 * ===================================================== */

const MAX_ATTACHMENT_FILE_SIZE = 20 * 1024 * 1024;

/* =====================================================
 * TYPES
 * ===================================================== */

export type EquipmentFormValues = {
  equipment_type_id: string;
  date_acquired: string;
  quantity: number;
  property_number: string;
  serial_number: string;
  description: string;
  unit_cost: number;
  attachments: EquipmentAttachmentFormValue[];
};

type ExistingAttachmentEditValue = {
  attachment_type_id: string;
  name: string;
  description: string;
  file: File | null;
};

type EquipmentFormProps = {
  equipmentTypes: EquipmentType[];
  attachmentTypes?: AttachmentType[];
  existingAttachments?: EquipmentAttachment[];

  loadingTypes?: boolean;
  loadingAttachmentTypes?: boolean;
  loading?: boolean;
  submitting?: boolean;
  error?: string | null;

  initialValues?: Partial<EquipmentFormValues>;

  assignedQuantity?: number;
  availableQuantity?: number;

  submitLabel?: string;

  onSubmit: (values: EquipmentFormValues) => void | Promise<void>;

  onCancel: () => void;

  onUpdateExistingAttachment?: (
    attachmentId: string,
    values: ExistingAttachmentEditValue,
  ) => Promise<void>;

  onDeleteExistingAttachment?: (attachmentId: string) => Promise<void>;
};

/* =====================================================
 * DATE HELPERS
 * ===================================================== */

const stringToDate = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const dateToString = (value: Date | null): string => {
  if (!value) {
    return "";
  }

  const year = value.getFullYear();

  const month = String(value.getMonth() + 1).padStart(2, "0");

  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =====================================================
 * SKELETON
 * ===================================================== */

function EquipmentFormSkeleton() {
  return (
    <Card withBorder radius="md" padding={0} shadow="sm">
      <Stack gap={0}>
        <Stack gap={8} p="lg">
          <Skeleton height={20} width={180} />
          <Skeleton height={14} width="45%" />
        </Stack>

        <Divider />

        <Stack gap="lg" p="lg">
          <Grid
            style={{
              gap: "var(--mantine-spacing-lg)",
            }}
          >
            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={110} />
                <Skeleton height={36} radius="sm" />
                <Skeleton height={12} width="80%" />
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={100} />
                <Skeleton height={36} radius="sm" />
                <Skeleton height={12} width="75%" />
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={125} />
                <Skeleton height={36} radius="sm" />
                <Skeleton height={12} width="90%" />
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={100} />
                <Skeleton height={36} radius="sm" />
                <Skeleton height={12} width="80%" />
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={70} />
                <Skeleton height={36} radius="sm" />
                <Skeleton height={12} width="75%" />
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Stack gap="xs">
                <Skeleton height={14} width={80} />
                <Skeleton height={36} radius="sm" />

                <Group gap="xs">
                  <Skeleton height={24} width={50} radius="sm" />
                  <Skeleton height={24} width={60} radius="sm" />
                  <Skeleton height={24} width={65} radius="sm" />
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 6,
              }}
            >
              <Group grow>
                <Stack gap={6}>
                  <Skeleton height={14} width={110} />
                  <Skeleton height={36} radius="sm" />
                </Stack>

                <Stack gap={6}>
                  <Skeleton height={14} width={110} />
                  <Skeleton height={36} radius="sm" />
                </Stack>
              </Group>
            </Grid.Col>
          </Grid>

          <Stack gap={6}>
            <Skeleton height={14} width={90} />
            <Skeleton height={120} radius="sm" />
            <Skeleton height={12} width="70%" />
          </Stack>
        </Stack>

        <Divider />

        <Stack gap="lg" p="lg">
          <Stack gap={6}>
            <Skeleton height={18} width={110} />
            <Skeleton height={14} width="45%" />
          </Stack>

          <Card withBorder radius="md" padding="lg">
            <Grid
              style={{
                gap: "var(--mantine-spacing-md)",
              }}
            >
              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <Stack gap={6}>
                  <Skeleton height={14} width={120} />
                  <Skeleton height={36} radius="sm" />
                </Stack>
              </Grid.Col>

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <Stack gap={6}>
                  <Skeleton height={14} width={70} />
                  <Skeleton height={36} radius="sm" />
                </Stack>
              </Grid.Col>

              <Grid.Col span={12}>
                <Stack gap={6}>
                  <Skeleton height={14} width={60} />
                  <Skeleton height={36} radius="sm" />
                </Stack>
              </Grid.Col>

              <Grid.Col span={12}>
                <Stack gap={6}>
                  <Skeleton height={14} width={90} />
                  <Skeleton height={70} radius="sm" />
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Stack>

        <Divider />

        <Group justify="flex-end" p="lg">
          <Skeleton height={36} width={80} radius="sm" />

          <Skeleton height={36} width={140} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}

/* =====================================================
 * EQUIPMENT FORM
 * ===================================================== */

export default function EquipmentForm({
  equipmentTypes,
  attachmentTypes = [],
  existingAttachments = [],
  loadingTypes = false,
  loadingAttachmentTypes = false,
  loading = false,
  submitting = false,
  error = null,
  initialValues,
  assignedQuantity,
  availableQuantity,
  submitLabel = "Save Equipment",
  onSubmit,
  onCancel,
  onUpdateExistingAttachment,
  onDeleteExistingAttachment,
}: EquipmentFormProps) {
  /* =====================================================
   * OPTIONS
   * ===================================================== */

  const equipmentTypeOptions = equipmentTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  /* =====================================================
   * FORM
   * ===================================================== */

  const form = useForm<EquipmentFormValues>({
    mode: "controlled",

    initialValues: {
      equipment_type_id: initialValues?.equipment_type_id ?? "",

      date_acquired: initialValues?.date_acquired ?? "",

      quantity: initialValues?.quantity ?? 1,

      property_number: initialValues?.property_number ?? "",

      serial_number: initialValues?.serial_number ?? "",

      description: initialValues?.description ?? "",

      unit_cost: initialValues?.unit_cost ?? 0,

      attachments: initialValues?.attachments ?? [],
    },

    validate: {
      equipment_type_id: (value) =>
        value ? null : "Equipment type is required.",

      date_acquired: (value) => (value ? null : "Date acquired is required."),

      quantity: (value) => (value >= 1 ? null : "Quantity must be at least 1."),

      property_number: (value) =>
        value.trim() ? null : "Property number is required.",

      serial_number: () => null,

      description: (value) =>
        value.trim() ? null : "Description is required.",

      unit_cost: (value) =>
        value >= 0 ? null : "Unit cost cannot be negative.",

      attachments: {
        attachment_type_id: (value) =>
          value ? null : "Attachment type is required.",

        name: (value) => {
          if (!value.trim()) {
            return "Attachment name is required.";
          }

          if (value.trim().length > 255) {
            return "Attachment name cannot exceed 255 characters.";
          }

          return null;
        },

        file: (value) => {
          if (!value) {
            return "File is required.";
          }

          if (value.size > MAX_ATTACHMENT_FILE_SIZE) {
            return "File size cannot exceed 20 MB.";
          }

          return null;
        },
      },
    },
  });

  /* =====================================================
   * LOADING
   * ===================================================== */

  if (loading) {
    return <EquipmentFormSkeleton />;
  }

  /* =====================================================
   * SUBMIT
   * ===================================================== */

  const handleSubmit = async (values: EquipmentFormValues) => {
    await onSubmit(values);
  };

  /* =====================================================
   * RENDER
   * ===================================================== */

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Card withBorder radius="md" padding={0} shadow="sm">
        <Stack gap={0}>
          {/* HEADER */}

          <Stack gap={8} p="lg">
            <Text fw={600} size="md">
              Equipment Information
            </Text>

            <Text size="sm" c="dimmed">
              Provide the details of the equipment.
            </Text>
          </Stack>

          <Divider />

          {/* ERROR */}

          {error && (
            <>
              <Stack p="lg">
                <Text size="sm" c="red">
                  {error}
                </Text>
              </Stack>

              <Divider />
            </>
          )}

          {/* EQUIPMENT DETAILS */}

          <Stack gap="lg" p="lg">
            <Grid
              style={{
                gap: "var(--mantine-spacing-lg)",
              }}
            >
              {/* EQUIPMENT TYPE */}

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <Select
                  label="Equipment Type"
                  description="Type or category of the equipment."
                  placeholder={
                    loadingTypes
                      ? "Loading equipment types..."
                      : "Select equipment type"
                  }
                  data={equipmentTypeOptions}
                  searchable
                  withAsterisk
                  disabled={loadingTypes || submitting}
                  {...form.getInputProps("equipment_type_id")}
                />
              </Grid.Col>

              {/* DATE ACQUIRED */}

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <DateInput
                  label="Date Acquired"
                  placeholder="Select date acquired"
                  description="Date when the equipment was acquired."
                  value={form.values.date_acquired}
                  onChange={(value) =>
                    form.setFieldValue("date_acquired", value ?? "")
                  }
                  withAsterisk
                  disabled={submitting}
                  error={form.errors.date_acquired}
                  leftSection={<CalendarDays size={17} />}
                  valueFormat="YYYY-MM-DD"
                />
              </Grid.Col>

              {/* PROPERTY NUMBER */}

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <TextInput
                  label="Property Number"
                  placeholder="Enter property number"
                  description="Official property number assigned to the equipment."
                  withAsterisk
                  disabled={submitting}
                  {...form.getInputProps("property_number")}
                />
              </Grid.Col>

              {/* SERIAL NUMBER */}

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <TextInput
                  label="Serial Number"
                  placeholder="Enter serial number"
                  description="Leave blank if the equipment has no serial number."
                  disabled={submitting}
                  {...form.getInputProps("serial_number")}
                />
              </Grid.Col>

              {/* QUANTITY */}

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <NumberInput
                  label="Quantity"
                  placeholder="Enter quantity"
                  description={
                    assignedQuantity !== undefined
                      ? "Quantity currently assigned cannot be removed."
                      : "Total number of units acquired."
                  }
                  min={1}
                  allowDecimal={false}
                  allowNegative={false}
                  withAsterisk
                  disabled={submitting}
                  {...form.getInputProps("quantity")}
                />
              </Grid.Col>

              {/* UNIT COST */}

              <Grid.Col
                span={{
                  base: 12,
                  sm: 6,
                }}
              >
                <Stack gap="xs">
                  <NumberInput
                    label="Unit Cost"
                    placeholder="Enter unit cost"
                    description="Cost of the equipment per unit."
                    prefix="₱ "
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator=","
                    withAsterisk
                    disabled={submitting}
                    {...form.getInputProps("unit_cost")}
                  />

                  <Group gap="xs">
                    <Button
                      type="button"
                      size="xs"
                      variant="light"
                      disabled={submitting}
                      onClick={() =>
                        form.setFieldValue(
                          "unit_cost",
                          Number(form.values.unit_cost) + 100,
                        )
                      }
                    >
                      +₱100
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="light"
                      disabled={submitting}
                      onClick={() =>
                        form.setFieldValue(
                          "unit_cost",
                          Number(form.values.unit_cost) + 1000,
                        )
                      }
                    >
                      +₱1,000
                    </Button>

                    <Button
                      type="button"
                      size="xs"
                      variant="light"
                      disabled={submitting}
                      onClick={() =>
                        form.setFieldValue(
                          "unit_cost",
                          Number(form.values.unit_cost) + 10000,
                        )
                      }
                    >
                      +₱10,000
                    </Button>
                  </Group>
                </Stack>
              </Grid.Col>

              {/* ASSIGNED QUANTITY */}

              {assignedQuantity !== undefined && (
                <Grid.Col
                  span={{
                    base: 12,
                    sm: 3,
                  }}
                >
                  <NumberInput
                    label="Assigned Quantity"
                    value={assignedQuantity}
                    readOnly
                    hideControls
                  />
                </Grid.Col>
              )}

              {/* AVAILABLE QUANTITY */}

              {availableQuantity !== undefined && (
                <Grid.Col
                  span={{
                    base: 12,
                    sm: 3,
                  }}
                >
                  <NumberInput
                    label="Available Quantity"
                    value={availableQuantity}
                    readOnly
                    hideControls
                  />
                </Grid.Col>
              )}
            </Grid>

            {/* DESCRIPTION */}

            <Textarea
              label="Description"
              placeholder="Enter equipment description"
              description="Provide a brief description of the equipment."
              minRows={5}
              autosize
              maxRows={10}
              withAsterisk
              disabled={submitting}
              {...form.getInputProps("description")}
            />
          </Stack>

          <Divider />

          {/* ATTACHMENTS */}

          <Stack gap="lg" p="lg">
            <EquipmentAttachmentUpload
              value={form.values.attachments}
              existingAttachments={existingAttachments}
              attachmentTypes={attachmentTypes}
              loadingAttachmentTypes={loadingAttachmentTypes}
              disabled={submitting}
              onChange={(attachments) =>
                form.setFieldValue("attachments", attachments)
              }
              onUpdateExistingAttachment={onUpdateExistingAttachment}
              onDeleteExistingAttachment={onDeleteExistingAttachment}
            />

            {form.errors.attachments && (
              <Text size="sm" c="red">
                {form.errors.attachments}
              </Text>
            )}
          </Stack>

          <Divider />

          {/* ACTIONS */}

          <Group justify="flex-end" p="lg">
            <Button
              type="button"
              variant="default"
              disabled={submitting}
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              leftSection={!submitting ? <Save size={17} /> : undefined}
              loading={submitting}
              disabled={loadingTypes || loadingAttachmentTypes || submitting}
            >
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </Card>
    </form>
  );
}
