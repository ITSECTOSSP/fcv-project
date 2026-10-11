import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmployeeTable from "@/components/service/hr-fcv/employee-table";

import { divisionApi } from "@/lib/api/hr-fcv/division";
import { employeeApi } from "@/lib/api/hr-fcv/employee";
import { sectionApi } from "@/lib/api/hr-fcv/section";

import type { Division, DivisionFilters } from "@/types/hr-fcv/division";

import type { Section, SectionFilters } from "@/types/hr-fcv/section";

import type {
  Employee,
  EmployeeFilters,
  EmployeeStatus,
} from "@/types/hr-fcv/employee";

export default function ManageEmployees() {
  const navigate = useNavigate();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | null>(null);
  const [divisionId, setDivisionId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // --------------------------------------------------
  // LOAD DIVISIONS
  // --------------------------------------------------

  useEffect(() => {
    const loadDivisions = async () => {
      try {
        setLoadingDivisions(true);

        const params: DivisionFilters = {
          per_page: 100,
        };

        const response = await divisionApi.index(params);

        setDivisions(response.data.data);
      } catch (error) {
        console.error("Failed to load divisions:", error);
      } finally {
        setLoadingDivisions(false);
      }
    };

    void loadDivisions();
  }, []);

  // --------------------------------------------------
  // LOAD SECTIONS
  // --------------------------------------------------

  useEffect(() => {
    const loadSections = async () => {
      try {
        setLoadingSections(true);

        const params: SectionFilters = {
          per_page: 100,
        };

        const response = await sectionApi.index(params);

        setSections(response.data.data);
      } catch (error) {
        console.error("Failed to load sections:", error);
      } finally {
        setLoadingSections(false);
      }
    };

    void loadSections();
  }, []);

  // --------------------------------------------------
  // LOAD EMPLOYEES
  // --------------------------------------------------

  const loadEmployees = useCallback(
    async (targetPage = page): Promise<void> => {
      setLoading(true);

      try {
        const params: EmployeeFilters = {
          search: search.trim() || undefined,
          status: status ?? undefined,

          division_ids: divisionId ? [Number(divisionId)] : undefined,

          section_ids: sectionId ? [Number(sectionId)] : undefined,

          page: targetPage,
          per_page: 15,
        };

        const response = await employeeApi.index(params);
        const result = response.data;

        // If the current page has become invalid, move to the
        // last available page and let the effect reload it.
        if (targetPage > result.last_page && result.last_page > 0) {
          setPage(result.last_page);
          return;
        }

        setEmployees(result.data);
        setLastPage(result.last_page);
      } catch (error) {
        console.error("Failed to load employees:", error);
      } finally {
        setLoading(false);
      }
    },
    [search, status, divisionId, sectionId, page],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const params: EmployeeFilters = {
          search: search.trim() || undefined,
          status: status ?? undefined,

          division_ids: divisionId ? [Number(divisionId)] : undefined,

          section_ids: sectionId ? [Number(sectionId)] : undefined,

          page,
          per_page: 15,
        };

        const response = await employeeApi.index(params);

        if (!cancelled) {
          setEmployees(response.data.data);
          setLastPage(response.data.last_page);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load employees:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, [search, status, divisionId, sectionId, page]);

  // --------------------------------------------------
  // DELETE EMPLOYEE
  // --------------------------------------------------

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const response = await employeeApi.destroy(employee.id);

      notifications.show({
        title: "Employee Deleted",
        message: response.data.message || "Employee deleted successfully.",
        color: "green",
      });

      // If this was the only employee on the current page,
      // return to the previous page when possible.
      if (employees.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await loadEmployees(page);
      }
    } catch (error) {
      console.error("Failed to delete employee:", error);

      const responseMessage =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string;
                  };
                };
              }
            ).response?.data?.message
          : undefined;

      const message =
        responseMessage ||
        (error instanceof Error ? error.message : undefined) ||
        "Unable to delete the employee. Please try again.";

      notifications.show({
        title: "Delete Failed",
        message,
        color: "red",
      });

      // Throwing lets EmployeeTable keep the modal open and
      // display the error inside its confirmation dialog.
      throw new Error(message);
    }
  };

  // --------------------------------------------------
  // SECTION OPTIONS
  // --------------------------------------------------

  const filteredSections = useMemo(() => {
    if (!divisionId) {
      return sections;
    }

    return sections.filter(
      (section) => section.division_id === Number(divisionId),
    );
  }, [sections, divisionId]);

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setStatus(null);
    setDivisionId(null);
    setSectionId(null);
    setPage(1);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <Stack gap="xl">
      {/* HEADER */}

      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Title order={2}>Manage Employees</Title>

          <Text c="dimmed">Manage and monitor employee records.</Text>
        </Stack>

        <Button
          leftSection={<Plus size={17} />}
          onClick={() => navigate("/human-resource/create-employee")}
        >
          Add Employee
        </Button>
      </Group>

      <EmployeeTable
        employees={employees}
        divisions={divisions}
        sections={filteredSections}
        loading={loading}
        loadingDivisions={loadingDivisions}
        loadingSections={loadingSections}
        search={search}
        status={status}
        divisionId={divisionId}
        sectionId={sectionId}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onDivisionChange={(value) => {
          setDivisionId(value);
          setSectionId(null);
          setPage(1);
        }}
        onSectionChange={(value) => {
          setSectionId(value);
          setPage(1);
        }}
        onClearFilters={resetFilters}
        page={page}
        lastPage={lastPage}
        onPageChange={setPage}
        onDelete={handleDeleteEmployee}
      />
    </Stack>
  );
}
