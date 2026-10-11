import { Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import EmployeeForm from "@/components/service/hr-fcv/employee-form";
import { employeeApi } from "@/lib/api/hr-fcv/employee";
import PageTitle from "@/pages/settings/page-title";

import type { EmployeePayload } from "@/types/hr-fcv/employee";

export default function HrEditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<
    EmployeePayload | undefined
  >(undefined);

  /*
   * --------------------------------------------------------------------------
   * PAGE TITLE
   * --------------------------------------------------------------------------
   */

  const fullName = [
    initialValues?.first_name,
    initialValues?.middle_name,
    initialValues?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const pageTitle = fullName ? `Edit Employee — ${fullName}` : "Edit Employee";

  /*
   * --------------------------------------------------------------------------
   * LOAD EMPLOYEE
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    if (!id) {
      notifications.show({
        title: "Employee not found",
        message: "No employee ID was provided.",
        color: "red",
      });

      navigate("/human-resource/manage");
      return;
    }

    const loadEmployee = async () => {
      setLoading(true);
      setInitialValues(undefined);

      try {
        const response = await employeeApi.show(id);
        const employee = response.data.data;

        // Only pass fields required by EmployeeForm / EmployeePayload.
        // Backend audit fields such as encoded_by and updated_by
        // are intentionally excluded.
        setInitialValues({
          first_name: employee.first_name,
          middle_name: employee.middle_name,
          last_name: employee.last_name,
          date_birth: employee.date_birth,
          email: employee.email,
          contact_number: employee.contact_number,
          section_id: employee.section_id,
          status: employee.status,
        });
      } catch (error: any) {
        console.error("Failed to load employee:", error);

        notifications.show({
          title: "Unable to load employee",
          message:
            error?.response?.data?.message ??
            "The employee could not be loaded.",
          color: "red",
        });

        navigate("/human-resource/manage");
      } finally {
        setLoading(false);
      }
    };

    void loadEmployee();
  }, [id, navigate]);

  /*
   * --------------------------------------------------------------------------
   * UPDATE EMPLOYEE
   * --------------------------------------------------------------------------
   */

  const handleSubmit = async (values: EmployeePayload) => {
    if (!id) {
      return;
    }

    setSubmitting(true);

    try {
      await employeeApi.update(id, values);

      notifications.show({
        title: "Employee updated",
        message: "The employee has been updated successfully.",
        color: "green",
      });

      navigate("/human-resource/manage");
    } catch (error) {
      console.error("Failed to update employee:", error);

      // Re-throw the error so EmployeeForm can handle
      // Laravel validation errors.
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * CANCEL
   * --------------------------------------------------------------------------
   */

  const handleCancel = () => {
    navigate("/human-resource/manage");
  };

  /*
   * --------------------------------------------------------------------------
   * RENDER
   * --------------------------------------------------------------------------
   */

  return (
    <Stack gap="lg">
      {/* Updates the title displayed in AppLayout */}
      <PageTitle title={pageTitle} />

      {/* PAGE HEADER */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xl" fw={700}>
            Edit Employee
          </Text>

          <Text size="sm" c="dimmed">
            Update the employee&apos;s information and organization assignment.
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
        initialValues={initialValues}
        submitLabel="Update Employee"
        submitting={submitting}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Stack>
  );
}
