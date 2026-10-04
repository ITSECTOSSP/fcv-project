import api from "@/lib/api/api";

import type {
    EquipmentAttachment,
    EquipmentAttachmentResponse,
} from "@/types/inv-fcv/equipment";

import type {
    EquipmentAssignmentAttachment,
} from "@/types/inv-fcv/equipment-assignment";

/* =====================================================
 * TYPES
 * ==================================================== */

export type EquipmentAttachmentsResponse = {
    data: EquipmentAttachment[];
};

export type EquipmentAssignmentAttachmentsResponse = {
    data: EquipmentAssignmentAttachment[];
};

export type CreateEquipmentAttachmentPayload = {
    attachment_type_id: string;
    name: string;
    file: File;
    description?: string | null;
};

export type CreateEquipmentAssignmentAttachmentPayload = {
    equipment_id: string;
    equipment_assignment_id: string;
    attachment_type_id: string;
    name: string;
    file: File;
    description?: string | null;
};

export type UpdateEquipmentAttachmentPayload = {
    attachment_type_id: string;
    name: string;
    file?: File | null;
    description?: string | null;
};

export type DeleteEquipmentAttachmentResponse = {
    message: string;
};

/* =====================================================
 * GET EQUIPMENT ATTACHMENTS
 * ==================================================== */

export async function getEquipmentAttachments(
    equipmentId: string,
): Promise<EquipmentAttachmentsResponse> {
    const response =
        await api.get<EquipmentAttachmentsResponse>(
            `/api/inventory/equipments/${equipmentId}/attachments`,
        );

    return response.data;
}

/* =====================================================
 * GET SINGLE EQUIPMENT ATTACHMENT
 * ==================================================== */

export async function getEquipmentAttachment(
    equipmentId: string,
    attachmentId: string,
): Promise<EquipmentAttachmentResponse> {
    const response =
        await api.get<EquipmentAttachmentResponse>(
            `/api/inventory/equipments/${equipmentId}/attachments/${attachmentId}`,
        );

    return response.data;
}

/* =====================================================
 * CREATE EQUIPMENT ATTACHMENT
 *
 * General equipment attachment.
 * equipment_assignment_id is not required.
 * ==================================================== */

export async function createEquipmentAttachment(
    equipmentId: string,
    payload: CreateEquipmentAttachmentPayload,
): Promise<EquipmentAttachmentResponse> {
    const formData = new FormData();

    formData.append(
        "equipment_id",
        equipmentId,
    );

    formData.append(
        "attachment_type_id",
        payload.attachment_type_id,
    );

    formData.append(
        "name",
        payload.name,
    );

    formData.append(
        "file",
        payload.file,
    );

    if (payload.description) {
        formData.append(
            "description",
            payload.description,
        );
    }

    const response =
        await api.post<EquipmentAttachmentResponse>(
            `/api/inventory/equipments/${equipmentId}/attachments`,
            formData,
        );

    return response.data;
}

/* =====================================================
 * GET EQUIPMENT ASSIGNMENT ATTACHMENTS
 * ==================================================== */

export async function getEquipmentAssignmentAttachments(
    equipmentAssignmentId: string,
): Promise<EquipmentAssignmentAttachmentsResponse> {
    const response =
        await api.get<EquipmentAssignmentAttachmentsResponse>(
            `/api/inventory/equipment-assignments/${equipmentAssignmentId}/attachments`,
        );

    return response.data;
}

/* =====================================================
 * CREATE EQUIPMENT ASSIGNMENT ATTACHMENT
 *
 * Sends BOTH:
 * - equipment_id
 * - equipment_assignment_id
 *
 * The backend verifies that the assignment belongs
 * to the specified equipment.
 * ==================================================== */

export async function createEquipmentAssignmentAttachment(
    payload: CreateEquipmentAssignmentAttachmentPayload,
): Promise<EquipmentAssignmentAttachmentsResponse> {
    const formData = new FormData();

    formData.append(
        "equipment_id",
        payload.equipment_id,
    );

    formData.append(
        "equipment_assignment_id",
        payload.equipment_assignment_id,
    );

    formData.append(
        "attachment_type_id",
        payload.attachment_type_id,
    );

    formData.append(
        "name",
        payload.name,
    );

    formData.append(
        "file",
        payload.file,
    );

    if (payload.description) {
        formData.append(
            "description",
            payload.description,
        );
    }

    const response =
        await api.post<EquipmentAssignmentAttachmentsResponse>(
            `/api/inventory/equipment-assignments/${payload.equipment_assignment_id}/attachments`,
            formData,
        );

    return response.data;
}

/* =====================================================
 * UPDATE EQUIPMENT ATTACHMENT
 * ==================================================== */

export async function updateEquipmentAttachment(
    equipmentId: string,
    attachmentId: string,
    payload: UpdateEquipmentAttachmentPayload,
): Promise<EquipmentAttachmentResponse> {
    const formData = new FormData();

    formData.append(
        "equipment_id",
        equipmentId,
    );

    formData.append(
        "attachment_type_id",
        payload.attachment_type_id,
    );

    formData.append(
        "name",
        payload.name,
    );

    formData.append(
        "description",
        payload.description ?? "",
    );

    if (payload.file) {
        formData.append(
            "file",
            payload.file,
        );
    }

    /*
     * Laravel backend currently defines the update
     * endpoint as POST.
     *
     * Therefore, no _method field is required.
     */

    const response =
        await api.post<EquipmentAttachmentResponse>(
            `/api/inventory/equipments/${equipmentId}/attachments/${attachmentId}`,
            formData,
        );

    return response.data;
}

/* =====================================================
 * DELETE EQUIPMENT ATTACHMENT
 * ==================================================== */

export async function deleteEquipmentAttachment(
    equipmentId: string,
    attachmentId: string,
): Promise<DeleteEquipmentAttachmentResponse> {
    const response =
        await api.delete<DeleteEquipmentAttachmentResponse>(
            `/api/inventory/equipments/${equipmentId}/attachments/${attachmentId}`,
        );

    return response.data;
}
