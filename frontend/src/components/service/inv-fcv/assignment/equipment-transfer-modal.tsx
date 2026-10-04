import { useState } from "react";

import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
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
  ArrowLeftRight,
  CalendarDays,
  Paperclip,
  UserRoundCog,
} from "lucide-react";

import { transferEquipment } from "@/lib/api/inv-fcv/equipment-assignment";
import { createEquipmentAssignmentAttachment } from "@/lib/api/inv-fcv/equipment-attachment";

import AttachmentUpload, {
  type AttachmentFormValue,
} from "@/components/service/inv-fcv/equipment/equipment-attachment-form";

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
      setError("Please enter the employee ID of the new assignee.");
      return;
    }

    if (isCareOf && !careOfEmployeeId.trim()) {
      setError("Please enter the Care Of employee ID.");
      return;
    }

    if (!transferredAt) {
      setError("Please select the transfer date.");
      return;
    }

    if (userEmployeeId.trim() === assignment.user_employee_id) {
      setError("The new employee must be different from the current assignee.");
      return;
    }

    /*
     * Validate new attachments.
     */
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

      /*
       * STEP 1
       *
       * Transfer the current assignment.
       *
       * The backend will:
       * - mark the current assignment as transferred
       * - create the new active assignment
       * - keep the same assignment_group_id
       */
      const response = await transferEquipment(assignment.id, {
        user_employee_id: userEmployeeId.trim(),

        is_care_of: isCareOf,

        care_of_employee_id: isCareOf ? careOfEmployeeId.trim() : null,

        transferred_at: transferredAt,

        remarks: remarks.trim() || null,
      });

      const newAssignment = response.assignment;

      /*
       * STEP 2
       *
       * Upload attachments to the newly-created
       * assignment.
       */
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

      /*
       * Everything succeeded.
       */
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

            <div
              style={{
                minWidth: 0,
              }}
            >
              <Text size="xs" c="dimmed">
                CURRENT ASSIGNEE
              </Text>

              <Text
                size="sm"
                fw={700}
                style={{
                  wordBreak: "break-all",
                }}
              >
                {assignment.user_employee_id}
              </Text>
            </div>

            <Text size="xs" c="dimmed" ml="auto">
              Active
            </Text>
          </Group>
        </Paper>

        {/* ERROR */}
        {error && (
          <Alert color="red" variant="light" icon={<AlertCircle size={18} />}>
            {error}
          </Alert>
        )}

        {/* NEW ASSIGNMENT */}
        <Stack gap="md">
          <div>
            <Text fw={600}>New Assignment</Text>

            <Text size="xs" c="dimmed">
              Enter the employee who will receive this equipment.
            </Text>
          </div>

          <Divider />

          <TextInput
            label="Employee ID"
            placeholder="Enter employee UUID"
            value={userEmployeeId}
            onChange={(event) => setUserEmployeeId(event.currentTarget.value)}
            disabled={submitting}
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
            <TextInput
              label="Care Of Employee ID"
              placeholder="Enter Care Of employee UUID"
              value={careOfEmployeeId}
              onChange={(event) =>
                setCareOfEmployeeId(event.currentTarget.value)
              }
              disabled={submitting}
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
            error={getFieldError("transferred_at")}
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
          >
            Transfer Equipment
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
