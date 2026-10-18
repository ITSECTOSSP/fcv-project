import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";

import { DateInput } from "@mantine/dates";

import {
  AlertCircle,
  CalendarDays,
  Check,
  Hash,
  Package,
  User,
  UserRoundCog,
} from "lucide-react";

import { createEquipmentAssignment } from "@/lib/api/inv-fcv/equipment-assignment";
import { createEquipmentAssignmentAttachment } from "@/lib/api/inv-fcv/equipment-attachment";
import { employeeApi } from "@/lib/api/hr-fcv/employee";

import AttachmentUpload, {
  type AttachmentFormValue,
} from "@/components/service/inv-fcv/equipment/equipment-attachment-form";

import type { Equipment } from "@/types/inv-fcv/equipment";
import type { AttachmentType } from "@/types/inv-fcv/attachment-type";
import type { Employee } from "@/types/hr-fcv/employee";

type EquipmentAssignmentFormValue = {
  property_number: string;
  serial_number: string;
  quantity: number;
  assigned_at: string;
  user_employee_id: string;
  is_care_of: boolean;
  care_of_employee_id: string;
  remarks: string;
};

interface EquipmentAssignmentFormProps {
  equipment: Equipment;
  attachmentTypes: AttachmentType[];
  loadingAttachmentTypes?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const getLocalDateString = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getEmployeeName = (employee: Employee) =>
  [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ");

export default function EquipmentAssignmentForm({
  equipment,
  attachmentTypes,
  loadingAttachmentTypes = false,
  onSuccess,
  onCancel,
}: EquipmentAssignmentFormProps) {
  const availableQuantity = equipment.available_quantity ?? 0;

  const emptyAssignment = (): EquipmentAssignmentFormValue => ({
    property_number: equipment.property_number ?? "",
    serial_number: equipment.serial_number ?? "",
    quantity: availableQuantity > 0 ? availableQuantity : 1,
    assigned_at: getLocalDateString(),
    user_employee_id: "",
    is_care_of: false,
    care_of_employee_id: "",
    remarks: "",
  });

  const [assignment, setAssignment] =
    useState<EquipmentAssignmentFormValue>(emptyAssignment());

  const [attachments, setAttachments] = useState<AttachmentFormValue[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setEmployeeError(null);

      try {
        const response = await employeeApi.index({
          per_page: 100,
          status: "active",
        });

        if (cancelled) return;

        // Laravel paginator returns employees inside response.data.data.
        setEmployees(response.data.data);
      } catch (err: any) {
        if (cancelled) return;

        console.error("Failed to fetch HR employees:", err);

        setEmployeeError(
          err?.response?.data?.message ??
            "Unable to load employees from HR. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      }
    };

    void fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: getEmployeeName(employee),
  }));

  const handleUpdateAssignment = <
    K extends keyof EquipmentAssignmentFormValue,
  >(
    field: K,
    value: EquipmentAssignmentFormValue[K],
  ) => {
    setAssignment((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setError(null);

    if (loadingEmployees) {
      setError("Please wait until the employee list has finished loading.");
      return;
    }

    if (employeeError) {
      setError("Unable to load employees. Please retry before assigning equipment.");
      return;
    }

    if (!assignment.property_number.trim()) {
      setError("Property number is required.");
      return;
    }

    if (!assignment.user_employee_id) {
      setError("Please select a user employee.");
      return;
    }

    if (!assignment.assigned_at) {
      setError("Assignment date is required.");
      return;
    }

    if (assignment.quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (assignment.quantity > availableQuantity) {
      setError(
        `The assignment quantity cannot exceed the available quantity of ${availableQuantity}.`,
      );
      return;
    }

    if (
      assignment.is_care_of &&
      !assignment.care_of_employee_id
    ) {
      setError("Please select a care-of employee when Care Of is enabled.");
      return;
    }

    for (const attachment of attachments) {
      if (!attachment.attachment_type_id) {
        setError("Please select an attachment type for all new attachments.");
        return;
      }

      if (!attachment.name.trim()) {
        setError("Please enter a name for all new attachments.");
        return;
      }

      if (!attachment.file) {
        setError("Please select a file for all new attachments.");
        return;
      }
    }

    try {
      setSubmitting(true);

      // STEP 1: Create the equipment assignment.
      const createdAssignment = await createEquipmentAssignment({
        equipment_id: equipment.id,
        property_number: assignment.property_number.trim(),
        serial_number: assignment.serial_number.trim() || null,
        is_care_of: assignment.is_care_of,
        care_of_employee_id: assignment.is_care_of
          ? assignment.care_of_employee_id
          : null,
        user_employee_id: assignment.user_employee_id,
        quantity: assignment.quantity,
        assigned_at: assignment.assigned_at,
        remarks: assignment.remarks.trim() || null,
      });

      // STEP 2: Upload attachments after the assignment exists.
      for (const attachment of attachments) {
        if (!attachment.file) continue;

        await createEquipmentAssignmentAttachment({
          equipment_id: equipment.id,
          equipment_assignment_id: createdAssignment.id,
          attachment_type_id: attachment.attachment_type_id,
          name: attachment.name.trim(),
          file: attachment.file,
          description: attachment.description.trim() || null,
        });
      }

      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to create equipment assignment:", err);

      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)
          .flat()
          .find(
            (message): message is string =>
              typeof message === "string",
          );

        setError(firstError ?? "Unable to create the equipment assignment.");
      } else {
        setError(
          err?.response?.data?.message ??
            "Unable to create the equipment assignment.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="lg">
      {error && (
        <Alert
          color="red"
          icon={<AlertCircle size={18} />}
          title="Unable to assign equipment"
        >
          {error}
        </Alert>
      )}

      {employeeError && (
        <Alert
          color="red"
          icon={<AlertCircle size={18} />}
          title="Employee list unavailable"
        >
          <Stack gap="xs">
            <Text size="sm">{employeeError}</Text>

            <Group>
              <Button
                size="xs"
                variant="light"
                color="red"
                onClick={async () => {
                  setLoadingEmployees(true);
                  setEmployeeError(null);

                  try {
                    const response = await employeeApi.index({
                      per_page: 100,
                      status: "active",
                    });

                    setEmployees(response.data.data);
                  } catch (err: any) {
                    setEmployeeError(
                      err?.response?.data?.message ??
                        "Unable to load employees from HR. Please try again.",
                    );
                  } finally {
                    setLoadingEmployees(false);
                  }
                }}
                disabled={loadingEmployees || submitting}
              >
                Retry
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      {/* ASSIGNMENT DETAILS */}
      <Paper withBorder p="lg" radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm" align="flex-start">
              <ThemeIcon variant="light" size={40} radius="md">
                <UserRoundCog size={20} />
              </ThemeIcon>

              <Stack gap={2}>
                <Group gap="xs">
                  <Text fw={600}>Assignment Details</Text>

                  <Badge size="sm" variant="light" radius="sm">
                    New
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed">
                  Assign this equipment to an employee. The property and serial
                  numbers are recorded as assignment snapshots.
                </Text>
              </Stack>
            </Group>

            <Badge
              variant="light"
              color={availableQuantity > 0 ? "green" : "red"}
            >
              {availableQuantity} units available
            </Badge>
          </Group>

          <Divider />

          <Stack gap="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Equipment Assignment Information
            </Text>

            <Group grow align="flex-start">
              <TextInput
                label="Property Number"
                placeholder="Enter property number"
                leftSection={<Hash size={17} />}
                value={assignment.property_number}
                onChange={(event) =>
                  handleUpdateAssignment(
                    "property_number",
                    event.currentTarget.value,
                  )
                }
                disabled={submitting}
                required
              />

              <TextInput
                label="Serial Number"
                placeholder="Enter serial number"
                leftSection={<Package size={17} />}
                value={assignment.serial_number}
                onChange={(event) =>
                  handleUpdateAssignment(
                    "serial_number",
                    event.currentTarget.value,
                  )
                }
                disabled={submitting}
              />
            </Group>

            <Group grow align="flex-start">
              <NumberInput
                label="Quantity"
                placeholder="Enter quantity"
                min={1}
                max={availableQuantity}
                value={assignment.quantity}
                onChange={(value) =>
                  handleUpdateAssignment(
                    "quantity",
                    typeof value === "number" ? value : 0,
                  )
                }
                disabled={submitting || availableQuantity <= 0}
                required
              />

              <DateInput
                label="Assignment Date"
                placeholder="Select assignment date"
                value={assignment.assigned_at}
                onChange={(value) =>
                  handleUpdateAssignment("assigned_at", value ?? "")
                }
                leftSection={<CalendarDays size={17} />}
                disabled={submitting}
                required
              />
            </Group>
          </Stack>

          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Assignment Status
            </Text>

            <Badge
              color="green"
              variant="light"
              leftSection={<Check size={14} />}
            >
              Active
            </Badge>
          </div>

          {/* EMPLOYEE SELECTION */}
          <Stack gap="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Employee
            </Text>

            <Select
              label="User Employee"
              placeholder={
                loadingEmployees
                  ? "Loading employees..."
                  : employeeError
                    ? "Employee list unavailable"
                    : "Select an employee"
              }
              leftSection={<User size={17} />}
              data={employeeOptions}
              value={assignment.user_employee_id || null}
              onChange={(value) =>
                handleUpdateAssignment("user_employee_id", value ?? "")
              }
              searchable
              clearable
              nothingFoundMessage="No employees found"
              disabled={submitting || loadingEmployees || !!employeeError}
              required
            />

            <Switch
              label="Care Of"
              description="The equipment is assigned under the care of another employee."
              checked={assignment.is_care_of}
              onChange={(event) => {
                const enabled = event.currentTarget.checked;

                setAssignment((current) => ({
                  ...current,
                  is_care_of: enabled,
                  care_of_employee_id: enabled
                    ? current.care_of_employee_id
                    : "",
                }));
              }}
              disabled={submitting}
            />

            {assignment.is_care_of && (
              <Select
                label="Care-of Employee"
                placeholder={
                  loadingEmployees
                    ? "Loading employees..."
                    : employeeError
                      ? "Employee list unavailable"
                      : "Select the care-of employee"
                }
                data={employeeOptions}
                value={assignment.care_of_employee_id || null}
                onChange={(value) =>
                  handleUpdateAssignment(
                    "care_of_employee_id",
                    value ?? "",
                  )
                }
                searchable
                clearable
                nothingFoundMessage="No employees found"
                disabled={
                  submitting ||
                  loadingEmployees ||
                  !!employeeError
                }
                required
              />
            )}
          </Stack>

          <Stack gap="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Additional Information
            </Text>

            <Textarea
              label="Remarks"
              placeholder="Enter remarks"
              minRows={4}
              autosize
              maxRows={6}
              value={assignment.remarks}
              onChange={(event) =>
                handleUpdateAssignment("remarks", event.currentTarget.value)
              }
              disabled={submitting}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* ATTACHMENTS */}
      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          <div>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
              Attachments
            </Text>

            <Text size="sm" c="dimmed">
              Add documents, photos, receipts, property documents, warranties,
              or other files associated with this equipment assignment.
            </Text>
          </div>

          <AttachmentUpload
            value={attachments}
            attachmentTypes={attachmentTypes}
            loadingAttachmentTypes={loadingAttachmentTypes}
            disabled={submitting}
            contextLabel="equipment assignment"
            onChange={setAttachments}
          />
        </Stack>
      </Paper>

      {/* ACTIONS */}
      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          leftSection={!submitting ? <Check size={17} /> : undefined}
          onClick={handleSubmit}
          loading={submitting}
          disabled={
            submitting ||
            availableQuantity <= 0 ||
            loadingEmployees ||
            !!employeeError
          }
        >
          {submitting ? "Assigning..." : "Assign Equipment"}
        </Button>
      </Group>
    </Stack>
  );
}