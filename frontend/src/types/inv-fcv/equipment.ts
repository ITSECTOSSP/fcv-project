import type { AttachmentType } from "./attachment-type";
import type { EquipmentType } from "./equipment-types";

/* =====================================================
   EQUIPMENT ATTACHMENT
====================================================== */

export type EquipmentAttachment = {
    id: string;
    equipment_id: string;
    attachment_type_id: string;

    name: string;

    file_path: string;
    file_name: string;
    mime_type: string | null;
    file_size: number | null;
    file_url?: string;

    description: string | null;

    attachment_type?: AttachmentType;

    encoded_by: string;
    updated_by: string | null;

    created_at: string;
    updated_at: string;
};

/* =====================================================
   EQUIPMENT ATTACHMENT RESPONSE
====================================================== */

export type EquipmentAttachmentResponse = {
    message?: string;
    data: EquipmentAttachment;
};

/* =====================================================
   EQUIPMENT
====================================================== */

export type Equipment = {
    id: string;

    equipment_type_id: string;
    equipment_type?: EquipmentType;

    date_acquired: string;

    quantity: number;
    assigned_quantity: number;
    available_quantity: number;

    description: string;

    property_number: string;
    serial_number: string | null;

    unit_cost: string;

    attachments?: EquipmentAttachment[];

    encoded_by: string;
    updated_by: string | null;

    created_at: string;
    updated_at: string;
};

/* =====================================================
   EQUIPMENT LIST RESPONSE
====================================================== */

export type EquipmentsResponse = {
    current_page: number;

    data: Equipment[];

    first_page_url: string;

    from: number | null;

    last_page: number;

    last_page_url: string;

    per_page: number;

    to: number | null;

    total: number;
};

/* =====================================================
   EQUIPMENT RESPONSE
====================================================== */

export type EquipmentResponse = {
    message?: string;
    data: Equipment;
};

/* =====================================================
   CREATE EQUIPMENT
====================================================== */

export type CreateEquipmentPayload = {
    equipment_type_id: string;

    date_acquired: string;

    quantity: number;

    description: string;

    property_number: string;

    serial_number?: string | null;

    unit_cost: number;
};

/* =====================================================
   UPDATE EQUIPMENT
====================================================== */

export type UpdateEquipmentPayload =
    CreateEquipmentPayload;