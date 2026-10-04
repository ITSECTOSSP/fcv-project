import { useState } from "react";

import {
  ActionIcon,
  Alert,
  Button,
  Card,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";

import {
  AlertCircle,
  CheckCircle2,
  File,
  FileEdit,
  FilePlus2,
  FileText,
  Paperclip,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import type { EquipmentAttachment } from "@/types/inv-fcv/equipment";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

export type AttachmentFormValue = {
  attachment_type_id: string;
  name: string;
  file: File | null;
  description: string;
};

type ExistingAttachmentEditValue = {
  attachment_type_id: string;
  name: string;
  description: string;
  file: File | null;
};

export type AttachmentUploadProps = {
  /**
   * New attachments being added.
   */
  value: AttachmentFormValue[];

  /**
   * Existing attachments already saved in the database.
   */
  existingAttachments?: EquipmentAttachment[];

  /**
   * Attachment type options.
   */
  attachmentTypes: AttachmentType[];

  /**
   * Loading state for attachment types.
   */
  loadingAttachmentTypes?: boolean;

  /**
   * Disable the entire component.
   */
  disabled?: boolean;

  /**
   * Used to customize the wording.
   *
   * Examples:
   * "equipment"
   * "equipment assignment"
   */
  contextLabel?: string;

  /**
   * Called whenever new attachment values change.
   */
  onChange: (value: AttachmentFormValue[]) => void;

  /**
   * Called when an existing attachment is updated.
   *
   * The parent component owns the API request.
   */
  onUpdateExistingAttachment?: (
    attachmentId: string,
    values: ExistingAttachmentEditValue,
  ) => Promise<void>;

  /**
   * Called when an existing attachment is deleted.
   *
   * The parent component owns the API request.
   */
  onDeleteExistingAttachment?: (attachmentId: string) => Promise<void>;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function AttachmentUpload({
  value,
  existingAttachments = [],
   attachmentTypes = [],
  loadingAttachmentTypes = false,
  disabled = false,
  contextLabel = "equipment",
  onChange,
  onUpdateExistingAttachment,
  onDeleteExistingAttachment,
}: AttachmentUploadProps) {
  const [editingAttachment, setEditingAttachment] =
    useState<EquipmentAttachment | null>(null);

  const [editValues, setEditValues] = useState<ExistingAttachmentEditValue>({
    attachment_type_id: "",
    name: "",
    description: "",
    file: null,
  });

  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingAttachmentId, setDeletingAttachmentId] = useState<
    string | null
  >(null);

  const [deleteTarget, setDeleteTarget] = useState<EquipmentAttachment | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const attachmentTypeOptions = attachmentTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  const addAttachment = () => {
    onChange([
      ...value,
      {
        attachment_type_id: "",
        name: "",
        file: null,
        description: "",
      },
    ]);
  };

  const removeAttachment = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateAttachment = (
    index: number,
    field: keyof AttachmentFormValue,
    fieldValue: string | File | null,
  ) => {
    const updated = [...value];

    updated[index] = {
      ...updated[index],
      [field]: fieldValue,
    };

    onChange(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    setError(null);

    if (!file) {
      updateAttachment(index, "file", null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `The selected file "${file.name}" exceeds the 20 MB file size limit.`,
      );

      return;
    }

    updateAttachment(index, "file", file);

    /*
     * Automatically use the original filename
     * as the attachment name if the name is empty.
     */
    if (!value[index]?.name) {
      updateAttachment(index, "name", file.name);
    }
  };

  const openEditModal = (attachment: EquipmentAttachment) => {
    setError(null);
    setSuccessMessage(null);

    setEditingAttachment(attachment);

    setEditValues({
      attachment_type_id: attachment.attachment_type_id,
      name: attachment.name,
      description: attachment.description ?? "",
      file: null,
    });
  };

  const closeEditModal = () => {
    if (savingEdit) {
      return;
    }

    setEditingAttachment(null);

    setEditValues({
      attachment_type_id: "",
      name: "",
      description: "",
      file: null,
    });
  };

  const handleUpdateExistingAttachment = async () => {
    if (!editingAttachment || !onUpdateExistingAttachment) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    if (!editValues.attachment_type_id) {
      setError("Please select an attachment type.");

      return;
    }

    if (!editValues.name.trim()) {
      setError("Please enter an attachment name.");

      return;
    }

    if (editValues.file && editValues.file.size > MAX_FILE_SIZE) {
      setError(
        `The selected file "${editValues.file.name}" exceeds the 20 MB file size limit.`,
      );

      return;
    }

    try {
      setSavingEdit(true);

      await onUpdateExistingAttachment(editingAttachment.id, editValues);

      setSuccessMessage("Attachment updated successfully.");

      closeEditModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update attachment.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteModal = (attachment: EquipmentAttachment) => {
    setError(null);
    setSuccessMessage(null);

    setDeleteTarget(attachment);
  };

  const closeDeleteModal = () => {
    if (deletingAttachmentId) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleDeleteExistingAttachment = async () => {
    if (!deleteTarget || !onDeleteExistingAttachment) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      setDeletingAttachmentId(deleteTarget.id);

      await onDeleteExistingAttachment(deleteTarget.id);

      setSuccessMessage("Attachment deleted successfully.");

      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete attachment.",
      );
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const getFileSize = (size: number | null | undefined) => {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Stack gap="md">
      {error && (
        <Alert
          color="red"
          variant="light"
          icon={<AlertCircle size={18} />}
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          color="green"
          variant="light"
          icon={<CheckCircle2 size={18} />}
          withCloseButton
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* EXISTING ATTACHMENTS */}
      {existingAttachments.length > 0 && (
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={600} size="sm">
                Existing Files
              </Text>

              <Text size="xs" c="dimmed">
                Files already uploaded for this {contextLabel}.
              </Text>
            </div>

            <Text size="xs" c="dimmed">
              {existingAttachments.length} file
              {existingAttachments.length !== 1 ? "s" : ""}
            </Text>
          </Group>

          <Stack gap="xs">
            {existingAttachments.map((attachment) => (
              <Card key={attachment.id} withBorder padding="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group
                    gap="sm"
                    wrap="nowrap"
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <FileText size={20} />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <Text size="sm" fw={500} truncate>
                        {attachment.name}
                      </Text>

                      <Text size="xs" c="dimmed" truncate>
                        {attachment.attachment_type?.name ?? "Attachment"}

                        {attachment.file_size
                          ? ` • ${getFileSize(attachment.file_size)}`
                          : ""}
                      </Text>
                    </div>
                  </Group>

                  <Group gap={4} wrap="nowrap">
                    {attachment.file_url && (
                      <ActionIcon
                        variant="subtle"
                        component="a"
                        href={attachment.file_url}
                        target="_blank"
                        rel="noreferrer"
                        title="View file"
                      >
                        <File size={17} />
                      </ActionIcon>
                    )}

                    {onUpdateExistingAttachment && (
                      <ActionIcon
                        variant="subtle"
                        title="Edit attachment"
                        disabled={disabled}
                        onClick={() => openEditModal(attachment)}
                      >
                        <FileEdit size={17} />
                      </ActionIcon>
                    )}

                    {onDeleteExistingAttachment && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        title="Delete attachment"
                        disabled={disabled}
                        onClick={() => openDeleteModal(attachment)}
                      >
                        <Trash2 size={17} />
                      </ActionIcon>
                    )}
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* NEW ATTACHMENTS */}
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <div>
            <Text fw={600} size="sm">
              Add Files
            </Text>

            <Text size="xs" c="dimmed">
              Add new files to this {contextLabel}.
            </Text>
          </div>
        </Group>

        {value.length === 0 && (
          <Card withBorder padding="lg">
            <Stack align="center" gap="xs">
              <Paperclip size={28} />

              <Text size="sm" fw={500}>
                No new files
              </Text>

              <Text size="xs" c="dimmed" ta="center">
                Add documents, photos, receipts, warranties, or other supporting
                files.
              </Text>

              <Button
                size="xs"
                variant="light"
                leftSection={<FilePlus2 size={16} />}
                onClick={addAttachment}
                disabled={disabled || loadingAttachmentTypes}
              >
                Add File
              </Button>
            </Stack>
          </Card>
        )}

        {value.map((attachment, index) => (
          <Card key={index} withBorder padding="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Upload size={17} />

                  <Text size="sm" fw={600}>
                    New {contextLabel} document
                  </Text>
                </Group>

                <ActionIcon
                  color="red"
                  variant="subtle"
                  disabled={disabled}
                  onClick={() => removeAttachment(index)}
                  title="Remove file"
                >
                  <X size={17} />
                </ActionIcon>
              </Group>

              <Select
                label="Attachment Type"
                placeholder={
                  loadingAttachmentTypes
                    ? "Loading attachment types..."
                    : "Select attachment type"
                }
                data={attachmentTypeOptions}
                value={attachment.attachment_type_id || null}
                onChange={(selected) =>
                  updateAttachment(index, "attachment_type_id", selected ?? "")
                }
                searchable
                withAsterisk
                disabled={disabled || loadingAttachmentTypes}
              />

              <TextInput
                label="Name"
                placeholder={`Enter ${contextLabel} document name`}
                value={attachment.name}
                onChange={(event) =>
                  updateAttachment(index, "name", event.currentTarget.value)
                }
                withAsterisk
                disabled={disabled}
              />

              <FileInput
                label="File"
                placeholder="Select file"
                value={attachment.file}
                onChange={(file) => handleFileChange(index, file)}
                leftSection={<File size={17} />}
                clearable
                withAsterisk
                disabled={disabled}
                description="Maximum file size: 20 MB"
              />

              <Textarea
                label="Description"
                placeholder={`Optional description of this ${contextLabel} file`}
                value={attachment.description}
                onChange={(event) =>
                  updateAttachment(
                    index,
                    "description",
                    event.currentTarget.value,
                  )
                }
                autosize
                minRows={2}
                disabled={disabled}
              />
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* EDIT EXISTING ATTACHMENT */}
      <Modal
        opened={!!editingAttachment}
        onClose={closeEditModal}
        title="Edit Attachment"
        centered
        closeOnClickOutside={!savingEdit}
        closeOnEscape={!savingEdit}
      >
        <Stack gap="md">
          <Select
            label="Attachment Type"
            placeholder="Select attachment type"
            data={attachmentTypeOptions}
            value={editValues.attachment_type_id || null}
            onChange={(selected) =>
              setEditValues((current) => ({
                ...current,
                attachment_type_id: selected ?? "",
              }))
            }
            searchable
            withAsterisk
            disabled={savingEdit || loadingAttachmentTypes}
          />

          <TextInput
            label="Name"
            placeholder="Enter attachment name"
            value={editValues.name}
            onChange={(event) =>
              setEditValues((current) => ({
                ...current,
                name: event.currentTarget.value,
              }))
            }
            withAsterisk
            disabled={savingEdit}
          />

          <FileInput
            label="Replace File"
            placeholder="Select a new file"
            value={editValues.file}
            onChange={(file) => {
              if (file && file.size > MAX_FILE_SIZE) {
                setError(
                  `The selected file "${file.name}" exceeds the 20 MB file size limit.`,
                );

                return;
              }

              setEditValues((current) => ({
                ...current,
                file,
              }));
            }}
            clearable
            leftSection={<File size={17} />}
            description="Leave empty to keep the current file."
            disabled={savingEdit}
          />

          <Textarea
            label="Description"
            placeholder="Optional description"
            value={editValues.description}
            onChange={(event) =>
              setEditValues((current) => ({
                ...current,
                description: event.currentTarget.value,
              }))
            }
            autosize
            minRows={3}
            disabled={savingEdit}
          />

          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={closeEditModal}
              disabled={savingEdit}
            >
              Cancel
            </Button>

            <Button
              leftSection={<CheckCircle2 size={17} />}
              onClick={handleUpdateExistingAttachment}
              loading={savingEdit}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        opened={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Delete Attachment"
        centered
        closeOnClickOutside={!deletingAttachmentId}
        closeOnEscape={!deletingAttachmentId}
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete this attachment?
          </Text>

          {deleteTarget && (
            <Card withBorder padding="sm">
              <Group gap="sm" wrap="nowrap">
                <FileText size={20} />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <Text size="sm" fw={500} truncate>
                    {deleteTarget.name}
                  </Text>

                  <Text size="xs" c="dimmed">
                    {deleteTarget.attachment_type?.name}
                  </Text>
                </div>
              </Group>
            </Card>
          )}

          <Alert color="red" variant="light" icon={<AlertCircle size={18} />}>
            This action cannot be undone.
          </Alert>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeDeleteModal}
              disabled={!!deletingAttachmentId}
            >
              Cancel
            </Button>

            <Button
              color="red"
              leftSection={<Trash2 size={17} />}
              onClick={handleDeleteExistingAttachment}
              loading={!!deletingAttachmentId}
            >
              Delete Attachment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
