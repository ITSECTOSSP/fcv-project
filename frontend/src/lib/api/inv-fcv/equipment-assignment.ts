import api from "@/lib/api/api";

import type {
    CreateEquipmentAssignmentData,
    DisposeEquipmentData,
    EquipmentAssignment,
    EquipmentAssignmentListResponse,
    EquipmentAssignmentResponse,
    EquipmentTransferResponse,
    ReturnEquipmentData,
    TransferEquipmentData,
    UpdateEquipmentAssignmentData,
} from "@/types/inv-fcv/equipment-assignment";

/**
 * Get all equipment assignments.
 */
export async function getEquipmentAssignments(params?: {
    page?: number;
    per_page?: number;
    equipment_id?: string;
    assignment_group_id?: string;
    user_employee_id?: string;
    status?: string;
}): Promise<EquipmentAssignmentListResponse> {
    const response =
        await api.get<EquipmentAssignmentListResponse>(
            "/api/inventory/equipment-assignments",
            {
                params,
            },
        );

    return response.data;
}

/**
 * Get a single equipment assignment.
 */
export async function getEquipmentAssignment(
    id: string,
): Promise<EquipmentAssignment> {
    const response =
        await api.get<EquipmentAssignmentResponse>(
            `/api/inventory/equipment-assignments/${id}`,
        );

    return response.data.data;
}

/**
 * Create an equipment assignment.
 */
export async function createEquipmentAssignment(
    data: CreateEquipmentAssignmentData,
): Promise<EquipmentAssignment> {
    const response =
        await api.post<EquipmentAssignmentResponse>(
            "/api/inventory/equipment-assignments",
            data,
        );

    return response.data.data;
}

/**
 * Update an equipment assignment.
 */
export async function updateEquipmentAssignment(
    id: string,
    data: UpdateEquipmentAssignmentData,
): Promise<EquipmentAssignment> {
    const response =
        await api.put<EquipmentAssignmentResponse>(
            `/api/inventory/equipment-assignments/${id}`,
            data,
        );

    return response.data.data;
}

/**
 * Delete an equipment assignment.
 */
export async function deleteEquipmentAssignment(
    id: string,
): Promise<void> {
    await api.delete(
        `/api/inventory/equipment-assignments/${id}`,
    );
}

/**
 * Return equipment.
 *
 * Backend:
 * POST /api/inventory/equipment-assignments/{id}/return
 *
 * returned_at is required by the backend.
 */
export async function returnEquipment(
    id: string,
    data: ReturnEquipmentData,
): Promise<EquipmentAssignment> {
    const response =
        await api.post<EquipmentAssignmentResponse>(
            `/api/inventory/equipment-assignments/${id}/return`,
            data,
        );

    return response.data.data;
}

/**
 * Transfer equipment.
 *
 * Backend:
 * POST /api/inventory/equipment-assignments/{id}/transfer
 *
 * Creates a new active assignment and records
 * the transfer between the two assignments.
 */
export async function transferEquipment(
    id: string,
    data: TransferEquipmentData,
): Promise<EquipmentTransferResponse["data"]> {
    const response =
        await api.post<EquipmentTransferResponse>(
            `/api/inventory/equipment-assignments/${id}/transfer`,
            data,
        );

    return response.data.data;
}

/**
 * Dispose equipment.
 *
 * Backend:
 * POST /api/inventory/equipment-assignments/{id}/dispose
 *
 * Disposal does not use disposed_at or returned_at.
 * Only remarks are accepted.
 */
export async function disposeEquipment(
    id: string,
    data?: DisposeEquipmentData,
): Promise<EquipmentAssignment> {
    const response =
        await api.post<EquipmentAssignmentResponse>(
            `/api/inventory/equipment-assignments/${id}/dispose`,
            data ?? {},
        );

    return response.data.data;
}
