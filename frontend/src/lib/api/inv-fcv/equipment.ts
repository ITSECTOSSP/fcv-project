import api from "@/lib/api/api";

import type {
    Equipment,
    EquipmentResponse,
    EquipmentsResponse,
    CreateEquipmentPayload,
    UpdateEquipmentPayload,
} from "@/types/inv-fcv/equipment";

export async function getEquipments(
    params?: {
        search?: string;
        equipment_type_ids?: string[];
        page?: number;
        per_page?: number;
    },
): Promise<EquipmentsResponse> {
    const response =
        await api.get<EquipmentsResponse>(
            "/api/inventory/equipments",
            {
                params,
                paramsSerializer: {
                    indexes: true,
                },
            },
        );

    return response.data;
}

export async function getEquipment(
    id: string,
): Promise<EquipmentResponse> {
    const response =
        await api.get<EquipmentResponse>(
            `/api/inventory/equipments/${id}`,
        );

    return response.data;
}

export async function createEquipment(
    payload: CreateEquipmentPayload,
): Promise<EquipmentResponse> {
    const response =
        await api.post<EquipmentResponse>(
            "/api/inventory/equipments",
            payload,
        );

    return response.data;
}

export async function updateEquipment(
    id: string,
    payload: UpdateEquipmentPayload,
): Promise<EquipmentResponse> {
    const response =
        await api.put<EquipmentResponse>(
            `/api/inventory/equipments/${id}`,
            payload,
        );

    return response.data;
}

export async function deleteEquipment(
    id: string,
): Promise<{ message: string }> {
    const response =
        await api.delete<{ message: string }>(
            `/api/inventory/equipments/${id}`,
        );

    return response.data;
}

