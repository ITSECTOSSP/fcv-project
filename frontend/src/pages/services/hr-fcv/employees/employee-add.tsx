import {
  Button,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EmployeeForm from "@/components/service/hr-fcv/employee-form";
import { employeeApi } from "@/lib/api/hr-fcv/employee";
import type { EmployeePayload } from "@/types/hr-fcv/employee";

export default function HrAddEmployee() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    values: EmployeePayload,
  ) => {
    setSubmitting(true);

    try {
      await employeeApi.store(values);

      notifications.show({
        title: "Employee added",
        message:
          "The employee has been added successfully.",
        color: "green",
      });

      navigate("/human-resource/manage");
    } catch (error) {
      console.error(
        "Failed to create employee:",
        error,
      );

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/human-resource/manage");
  };

  return (
    <Stack gap="lg">
      {/* PAGE HEADER */}
      <Group
        justify="space-between"
        align="flex-start"
      >
        <div>
          <Text size="xl" fw={700}>
            Add New Employee
          </Text>

          <Text size="sm" c="dimmed">
            Add a new employee to the Human
            Resources directory.
          </Text>
        </div>

        <Button
          variant="default"
          leftSection={<ArrowLeft size={17} />}
          onClick={handleCancel}
          disabled={submitting}
        >
          Back to Employees
        </Button>
      </Group>

      {/* EMPLOYEE FORM */}
      <EmployeeForm
        submitLabel="Add Employee"
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Stack>
  );
}