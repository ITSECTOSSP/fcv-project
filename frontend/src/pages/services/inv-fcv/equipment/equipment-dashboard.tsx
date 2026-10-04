import { useEffect, useState } from "react";

import { Button, Group, Stack, Text } from "@mantine/core";

import { Plus } from "lucide-react";

import EquipmentTable from "@/components/service/inv-fcv/equipment/equipment-table";

import { getEquipments } from "@/lib/api/inv-fcv/equipment";
import { getEquipmentTypes } from "@/lib/api/inv-fcv/equipment-types";

import type { Equipment } from "@/types/inv-fcv/equipment";
import type { EquipmentType } from "@/types/inv-fcv/equipment-types";

import { useNavigate } from "react-router-dom";

/* =====================================================
 * EQUIPMENTS
 * ===================================================== */

export default function Equipments() {
  const navigate = useNavigate();

  /* =====================================================
   * STATE
   * ===================================================== */

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
   * LOAD EQUIPMENTS
   * ===================================================== */

  const loadEquipments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEquipments({
        page: 1,
        per_page: 100,
      });

      setEquipments(response.data);
    } catch (error) {
      console.error("Failed to load equipments:", error);

      setError("Unable to load equipment records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
   * LOAD EQUIPMENT TYPES
   * ===================================================== */

  const loadEquipmentTypes = async () => {
    try {
      const response = await getEquipmentTypes({
        page: 1,
        per_page: 100,
      });

      setEquipmentTypes(response.data);
    } catch (error) {
      console.error("Failed to load equipment types:", error);
    }
  };

  /* =====================================================
   * INITIAL LOAD
   * ===================================================== */

  useEffect(() => {
    loadEquipments();
    loadEquipmentTypes();
  }, []);

  /* =====================================================
   * VIEW
   * ===================================================== */

  const handleView = (equipment: Equipment) => {
    /*
     * TODO:
     * Navigate to the equipment details page.
     */
    console.log("View equipment:", equipment);
  };

  /* =====================================================
   * EDIT
   * ===================================================== */

  const handleEdit = (equipment: Equipment) => {
    navigate(`/inventory/edit-equipment/${equipment.id}`);
  };

  /* =====================================================
   * ASSIGN
   * ===================================================== */

  const handleAssign = (equipment: Equipment) => {
    navigate(`/inventory/assign-equipment/${equipment.id}`);
  };

  /* =====================================================
   * DELETE
   * ===================================================== */

  const handleDelete = (equipment: Equipment) => {
    /*
     * TODO:
     * Add delete confirmation and
     * delete API call.
     */
    console.log("Delete equipment:", equipment);
  };

  /* =====================================================
   * RENDER
   * ===================================================== */

  return (
    <Stack gap="lg">
      {/* =====================================================
       * HEADER
       * ===================================================== */}

      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>
            Equipments
          </Text>

          <Text size="sm" c="dimmed">
            Manage and monitor office equipment inventory.
          </Text>
        </div>

        <Button
          leftSection={<Plus size={17} />}
          onClick={() => navigate("/inventory/create-equipment")}
        >
          Add Equipment
        </Button>
      </Group>

      {/* =====================================================
       * ERROR
       * ===================================================== */}

      {error && (
        <Text size="sm" c="red">
          {error}
        </Text>
      )}

      {/* =====================================================
       * EQUIPMENT TABLE
       * ===================================================== */}

      <EquipmentTable
        equipments={equipments}
        equipmentTypes={equipmentTypes}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onDelete={handleDelete}
      />
    </Stack>
  );
}
