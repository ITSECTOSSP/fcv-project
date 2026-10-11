import {
  Button,
  Card,
  Group,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { sectionApi } from "@/lib/api/hr-fcv/section";
import type { EmployeePayload, EmployeeStatus } from "@/types/hr-fcv/employee";
import type { Section } from "@/types/hr-fcv/section";

const employeeStatusOptions = [
  {
    value: "active" as EmployeeStatus,
    label: "Active",
    description: "Currently employed",
    icon: CircleCheck,
  },
  {
    value: "retired" as EmployeeStatus,
    label: "Retired",
    description: "No longer employed",
    icon: CircleX,
  },
  {
    value: "resigned" as EmployeeStatus,
    label: "Resigned",
    description: "Voluntarily left",
    icon: CircleX,
  },
];

export interface EmployeeFormProps {
  initialValues?: EmployeePayload;
  submitLabel?: string;
  submitting?: boolean;
  loading?: boolean;
  onSubmit: (values: EmployeePayload) => Promise<void>;
  onCancel: () => void;
}

export default function EmployeeForm({
  initialValues,
  submitLabel = "Save Employee",
  submitting = false,
  loading = false,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  /*
   * |--------------------------------------------------------------------------
   * | ORGANIZATION DATA
   * |--------------------------------------------------------------------------
   */

  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  /*
   * |--------------------------------------------------------------------------
   * | FORM
   * |--------------------------------------------------------------------------
   */

  const form = useForm<EmployeePayload>({
    initialValues: {
      first_name: initialValues?.first_name ?? "",
      middle_name: initialValues?.middle_name ?? null,
      last_name: initialValues?.last_name ?? "",
      date_birth: initialValues?.date_birth ?? "",
      email: initialValues?.email ?? "",
      contact_number: initialValues?.contact_number ?? "",
      section_id: initialValues?.section_id ?? 0,
      status: initialValues?.status ?? "active",
    },

    validate: {
      first_name: (value) =>
        value.trim().length === 0 ? "First name is required." : null,

      last_name: (value) =>
        value.trim().length === 0 ? "Last name is required." : null,

      date_birth: (value) => (!value ? "Date of birth is required." : null),

      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address.",

      contact_number: (value) =>
        value.trim().length === 0 ? "Contact number is required." : null,

      section_id: (value) => (!value ? "Section is required." : null),

      status: (value) => (!value ? "Status is required." : null),
    },
  });

  /*
   * |--------------------------------------------------------------------------
   * | LOAD SECTIONS
   * |--------------------------------------------------------------------------
   */

  useEffect(() => {
    const loadSections = async () => {
      setLoadingSections(true);

      try {
        const response = await sectionApi.index({
          per_page: 100,
        });

        setSections(response.data.data);
      } catch (error) {
        console.error("Failed to load sections:", error);

        notifications.show({
          title: "Unable to load sections",
          message: "Sections could not be loaded.",
          color: "red",
        });
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
  }, []);

  /*
   * |--------------------------------------------------------------------------
   * | SECTION OPTIONS
   * |--------------------------------------------------------------------------
   */

  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        value: String(section.id),
        label: section.division
          ? `${section.division.name} — ${section.name}`
          : section.name,
      })),
    [sections],
  );

  /*
   * |--------------------------------------------------------------------------
   * | SUBMIT
   * |--------------------------------------------------------------------------
   */

  const handleSubmit = async (values: EmployeePayload) => {
    try {
      const payload: EmployeePayload = {
        first_name: values.first_name.trim(),
        middle_name: values.middle_name?.trim() || null,
        last_name: values.last_name.trim(),
        date_birth: values.date_birth,
        email: values.email.trim(),
        contact_number: values.contact_number.trim(),
        section_id: Number(values.section_id),
        status: values.status as EmployeeStatus,
      };

      await onSubmit(payload);
    } catch (error: any) {
      console.error("Failed to submit employee form:", error);

      /*
       * |--------------------------------------------------------------------------
       * | LARAVEL VALIDATION ERRORS
       * |--------------------------------------------------------------------------
       */

      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        const errors = error.response.data.errors;

        Object.entries(errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages)
            ? messages[0]
            : String(messages);

          form.setFieldError(field, message);
        });

        notifications.show({
          title: "Validation failed",
          message: "Please check the highlighted fields.",
          color: "red",
        });

        return;
      }

      /*
       * |--------------------------------------------------------------------------
       * | GENERAL ERROR
       * |--------------------------------------------------------------------------
       */

      notifications.show({
        title: "Unable to save employee",
        message:
          error?.response?.data?.message ??
          "An unexpected error occurred while saving the employee.",
        color: "red",
      });
    }
  };

  /*
   * |--------------------------------------------------------------------------
   * | SECTION HEADER
   * |--------------------------------------------------------------------------
   */

  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) => (
    <Group gap="xs" mb="sm">
      {icon}

      <Text size="sm" fw={600}>
        {title}
      </Text>
    </Group>
  );

  /*
   * |--------------------------------------------------------------------------
   * | FORM SKELETON
   * |--------------------------------------------------------------------------
   */

  if (loading) {
    return (
      <Stack gap="sm">
        {/* PERSONAL & CONTACT INFORMATION */}
        <Card withBorder radius="md" padding="md">
          <Group gap="xs" mb="sm">
            <Skeleton height={17} width={17} radius="sm" />

            <Skeleton height={14} width={190} radius="sm" />
          </Group>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              gap: "var(--mantine-spacing-sm)",
            }}
          >
            {/* FIRST NAME */}
            <div
              style={{
                gridColumn: "span 4",
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={75} radius="sm" />

                <Skeleton height={36} radius="sm" />
              </Stack>
            </div>

            {/* MIDDLE NAME */}
            <div
              style={{
                gridColumn: "span 4",
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={85} radius="sm" />

                <Skeleton height={36} radius="sm" />
              </Stack>
            </div>

            {/* LAST NAME */}
            <div
              style={{
                gridColumn: "span 4",
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={70} radius="sm" />

                <Skeleton height={36} radius="sm" />
              </Stack>
            </div>

            {/* DATE OF BIRTH */}
            <div
              style={{
                gridColumn: "span 4",
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={90} radius="sm" />

                <Skeleton height={36} radius="sm" />
              </Stack>
            </div>

            {/* EMAIL */}
            <div
              style={{
                gridColumn: "span 4",
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={105} radius="sm" />

                <Skeleton height={36} radius="sm" />
              </Stack>
            </div>

            {/* CONTACT NUMBER */}
            <div
              style={{
                gridColumn: "span 4",
              }}
            >
              <Stack gap={6}>
                <Skeleton height={14} width={105} radius="sm" />

                <Skeleton height={36} radius="sm" />
              </Stack>
            </div>
          </div>
        </Card>

        {/* EMPLOYMENT INFORMATION */}
        <Card withBorder radius="md" padding="md">
          <Group gap="xs" mb="sm">
            <Skeleton height={17} width={17} radius="sm" />

            <Skeleton height={14} width={150} radius="sm" />
          </Group>

          <Stack gap="md">
            {/* SECTION */}
            <Stack gap={6}>
              <Skeleton height={14} width={55} radius="sm" />

              <Skeleton height={36} radius="sm" />

              <Skeleton height={12} width={240} radius="sm" />
            </Stack>

            {/* STATUS */}
            <Stack gap={6}>
              <Skeleton height={14} width={115} radius="sm" />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "var(--mantine-spacing-sm)",
                }}
              >
                <Skeleton height={58} radius="sm" />

                <Skeleton height={58} radius="sm" />

                <Skeleton height={58} radius="sm" />
              </div>
            </Stack>
          </Stack>
        </Card>

        {/* ACTIONS */}
        <Group justify="flex-end" gap="xs" pt="xs">
          <Skeleton height={36} width={75} radius="sm" />

          <Skeleton height={36} width={130} radius="sm" />
        </Group>
      </Stack>
    );
  }

  /*
   * |--------------------------------------------------------------------------
   * | RENDER
   * |--------------------------------------------------------------------------
   */

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm">
        {/* PERSONAL & CONTACT INFORMATION */}
        <Card withBorder radius="md" padding="md">
          <SectionHeader
            icon={<User size={17} />}
            title="Personal & Contact Information"
          />

          <Stack gap="sm">
            {/* NAME + DATE OF BIRTH */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                gap: "var(--mantine-spacing-sm)",
              }}
            >
              {/* FIRST NAME */}
              <div
                style={{
                  gridColumn: "span 4",
                }}
              >
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  withAsterisk
                  leftSection={<User size={16} />}
                  disabled={submitting}
                  {...form.getInputProps("first_name")}
                />
              </div>

              {/* MIDDLE NAME */}
              <div
                style={{
                  gridColumn: "span 4",
                }}
              >
                <TextInput
                  label="Middle Name"
                  placeholder="Enter middle name"
                  disabled={submitting}
                  {...form.getInputProps("middle_name")}
                />
              </div>

              {/* LAST NAME */}
              <div
                style={{
                  gridColumn: "span 4",
                }}
              >
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  withAsterisk
                  disabled={submitting}
                  {...form.getInputProps("last_name")}
                />
              </div>

              {/* DATE OF BIRTH */}
              <div
                style={{
                  gridColumn: "span 4",
                }}
              >
                <DateInput
                  label="Date of Birth"
                  placeholder="Select date of birth"
                  withAsterisk
                  leftSection={<CalendarDays size={16} />}
                  value={form.values.date_birth || null}
                  onChange={(value) =>
                    form.setFieldValue("date_birth", value ?? "")
                  }
                  valueFormat="YYYY-MM-DD"
                  disabled={submitting}
                  error={form.errors.date_birth}
                />
              </div>

              {/* EMAIL */}
              <div
                style={{
                  gridColumn: "span 4",
                }}
              >
                <TextInput
                  label="Email Address"
                  placeholder="employee@example.com"
                  type="email"
                  withAsterisk
                  leftSection={<Mail size={16} />}
                  disabled={submitting}
                  {...form.getInputProps("email")}
                />
              </div>

              {/* CONTACT NUMBER */}
              <div
                style={{
                  gridColumn: "span 4",
                }}
              >
                <TextInput
                  label="Contact Number"
                  placeholder="Enter contact number"
                  withAsterisk
                  leftSection={<Phone size={16} />}
                  disabled={submitting}
                  {...form.getInputProps("contact_number")}
                />
              </div>
            </div>
          </Stack>
        </Card>

        {/* EMPLOYMENT INFORMATION */}
        <Card withBorder radius="md" padding="md">
          <SectionHeader
            icon={<BriefcaseBusiness size={17} />}
            title="Employment Information"
          />

          <Stack gap="md">
            {/* SECTION */}
            <Select
              label="Section"
              placeholder={
                loadingSections ? "Loading sections..." : "Select section"
              }
              description="Select the employee's assigned section."
              data={sectionOptions}
              searchable
              clearable
              withAsterisk
              disabled={loadingSections || submitting}
              value={
                form.values.section_id ? String(form.values.section_id) : null
              }
              onChange={(value) => {
                form.setFieldValue("section_id", value ? Number(value) : 0);

                form.clearFieldError("section_id");
              }}
              error={form.errors.section_id}
            />

            {/* EMPLOYMENT STATUS */}
            <div>
              <Text size="sm" fw={500} mb={6}>
                Employment Status{" "}
                <Text component="span" c="red">
                  *
                </Text>
              </Text>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "var(--mantine-spacing-sm)",
                }}
              >
                {employeeStatusOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = form.values.status === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        form.setFieldValue("status", option.value);

                        form.clearFieldError("status");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        minHeight: "52px",
                        padding: "8px 10px",
                        borderRadius: "var(--mantine-radius-sm)",
                        border: `1px solid ${
                          selected ? "#C9A227" : "var(--mantine-color-gray-3)"
                        }`,
                        backgroundColor: selected
                          ? "rgba(201, 162, 39, 0.08)"
                          : "var(--mantine-color-white)",
                        color: selected
                          ? "#8A6D0A"
                          : "var(--mantine-color-gray-7)",
                        cursor: submitting ? "not-allowed" : "pointer",
                        textAlign: "left",
                        transition:
                          "border-color 120ms ease, background-color 120ms ease",
                      }}
                    >
                      {/* ICON */}
                      <Icon
                        size={17}
                        style={{
                          flexShrink: 0,
                          color: selected
                            ? "#C9A227"
                            : "var(--mantine-color-gray-6)",
                        }}
                      />

                      {/* LABEL */}
                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Text
                          size="sm"
                          fw={600}
                          c={selected ? undefined : "dark"}
                        >
                          {option.label}
                        </Text>

                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {option.description}
                        </Text>
                      </div>

                      {/* SELECTED */}
                      {selected && (
                        <Check
                          size={16}
                          strokeWidth={2.5}
                          style={{
                            flexShrink: 0,
                            color: "#C9A227",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {form.errors.status && (
                <Text size="xs" c="red" mt={4}>
                  {form.errors.status}
                </Text>
              )}
            </div>
          </Stack>
        </Card>

        {/* ACTIONS */}
        <Group justify="flex-end" gap="xs" pt="xs">
          <Button
            type="button"
            variant="default"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            leftSection={<Save size={16} />}
            loading={submitting}
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
