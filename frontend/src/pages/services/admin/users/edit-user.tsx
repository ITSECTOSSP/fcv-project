import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";

import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import UserForm from "@/components/service/auth-fcv/user-form";
import { useEditUser } from "@/lib/hook/auth-fcv/edit-user";
import PageTitle from "@/pages/settings/page-title";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { user } = useEditUser(id);

  const displayName = user?.name?.trim();

  const pageTitle = displayName ? `Edit User — ${displayName}` : "Edit User";

  const handleCancel = () => {
    navigate("/admin/users");
  };

  const handleSuccess = () => {
    navigate("/admin/users");
  };

  return (
    
      <Stack gap="xl">
        {/* SHARED APP LAYOUT PAGE TITLE */}
        <PageTitle title={pageTitle} />

        {/* HEADER */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={2} c="var(--text-h)">
              Edit User
            </Title>

            <Text size="sm" c="var(--text-muted)">
              Update the user's account information and access.
            </Text>
          </Stack>

          <Button
            variant="default"
            leftSection={<ArrowLeft size={17} />}
            onClick={handleCancel}
          >
            Back to Users
          </Button>
        </Group>

        {/* USER FORM */}
        <UserForm
          mode="edit"
          userId={id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Stack>
  );
}
