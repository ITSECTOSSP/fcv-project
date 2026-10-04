import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button, Group, Stack, Text } from "@mantine/core";

import { ArrowLeft } from "lucide-react";

import EquipmentForm, {
  type EquipmentFormValues,
} from "@/components/service/inv-fcv/equipment/equipment-form";

import { createEquipment } from "@/lib/api/inv-fcv/equipment";

import { createEquipmentAttachment } from "@/lib/api/inv-fcv/equipment-attachment";

import { getEquipmentTypes } from "@/lib/api/inv-fcv/equipment-types";

import { getAttachmentTypes } from "@/lib/api/inv-fcv/attachment-types";

import type { AttachmentType } from "@/types/inv-fcv/attachment-type";

import type { EquipmentType } from "@/types/inv-fcv/equipment-types";

/* =====================================================
   COMPONENT
====================================================== */

export default function CreateEquipment() {
  const navigate = useNavigate();

  /* =====================================================
       STATE
    ====================================================== */

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);

  const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);

  const [loadingTypes, setLoadingTypes] = useState(true);

  const [loadingAttachmentTypes, setLoadingAttachmentTypes] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =====================================================
       LOAD EQUIPMENT TYPES
    ====================================================== */

  const loadEquipmentTypes = async () => {
    try {
      setLoadingTypes(true);
      setError(null);

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
    loadEquipmentTypes();
    loadAttachmentTypes();
  }, []);

  /* =====================================================
       SUBMIT
    ====================================================== */

  const handleSubmit = async (values: EquipmentFormValues) => {
    try {
      setSubmitting(true);
      setError(null);

      /* =====================================================
               CREATE EQUIPMENT
            ====================================================== */

      const response = await createEquipment({
        equipment_type_id: values.equipment_type_id,
        date_acquired: values.date_acquired,
        quantity: values.quantity,
        property_number: values.property_number.trim(),
        serial_number: values.serial_number.trim() || null,
        description: values.description.trim(),
        unit_cost: values.unit_cost,
      });

      const equipmentId = response.data.id;

      /* =====================================================
               CREATE EQUIPMENT ATTACHMENTS
            ====================================================== */

      for (const attachment of values.attachments) {
        /*
         * Skip attachment entries without
         * a selected file.
         */

        if (!attachment.file) {
          continue;
        }

        /*
         * Audit fields such as encoded_by and
         * updated_by are NOT sent from the frontend.
         *
         * The inventory backend obtains the
         * authenticated user from auth.fcv and
         * automatically sets:
         *
         * encoded_by = authenticated user ID
         * updated_by = authenticated user ID
         */

        await createEquipmentAttachment(equipmentId, {
          attachment_type_id: attachment.attachment_type_id,

          name: attachment.name.trim(),

          file: attachment.file,

          description: attachment.description.trim() || null,
        });
      }

      /* =====================================================
               SUCCESS
            ====================================================== */

      console.log("Created equipment:", response.data);

      navigate("/inventory/manage");
    } catch (error) {
      console.error("Failed to create equipment:", error);

      setError(
        "Unable to create equipment or upload its attachments. Please check your information and try again.",
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
            Add Equipment
          </Text>

          <Text size="sm" c="dimmed">
            Add a new equipment record to the inventory.
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
                FORM
            ====================================================== */}

      <EquipmentForm
        equipmentTypes={equipmentTypes}
        attachmentTypes={attachmentTypes}
        loadingTypes={loadingTypes}
        loadingAttachmentTypes={loadingAttachmentTypes}
        submitting={submitting}
        error={error}
        submitLabel="Add Equipment"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Stack>
  );
}
