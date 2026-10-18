import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";

import { DateInput } from "@mantine/dates";

import {
  AlertCircle,
  ArrowLeftRight,
  CalendarDays,
  Paperclip,
  UserRoundCog,
} from "lucide-react";

import { employeeApi } from "@/lib/api/hr-fcv/employee";
import { transferEquipment } from "@/lib/api/inv-fcv/equipment-assignment";
import { createEquipmentAssignmentAttachment } from "@/lib/api/inv-fcv/equipment-attachment";

import AttachmentUpload, {
  type AttachmentFormValue,
} from "@/components/service/inv-fcv/equipment/equipment-attachment-form";

import type { Employee } from "@/types/hr-fcv/employee";
import type { Equipment } from "@/types/inv-fcv/equipment";
import type { EquipmentAssignment } from "@/types/inv-fcv/equipment-assignment";
import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

interface EquipmentTransferModalProps {
  opened: boolean;
  equipment: Equipment;
  assignment: EquipmentAssignment;

  attachmentTypes: AttachmentType[];
  loadingAttachmentTypes?: boolean;

  onSuccess: () => void | Promise<void>;
  onClose: () => void;
}

const getLocalDateString = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });
};

export default function EquipmentTransferModal({
  opened,
  equipment,
  assignment,
  attachmentTypes,
  loadingAttachmentTypes = false,
  onSuccess,
  onClose,
}: EquipmentTransferModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const [userEmployeeId, setUserEmployeeId] = useState("");

  const [isCareOf, setIsCareOf] = useState(assignment.is_care_of);

  const [careOfEmployeeId, setCareOfEmployeeId] = useState(
    assignment.care_of_employee_id ?? "",
  );

  const [transferredAt, setTransferredAt] = useState(getLocalDateString());
  const [remarks, setRemarks] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFormValue[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      setEmployeeError(null);

      const response = await employeeApi.index({
        per_page: 100,
        status: "active",
      });

      setEmployees(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch employees:", error);

      setEmployeeError(
        error?.response?.data?.message ??
          "Unable to load employees. Please try again.",
      );
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    if (opened) {
      void fetchEmployees();
    }
  }, [opened, fetchEmployees]);

  useEffect(() => {
    if (opened) {
      setIsCareOf(assignment.is_care_of);
      setCareOfEmployeeId(assignment.care_of_employee_id ?? "");
    }
  }, [
    opened,
    assignment.id,
    assignment.is_care_of,
    assignment.care_of_employee_id,
  ]);

  const employeeOptions = employees.map((employee) => {
    const fullName = [
      employee.first_name,
      employee.middle_name,
      employee.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      value: employee.id,
      label: fullName || employee.email || employee.id,
    };
  });

  const newAssigneeOptions = employeeOptions.filter(
    (employee) => employee.value !== assignment.user_employee_id,
  );

  const getFieldError = (field: string) => {
    return validationErrors[field]?.[0];
  };

  const resetForm = () => {
    setUserEmployeeId("");
    setIsCareOf(assignment.is_care_of);
    setCareOfEmployeeId(assignment.care_of_employee_id ?? "");
    setTransferredAt(getLocalDateString());
    setRemarks("");
    setAttachments([]);
    setError(null);
    setValidationErrors({});
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    setError(null);
    setValidationErrors({});

    if (!userEmployeeId.trim()) {
      setError("Please select the new assignee.");
      return;
    }

    if (isCareOf && !careOfEmployeeId.trim()) {
      setError("Please select the Care Of employee.");
      return;
    }

    if (isCareOf && careOfEmployeeId === userEmployeeId) {
      setError("The Care Of employee must be different from the new assignee.");
      return;
    }

    if (!transferredAt) {
      setError("Please select the transfer date.");
      return;
    }

    if (userEmployeeId === assignment.user_employee_id) {
      setError("The new employee must be different from the current assignee.");
      return;
    }

    for (const attachment of attachments) {
      if (!attachment.attachment_type_id) {
        setError("Please select an attachment type for every attachment.");
        return;
      }

      if (!attachment.name.trim()) {
        setError("Please enter a name for every attachment.");
        return;
      }

      if (!attachment.file) {
        setError("Please select a file for every attachment.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await transferEquipment(assignment.id, {
        user_employee_id: userEmployeeId,

        is_care_of: isCareOf,

        care_of_employee_id: isCareOf ? careOfEmployeeId : null,

        transfer_date: transferredAt,

        remarks: remarks.trim() || null,
      });

      const newAssignment = response.assignment;

      for (const attachment of attachments) {
        if (!attachment.file) {
          continue;
        }

        await createEquipmentAssignmentAttachment({
          equipment_id: equipment.id,
          equipment_assignment_id: newAssignment.id,
          attachment_type_id: attachment.attachment_type_id,
          name: attachment.name.trim(),
          file: attachment.file,
          description: attachment.description?.trim() || null,
        });
      }

      resetForm();
      await onSuccess();
    } catch (error: any) {
      console.error("Failed to transfer equipment:", error);

      const response = error?.response?.data;

      if (response?.errors && typeof response.errors === "object") {
        setValidationErrors(response.errors);
      }

      setError(
        response?.message ??
          error?.message ??
          "Unable to transfer the equipment. Please check the form and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ThemeIcon size={34} radius="md" variant="light">
            <ArrowLeftRight size={18} />
          </ThemeIcon>

          <div>
            <Text fw={700}>Transfer Equipment</Text>

            <Text size="xs" c="dimmed">
              Transfer the current assignment to another employee.
            </Text>
          </div>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={false}
      closeOnEscape={!submitting}
      withCloseButton={!submitting}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="md">
        {/* CURRENT ASSIGNMENT */}
        <Paper withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={34} radius="md" variant="light" color="green">
              <UserRoundCog size={17} />
            </ThemeIcon>

            <div style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed">
                CURRENT ASSIGNEE
              </Text>

              <Text size="sm" fw={700} style={{ wordBreak: "break-all" }}>
                {assignment.user_employee_id}
              </Text>
            </div>

            <Text size="xs" c="dimmed" ml="auto">
              Active
            </Text>
          </Group>
        </Paper>

        {/* TRANSFER ERROR */}
        {error && (
          <Alert color="red" variant="light" icon={<AlertCircle size={18} />}>
            {error}
          </Alert>
        )}

        {/* EMPLOYEE FETCH ERROR */}
        {employeeError && (
          <Alert color="red" variant="light" icon={<AlertCircle size={18} />}>
            <Stack gap="xs">
              <Text size="sm">{employeeError}</Text>

              <Group justify="flex-start">
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => void fetchEmployees()}
                  loading={loadingEmployees}
                  disabled={submitting}
                >
                  Retry loading employees
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}

        {/* NEW ASSIGNMENT */}
        <Stack gap="md">
          <div>
            <Text fw={600}>New Assignment</Text>

            <Text size="xs" c="dimmed">
              Select the employee who will receive this equipment.
            </Text>
          </div>

          <Divider />

          <Select
            label="New Assignee"
            placeholder={
              loadingEmployees ? "Loading employees..." : "Select an employee"
            }
            data={newAssigneeOptions}
            value={userEmployeeId || null}
            onChange={(value) => setUserEmployeeId(value ?? "")}
            searchable
            clearable
            nothingFoundMessage="No employees found"
            disabled={submitting || loadingEmployees || !!employeeError}
            error={getFieldError("user_employee_id")}
            required
          />

          <Switch
            label="Care Of"
            description="The equipment is assigned under the care of another employee."
            checked={isCareOf}
            onChange={(event) => {
              const checked = event.currentTarget.checked;

              setIsCareOf(checked);

              if (!checked) {
                setCareOfEmployeeId("");
              }
            }}
            disabled={submitting}
          />

          {isCareOf && (
            <Select
              label="Care Of Employee"
              placeholder={
                loadingEmployees
                  ? "Loading employees..."
                  : "Select a Care Of employee"
              }
              data={employeeOptions}
              value={careOfEmployeeId || null}
              onChange={(value) => setCareOfEmployeeId(value ?? "")}
              searchable
              clearable
              nothingFoundMessage="No employees found"
              disabled={submitting || loadingEmployees || !!employeeError}
              error={getFieldError("care_of_employee_id")}
              required
            />
          )}

          <DateInput
            label="Transfer Date"
            placeholder="Select transfer date"
            value={transferredAt}
            onChange={(value) => setTransferredAt(value ?? "")}
            valueFormat="YYYY-MM-DD"
            leftSection={<CalendarDays size={17} />}
            disabled={submitting}
            error={getFieldError("transfer_date")}
            required
          />

          <Textarea
            label="Remarks"
            placeholder="Optional remarks"
            minRows={4}
            autosize
            maxRows={6}
            value={remarks}
            onChange={(event) => setRemarks(event.currentTarget.value)}
            disabled={submitting}
            error={getFieldError("remarks")}
          />
        </Stack>

        {/* ATTACHMENTS */}
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group gap="xs">
              <ThemeIcon size={30} radius="sm" variant="light" color="blue">
                <Paperclip size={15} />
              </ThemeIcon>

              <div>
                <Text size="sm" fw={600}>
                  Assignment Attachments
                </Text>

                <Text size="xs" c="dimmed">
                  These files will be attached to the new assignment.
                </Text>
              </div>
            </Group>

            <Divider my="xs" />

            <AttachmentUpload
              value={attachments}
              attachmentTypes={attachmentTypes}
              loadingAttachmentTypes={loadingAttachmentTypes}
              disabled={submitting}
              contextLabel="equipment transfer"
              onChange={setAttachments}
            />
          </Stack>
        </Paper>

        {/* TRANSFER INFORMATION */}
        <Alert color="blue" variant="light">
          <Text size="xs">
            <strong>Transfer behavior:</strong> the current assignment will
            become <strong>Transferred</strong>, while a new active assignment
            will be created for the selected employee. Both records remain in
            the same assignment thread. Attachments added above will belong to
            the new assignment.
          </Text>
        </Alert>

        {/* ACTIONS */}
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            leftSection={<ArrowLeftRight size={16} />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={loadingEmployees || !!employeeError}
          >
            Transfer Equipment
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
