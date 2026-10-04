import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Button, Group, Stack, Text } from "@mantine/core";

import { ArrowLeft } from "lucide-react";

import EquipmentForm, {
  type EquipmentFormValues,
} from "@/components/service/inv-fcv/equipment/equipment-form";

import { getEquipment, updateEquipment } from "@/lib/api/inv-fcv/equipment";

import {
  createEquipmentAttachment,
  updateEquipmentAttachment,
  deleteEquipmentAttachment,
} from "@/lib/api/inv-fcv/equipment-attachment";

import { getEquipmentTypes } from "@/lib/api/inv-fcv/equipment-types";

import { getAttachmentTypes } from "@/lib/api/inv-fcv/attachment-types";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

import type { Equipment } from "@/types/inv-fcv/equipment";

import type { EquipmentType } from "@/types/inv-fcv/equipment-types";

/* =====================================================
   TYPES
====================================================== */

type ExistingAttachmentEditValue = {
  attachment_type_id: string;
  name: string;
  description: string;
  file: File | null;
};
/* =====================================================
   EDIT EQUIPMENT
====================================================== */

export default function EditEquipment() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  /* =====================================================
       STATE
    ====================================================== */

  const [equipment, setEquipment] = useState<Equipment | null>(null);

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);

  const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingTypes, setLoadingTypes] = useState(true);

  const [loadingAttachmentTypes, setLoadingAttachmentTypes] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =====================================================
       LOAD EQUIPMENT
    ====================================================== */

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
      console.error("Failed to load equipment:", error);

      setError("Unable to load equipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
       LOAD EQUIPMENT TYPES
    ====================================================== */

  const loadEquipmentTypes = async () => {
    try {
      setLoadingTypes(true);

      const response = await getEquipmentTypes({
        per_page: 100,
      });

      setEquipmentTypes(response.data);
    } catch (error) {
      console.error("Failed to load equipment types:", error);

      setError("Unable to load equipment types. Please try again.");
    } finally {
      setLoadingTypes(false);
    }
  };

  /* =====================================================
       LOAD ATTACHMENT TYPES
    ====================================================== */

  const loadAttachmentTypes = async () => {
    try {
      setLoadingAttachmentTypes(true);

      const response = await getAttachmentTypes({
        per_page: 100,
      });

      setAttachmentTypes(response.data);
    } catch (error) {
      console.error("Failed to load attachment types:", error);

      setError("Unable to load attachment types. Please try again.");
    } finally {
      setLoadingAttachmentTypes(false);
    }
  };

  /* =====================================================
       INITIAL LOAD
    ====================================================== */

  useEffect(() => {
    loadEquipment();
    loadEquipmentTypes();
    loadAttachmentTypes();
  }, [id]);

  /* =====================================================
       UPDATE EXISTING ATTACHMENT
    ====================================================== */

  const handleUpdateExistingAttachment = async (
    attachmentId: string,
    values: ExistingAttachmentEditValue,
  ) => {
    if (!id) {
      throw new Error("Equipment ID is missing.");
    }

    try {
      const response = await updateEquipmentAttachment(id, attachmentId, {
        attachment_type_id: values.attachment_type_id,

        name: values.name.trim(),

        description: values.description.trim() || null,

        file: values.file,
      });

      /*
       * Update the attachment in local state
       * immediately after the API succeeds.
       */
      setEquipment((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          attachments: current.attachments?.map((attachment) =>
            attachment.id === attachmentId ? response.data : attachment,
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update equipment attachment:", error);

      throw error;
    }
  };

  /* =====================================================
       DELETE EXISTING ATTACHMENT
    ====================================================== */

  const handleDeleteExistingAttachment = async (attachmentId: string) => {
    if (!id) {
      throw new Error("Equipment ID is missing.");
    }

    try {
      await deleteEquipmentAttachment(id, attachmentId);

      /*
       * Remove the attachment from local state
       * after the API successfully deletes it.
       */
      setEquipment((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          attachments: current.attachments?.filter(
            (attachment) => attachment.id !== attachmentId,
          ),
        };
      });
    } catch (error) {
      console.error("Failed to delete equipment attachment:", error);

      throw error;
    }
  };

  /* =====================================================
       SUBMIT
    ====================================================== */

  const handleSubmit = async (values: EquipmentFormValues) => {
    if (!id) {
      setError("Equipment ID is missing.");

      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      /* =====================================================
               UPDATE EQUIPMENT
            ====================================================== */

      await updateEquipment(id, {
        equipment_type_id: values.equipment_type_id,

        date_acquired: values.date_acquired,

        quantity: values.quantity,

        property_number: values.property_number.trim(),

        serial_number: values.serial_number.trim() || null,

        description: values.description.trim(),

        unit_cost: values.unit_cost,
      });

      /* =====================================================
               UPLOAD NEW ATTACHMENTS
            ====================================================== */

      for (const attachment of values.attachments) {
        /*
         * Existing attachments are not part of
         * values.attachments.
         *
         * Therefore every item here represents
         * a newly selected file.
         */

        if (!attachment.file) {
          continue;
        }

        await createEquipmentAttachment(id, {
          attachment_type_id: attachment.attachment_type_id,

          name: attachment.name.trim(),

          file: attachment.file,

          description: attachment.description.trim() || null,
        });
      }

      /* =====================================================
               SUCCESS
            ====================================================== */

      navigate("/inventory/manage");
    } catch (error) {
      console.error("Failed to update equipment:", error);

      setError(
        "Unable to update equipment or upload its attachments. Please check your information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
       CANCEL
    ====================================================== */

  const handleCancel = () => {
    navigate("/inventory/manage");
  };

  /* =====================================================
       RENDER
    ====================================================== */

  return (
    <Stack gap="lg">
      {/* =====================================================
                HEADER
            ====================================================== */}

      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>
            Edit Equipment
          </Text>

          <Text size="sm" c="dimmed">
            Update the equipment information.
          </Text>
        </div>

        <Button
          variant="default"
          leftSection={<ArrowLeft size={17} />}
          onClick={handleCancel}
        >
          Back to Equipments
        </Button>
      </Group>

      {/* =====================================================
                EQUIPMENT FORM
            ====================================================== */}

      <EquipmentForm
        key={equipment?.id ?? "loading"}
        equipmentTypes={equipmentTypes}
        attachmentTypes={attachmentTypes}
        /*
         * Existing attachments are passed separately
         * from the new-upload form values.
         */
        existingAttachments={equipment?.attachments ?? []}
        loadingTypes={loadingTypes}
        loadingAttachmentTypes={loadingAttachmentTypes}
        loading={loading}
        submitting={submitting}
        error={error}
        initialValues={
          equipment
            ? {
                equipment_type_id: equipment.equipment_type_id,

                date_acquired: equipment.date_acquired,

                quantity: equipment.quantity,

                property_number: equipment.property_number,

                serial_number: equipment.serial_number ?? "",

                description: equipment.description,

                unit_cost: Number(equipment.unit_cost),

                /*
                 * Existing attachments are
                 * handled separately through
                 * existingAttachments.
                 */
                attachments: [],
              }
            : undefined
        }
        /*
         * These are calculated by the backend
         * and displayed as read-only fields.
         */
        assignedQuantity={equipment?.assigned_quantity}
        availableQuantity={equipment?.available_quantity}
        submitLabel="Update Equipment"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        /* =====================================================
                   EXISTING ATTACHMENT ACTIONS
                ====================================================== */

        onUpdateExistingAttachment={handleUpdateExistingAttachment}
        onDeleteExistingAttachment={handleDeleteExistingAttachment}
      />
    </Stack>
  );
}
