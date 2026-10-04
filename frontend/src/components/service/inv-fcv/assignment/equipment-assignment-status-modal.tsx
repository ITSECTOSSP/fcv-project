import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";

import { DateInput } from "@mantine/dates";

import {
  AlertCircle,
  CalendarDays,
  PackageCheck,
  Paperclip,
  Trash2,
  UserRoundCog,
} from "lucide-react";

import {
  disposeEquipment,
  returnEquipment,
} from "@/lib/api/inv-fcv/equipment-assignment";

import { createEquipmentAssignmentAttachment } from "@/lib/api/inv-fcv/equipment-attachment";

import AttachmentUpload, {
  type AttachmentFormValue,
} from "@/components/service/inv-fcv/equipment/equipment-attachment-form";

import type { Equipment } from "@/types/inv-fcv/equipment";

import type { EquipmentAssignment } from "@/types/inv-fcv/equipment-assignment";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

interface EquipmentAssignmentStatusModalProps {
  opened: boolean;

  /**
   * Determines which assignment action is being performed.
   */
  action: "return" | "dispose";

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

export default function EquipmentAssignmentStatusModal({
  opened,
  action,
  equipment,
  assignment,
  attachmentTypes,
  loadingAttachmentTypes = false,
  onSuccess,
  onClose,
}: EquipmentAssignmentStatusModalProps) {
  const [returnedAt, setReturnedAt] = useState(getLocalDateString());

  const [remarks, setRemarks] = useState("");

  const [attachments, setAttachments] = useState<AttachmentFormValue[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const isReturn = action === "return";

  const getFieldError = (field: string) => {
    return validationErrors[field]?.[0];
  };

  /*
   * Reset the form whenever the modal is opened
   * or the action/assignment changes.
   */
  useEffect(() => {
    if (!opened) {
      return;
    }

    setReturnedAt(getLocalDateString());

    setRemarks("");

    setAttachments([]);

    setError(null);

    setValidationErrors({});
  }, [opened, action, assignment.id]);

  const resetForm = () => {
    setReturnedAt(getLocalDateString());

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

  const validateAttachments = () => {
    for (const attachment of attachments) {
      if (!attachment.attachment_type_id) {
        setError("Please select an attachment type for every attachment.");

        return false;
      }

      if (!attachment.name.trim()) {
        setError("Please enter a name for every attachment.");

        return false;
      }

      if (!attachment.file) {
        setError("Please select a file for every attachment.");

        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    setError(null);

    setValidationErrors({});

    /*
     * The current assignment must still be active.
     */
    if (assignment.status !== "active") {
      setError(
        "Only an active equipment assignment can be returned or disposed.",
      );

      return;
    }

    /*
     * Return requires a date.
     */
    if (isReturn && !returnedAt) {
      setError("Please select the return date.");

      return;
    }

    /*
     * Validate attachments before changing the
     * assignment status.
     */
    if (!validateAttachments()) {
      return;
    }

    try {
      setSubmitting(true);

      /*
       * STEP 1
       *
       * Update the assignment status.
       */
      if (isReturn) {
        await returnEquipment(assignment.id, {
          returned_at: returnedAt,
          remarks: remarks.trim() || null,
        });
      } else {
        await disposeEquipment(assignment.id, {
          remarks: remarks.trim() || null,
        });
      }

      /*
       * STEP 2
       *
       * Attach files to the existing assignment.
       *
       * Unlike transfer, there is no new assignment
       * record. The attachments belong to the same
       * assignment that was returned/disposed.
       */
      for (const attachment of attachments) {
        if (!attachment.file) {
          continue;
        }

        await createEquipmentAssignmentAttachment({
          equipment_id: equipment.id,

          equipment_assignment_id: assignment.id,

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
      console.error(`Failed to ${action} equipment assignment:`, error);

      const response = error?.response?.data;

      if (response?.errors && typeof response.errors === "object") {
        setValidationErrors(response.errors);
      }

      setError(
        response?.message ??
          error?.message ??
          `Unable to ${isReturn ? "return" : "dispose"} the equipment. Please check the form and try again.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const title = isReturn ? "Return Equipment" : "Dispose Equipment";

  const description = isReturn
    ? "Return the equipment from the current assignee to inventory."
    : "Mark the current equipment assignment as disposed.";

  const actionLabel = isReturn ? "Return Equipment" : "Dispose Equipment";

  const actionColor = isReturn ? "green" : "red";

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ThemeIcon size={34} radius="md" variant="light" color={actionColor}>
            {isReturn ? <PackageCheck size={18} /> : <Trash2 size={18} />}
          </ThemeIcon>

          <div>
            <Text fw={700}>{title}</Text>

            <Text size="xs" c="dimmed">
              {description}
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

            <Text size="xs" c="green" ml="auto" fw={600}>
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

        {/* STATUS INFORMATION */}
        <Stack gap="md">
          <div>
            <Text fw={600}>
              {isReturn ? "Return Information" : "Disposal Information"}
            </Text>

            <Text size="xs" c="dimmed">
              {isReturn
                ? "Provide the return date and any relevant remarks."
                : "Provide any relevant remarks before disposing of this equipment."}
            </Text>
          </div>

          <Divider />

          {/* RETURN DATE */}
          {isReturn && (
            <DateInput
              label="Return Date"
              placeholder="Select return date"
              value={returnedAt}
              onChange={(value) => setReturnedAt(value ?? "")}
              valueFormat="YYYY-MM-DD"
              leftSection={<CalendarDays size={17} />}
              disabled={submitting}
              error={getFieldError("returned_at")}
              required
            />
          )}

          {/* REMARKS */}
          <Textarea
            label="Remarks"
            placeholder={
              isReturn
                ? "Optional remarks about the returned equipment"
                : "Optional remarks about the disposal"
            }
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
                  Add files related to this {isReturn ? "return" : "disposal"}.
                </Text>
              </div>
            </Group>

            <Divider my="xs" />

            <AttachmentUpload
              value={attachments}
              attachmentTypes={attachmentTypes}
              loadingAttachmentTypes={loadingAttachmentTypes}
              disabled={submitting}
              contextLabel={
                isReturn ? "equipment return" : "equipment disposal"
              }
              onChange={setAttachments}
            />
          </Stack>
        </Paper>

        {/* INFORMATION */}
        <Alert color={isReturn ? "green" : "red"} variant="light">
          <Text size="xs">
            {isReturn ? (
              <>
                <strong>Return behavior:</strong> the current assignment will be
                marked as <strong>Returned</strong>. The assignment remains in
                the history for recordkeeping, and any attachments added above
                will remain associated with this assignment.
              </>
            ) : (
              <>
                <strong>Disposal behavior:</strong> the current assignment will
                be marked as <strong>Disposed</strong>. The assignment remains
                in the history for recordkeeping, and any attachments added
                above will remain associated with this assignment.
              </>
            )}
          </Text>
        </Alert>

        {/* ACTIONS */}
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            color={actionColor}
            leftSection={
              isReturn ? <PackageCheck size={16} /> : <Trash2 size={16} />
            }
            onClick={handleSubmit}
            loading={submitting}
          >
            {actionLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
